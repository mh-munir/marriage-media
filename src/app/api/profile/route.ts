export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, User, Verification } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateAge } from "@/lib/utils";
import { notifyProfileMatches } from "@/lib/profile-matching";
import { allocatePublicId } from "@/lib/public-id";
import { createNotification } from "@/lib/notifications";

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
    body.highestEducation,
    body.profession,
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
    ["highestEducation", "Highest Education"],
    ["profession", "Profession"],
  ] as const;
  const missingFields: string[] = requiredFields
    .filter(([field]) => !String(body[field] || "").trim())
    .map(([, label]) => label);
  if (body.fatherContactNumber && !/^\d{11}$/.test(String(body.fatherContactNumber))) {
    missingFields.push("Father's Contact Number must be exactly 11 digits");
  }
  const partnerPreferences = body.partnerPreferences;
  if (!partnerPreferences || typeof partnerPreferences !== "object" || !Object.values(partnerPreferences).some(Boolean)) {
    missingFields.push("At least one Expected Partner preference");
  }
  return missingFields;
}

async function submitProfileReview(userId: string) {
  const existingReview = await Verification.findOne({
    userId,
    type: "profile",
    status: { $in: ["pending", "under_review", "approved"] },
  });
  if (existingReview) return;

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
    await removeLegacyAboutMeField();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json({ profile: null, mobileNumber: user.phone || "" });
    }

    return NextResponse.json({ profile, mobileNumber: user.phone || "" });
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
    await removeLegacyAboutMeField();

    const body = await request.json();
    delete body.aboutMe;

    const missingFields = getMissingRequiredFields(body);
    if (missingFields.length || !Array.isArray(body.photos) || body.photos.length < 2) {
      if (!Array.isArray(body.photos) || body.photos.length < 2) missingFields.push("At least 2 profile photos");
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
    await User.findByIdAndUpdate(user._id, { profileCompleted: completionPercentage });
    await Profile.findByIdAndUpdate(profile._id, { isVisible: false });
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
    await removeLegacyAboutMeField();

    const body = await request.json();
    delete body.aboutMe;

    const missingFields = getMissingRequiredFields(body);
    if (missingFields.length || !Array.isArray(body.photos) || body.photos.length < 2) {
      if (!Array.isArray(body.photos) || body.photos.length < 2) missingFields.push("At least 2 profile photos");
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
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const completionPercentage = calculateProfileCompletion(body);
    await User.findByIdAndUpdate(user._id, { profileCompleted: completionPercentage });
    await Profile.findByIdAndUpdate(profile._id, { isVisible: false });
    if (completionPercentage === 100) await submitProfileReview(user._id.toString());
    await notifyProfileMatches(user._id.toString());

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}