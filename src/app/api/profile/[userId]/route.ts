export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile, User } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase();
    await requireAuth(request);

    const { userId } = await params;
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid profile id." }, { status: 400 });
    }

    const profile = await Profile.findOne({
      userId,
      isVisible: true,
      isDeactivated: false,
    })
      .select(
        "firstName lastName gender age height weight bloodGroup maritalStatus profileCreatedBy religion caste subCaste motherTongue languages country division district thana union area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues fatherName fatherContactNumber fatherProfession motherName motherProfession numberOfSiblings siblingDetails siblings diet smoke drink hobbies aboutMe partnerPreference partnerPreferences photos isPremium isVerified profileViews showContactInfo createdAt"
      )
      .lean();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const owner = profile.showContactInfo
      ? await User.findById(userId).select("phone").lean()
      : null;

    return NextResponse.json({
      profile: {
        ...profile,
        _id: profile._id.toString(),
        contactNumber: owner?.phone || "",
        photos: profile.photos.map((photo) => ({
          url: photo.url,
          isPrimary: photo.isPrimary,
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}