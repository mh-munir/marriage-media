export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, User, Verification } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateAge, validatePhoneNumber } from "@/lib/utils";
import { notifyProfileMatches } from "@/lib/profile-matching";
import { allocatePublicId } from "@/lib/public-id";
import { createNotification } from "@/lib/notifications";
import { normalizeProfileDistricts } from "@/lib/location-normalization";

let aboutMeMigrationComplete = false;

async function removeLegacyAboutMeField() {
  if (aboutMeMigrationComplete) return;
  await Profile.updateMany({ aboutMe: { $exists: true } }, { $unset: { aboutMe: 1 } });
  aboutMeMigrationComplete = true;
}

function calculateProfileCompletion(body: Record<string, unknown>) {
  const completionFields = [
    body.firstName,
    body.lastName,
    body.gender,
    body.dateOfBirth,
    body.height,
    body.maritalStatus,
    body.religion,
    body.motherTongue,
    body.country,
    body.division,
    body.district,
    body.partnerPreference ||
      (body.partnerPreferences && Object.values(body.partnerPreferences).some(Boolean)),
  ];

  const completedFields = completionFields.filter((value) => Boolean(value && String(value).trim())).length;
  return Math.round((completedFields / completionFields.length) * 100);
}

function getMissingRequiredFields(body: Record<string, unknown>) {
  const requiredFields = [
    ["firstName", "First Name"],
    ["lastName", "Last Name"],
    ["gender", "Gender"],
    ["dateOfBirth", "Date of Birth"],
    ["height", "Height"],
    ["maritalStatus", "Marital Status"],
    ["religion", "Religion"],
    ["motherTongue", "Mother Tongue"],
    ["country", "Country"],
    ["division", "Division"],
    ["district", "District"],
  ] as const;
  const missingFields: string[] = requiredFields
    .filter(([field]) => !String(body[field] || "").trim())
    .map(([, label]) => label);
  if (!String(body.fatherName || "").trim()) missingFields.push("Father's Name");
  if (!String(body.motherName || "").trim()) missingFields.push("Mother's Name");
  if (!String(body.division || "").trim() || !String(body.district || "").trim()) missingFields.push("Present Address location");
  if (!body.permanentLocation || typeof body.permanentLocation !== "object" || !String((body.permanentLocation as Record<string, unknown>).division || "").trim() || !String((body.permanentLocation as Record<string, unknown>).district || "").trim()) missingFields.push("Permanent Address location");
  if (!String(body.thana || "").trim() || !String(body.union || "").trim() || !String(body.area || "").trim()) missingFields.push("Complete Present Address");
  const permanentLocation = body.permanentLocation as Record<string, unknown> | undefined;
  if (!String(permanentLocation?.country || "").trim() || !String(permanentLocation?.thana || "").trim() || !String(permanentLocation?.union || "").trim() || !String(permanentLocation?.area || "").trim()) missingFields.push("Complete Permanent Address");
  if (!Array.isArray(body.educationDetails) || !(body.educationDetails as Record<string, unknown>[]).some((entry) => String(entry.instituteName || "").trim() || String(entry.year || "").trim())) missingFields.push("At least one Education field");
  const requiredHabits = ["Exercise", "Reading", "Travel", "Cooking", "Smoking", "Drinking"];
  if (!body.habitAnswers || typeof body.habitAnswers !== "object" || requiredHabits.some((habit) => !["Yes", "No"].includes(String((body.habitAnswers as Record<string, unknown>)[habit])))) missingFields.push("Yes/No answer for every habit");
  if (!body.guardianRelation || !String(body.guardianName || "").trim() || !validatePhoneNumber(String(body.guardianMobileNumber || ""))) {
    missingFields.push("Guardian details (with a valid 11 digit mobile number)");
  }
  const partnerPreferences = body.partnerPreferences;
  if (!partnerPreferences || typeof partnerPreferences !== "object" || !String((partnerPreferences as Record<string, unknown>).religion || "").trim()) {
    missingFields.push("Expected Partner religion");
  }
  if (!["Yes", "No"].includes(String(body.familyAwareOfBiodata)) || !["Yes", "No"].includes(String(body.informationAccurate)) || !["Yes", "No"].includes(String(body.truthDeclaration)) || body.acceptsFalseInformationLiability !== true) missingFields.push("All declarations");
  return missingFields;
}

