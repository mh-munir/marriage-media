export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { Profile, User } from "@/models";
import { getActiveSubscription, reserveProfileDetailAccess } from "@/lib/profile-access";
import { normalizeProfileDistricts } from "@/lib/location-normalization";

const FULL_ACCESS_FIELDS = "firstName lastName gender age height weight bloodGroup complexion hasMajorHealthIssue majorHealthIssueDetails maritalStatus maritalStatusDate childrenCount profileCreatedBy religion caste subCaste motherTongue languages country division district thana union area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues fatherName guardianRelation guardianName guardianMobileNumber fatherProfession motherName permanentAddress presentAddress permanentLocation educationDetails aboutYourself familyAwareOfBiodata informationAccurate truthDeclaration acceptsFalseInformationLiability motherProfession numberOfSiblings siblingDetails siblings diet smoke drink hobbies partnerPreference partnerPreferences photos isPremium isVerified profileViews showContactInfo createdAt";
const FREE_FIELDS = "gender age height bloodGroup complexion hasMajorHealthIssue majorHealthIssueDetails maritalStatus maritalStatusDate religion country division district thana union highestEducation institution profession familyType familyStatus familyValues fatherProfession motherProfession numberOfSiblings siblingDetails siblings diet smoke drink hobbies partnerPreference partnerPreferences isVerified profileViews createdAt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase();
    const viewer = await getCurrentUser(request);

    const { userId } = await params;
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid profile id." }, { status: 400 });
    }

    if (viewer && userId === viewer._id.toString()) return NextResponse.json({ error: "You cannot view your own public profile here." }, { status: 400 });
    const profileOwner = await User.findById(userId).select("role isBlocked isActive").lean();
    if (!profileOwner || profileOwner.role !== "user") return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    if (profileOwner.isBlocked || !profileOwner.isActive) {
      return NextResponse.json({ error: "This profile is currently unavailable." }, { status: 403 });
    }

    const profileFilter = {
      userId,
      isVisible: true,
      isDeactivated: false,
    };
    const limitedProfile = await Profile.findOne(profileFilter).select(FREE_FIELDS).lean();

    if (!limitedProfile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const payment = viewer ? await getActiveSubscription(viewer._id) : null;
    const access = payment && viewer
      ? await reserveProfileDetailAccess(payment, viewer._id, userId)
      : { allowed: false, limit: 0, used: 0 };
    const fullAccess = access.allowed;
    const profile = fullAccess
      ? await Profile.findOne(profileFilter).select(FULL_ACCESS_FIELDS).lean()
      : limitedProfile;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const ownerUser = fullAccess
      ? await User.findById(userId).select("onboardingData whatsappNumber").lean()
      : undefined;
    const onboardingData = ownerUser?.onboardingData;
    const owner = fullAccess && profile.showContactInfo
      ? await User.findById(userId).select("phone").lean()
      : null;

    return NextResponse.json({
      profile: {
        ...normalizeProfileDistricts(profile),
        ...(fullAccess ? {
          permanentLocation: profile.permanentLocation || onboardingData?.permanentLocation,
          educationDetails: profile.educationDetails?.length ? profile.educationDetails : onboardingData?.educationDetails,
          familyAwareOfBiodata: profile.familyAwareOfBiodata || onboardingData?.familyAwareOfBiodata,
          informationAccurate: profile.informationAccurate || onboardingData?.informationAccurate,
          truthDeclaration: profile.truthDeclaration || onboardingData?.truthDeclaration,
          acceptsFalseInformationLiability: profile.acceptsFalseInformationLiability ?? onboardingData?.acceptsFalseInformationLiability,
        } : {}),
        ...(fullAccess ? { whatsappNumber: ownerUser?.whatsappNumber || onboardingData?.whatsappNumber || "" } : {}),
        _id: profile._id.toString(),
        contactNumber: owner?.phone || "",
        photos: fullAccess ? profile.photos.map((photo) => ({
          url: photo.url,
          isPrimary: photo.isPrimary,
        })) : [],
      },
      access: { fullAccess, limit: access.limit, used: access.used, expiresAt: payment?.expiryDate || null },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