async function submitProfileReview(userId: string) {
  const latestReview = await Verification.findOne({ userId, type: "profile" }).sort({ createdAt: -1 });
  if (latestReview?.status === "pending" || latestReview?.status === "under_review" || latestReview?.status === "rejected") return;

  await Verification.create({
    userId,
    type: "profile",
    documentUrl: "profile-review",
    documentType: "profile",
    contributesToBadge: false,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    timeline: [{ status: "pending", timestamp: new Date(), note: "Profile completed and submitted for admin review" }],
  });

  const admins = await User.find({ role: { $in: ["admin", "superadmin"] }, isActive: true }).select("_id").lean();
  await Promise.all(admins.map((admin) => createNotification({
    userId: admin._id.toString(),
    type: "verification",
    title: "Profile ready for verification",
    message: "A member completed their profile and is waiting for approval.",
    link: "/admin/verification",
    channels: ["inapp"],
  })));
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    if (user.role !== "user") return NextResponse.json({ error: "Admin accounts cannot have public profiles." }, { status: 403 });
    await removeLegacyAboutMeField();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json({
        profile: null,
        mobileNumber: user.phone || "",
        whatsappNumber: user.whatsappNumber || "",
        onboarding: {
          ...(user.onboardingData || {}),
          firstName: user.onboardingData?.firstName || user.firstName || "",
          lastName: user.onboardingData?.lastName || user.lastName || "",
          gender: user.onboardingData?.gender || user.gender || "",
        },
      });
    }

    return NextResponse.json({
      profile,
      mobileNumber: user.phone || "",
      whatsappNumber: user.whatsappNumber || "",
      onboarding: user.onboardingData || {},
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    if (user.role !== "user") return NextResponse.json({ error: "Admin accounts cannot have public profiles." }, { status: 403 });
    await removeLegacyAboutMeField();

    const body = await request.json();
    delete body.aboutMe;
    Object.assign(body, normalizeProfileDistricts(body));

    const missingFields = getMissingRequiredFields(body);
    if (missingFields.length || !Array.isArray(body.photos) || body.photos.length < 1 || body.photos.length > 4) {
      if (!Array.isArray(body.photos) || body.photos.length < 1 || body.photos.length > 4) missingFields.push("1 to 4 profile photos");
      return NextResponse.json(
        { error: `Please complete these fields before saving: ${missingFields.join(", ")}.` },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: user._id });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PUT to update." },
        { status: 409 }
      );
    }

    // Calculate age
    const age = calculateAge(body.dateOfBirth);

    // Create profile
    const publicId = user.publicId || await allocatePublicId();
    if (!user.publicId) {
      await User.findByIdAndUpdate(user._id, { publicId });
    }

    const profile = await Profile.create({
      userId: user._id,
      publicId,
      ...body,
      age,
      isVisible: false,
    });

    const completionPercentage = calculateProfileCompletion(body);

    // Update user profile completion
    await User.findByIdAndUpdate(user._id, {
      profileCompleted: completionPercentage,
      ...(typeof body.whatsappNumber === "string" ? { whatsappNumber: body.whatsappNumber } : {}),
      ...(body.habitAnswers ? { onboardingData: { ...(user.onboardingData || {}), habitAnswers: body.habitAnswers } } : {}),
    });
    if (completionPercentage === 100) await submitProfileReview(user._id.toString());
    await notifyProfileMatches(user._id.toString());

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    if (user.role !== "user") return NextResponse.json({ error: "Admin accounts cannot have public profiles." }, { status: 403 });
    await removeLegacyAboutMeField();

    const body = await request.json();
    delete body.aboutMe;
    Object.assign(body, normalizeProfileDistricts(body));

    const missingFields = getMissingRequiredFields(body);
    if (missingFields.length || !Array.isArray(body.photos) || body.photos.length < 1 || body.photos.length > 4) {
      if (!Array.isArray(body.photos) || body.photos.length < 1 || body.photos.length > 4) missingFields.push("1 to 4 profile photos");
      return NextResponse.json(
        { error: `Please complete these fields before saving: ${missingFields.join(", ")}.` },
        { status: 400 }
      );
    }

    // Calculate age if dateOfBirth is provided
    if (body.dateOfBirth) {
      body.age = calculateAge(body.dateOfBirth);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: body, $unset: { aboutMe: 1 } },
      { returnDocument: "after", runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const completionPercentage = calculateProfileCompletion(body);
    await User.findByIdAndUpdate(user._id, {
      profileCompleted: completionPercentage,
      ...(typeof body.whatsappNumber === "string" ? { whatsappNumber: body.whatsappNumber } : {}),
      ...(body.habitAnswers ? { onboardingData: { ...(user.onboardingData || {}), habitAnswers: body.habitAnswers } } : {}),
    });
    if (completionPercentage === 100) await submitProfileReview(user._id.toString());
    await notifyProfileMatches(user._id.toString());

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
