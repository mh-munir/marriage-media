export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { Payment, Profile, ProfileDetailAccess, User } from "@/models";

const FULL_ACCESS_FIELDS = "firstName lastName gender age height weight bloodGroup maritalStatus profileCreatedBy religion caste subCaste motherTongue languages country division district thana union area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues fatherName fatherContactNumber fatherProfession motherName motherProfession numberOfSiblings siblingDetails siblings diet smoke drink hobbies partnerPreference partnerPreferences photos isPremium isVerified profileViews showContactInfo createdAt";
const FREE_FIELDS = "gender age maritalStatus religion country division district thana union highestEducation profession familyType familyStatus familyValues fatherName fatherProfession motherName motherProfession numberOfSiblings siblingDetails siblings diet smoke drink hobbies partnerPreference partnerPreferences isVerified profileViews createdAt";

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

    const payment = viewer
      ? await Payment.findOne({ userId: viewer._id, status: "completed", expiryDate: { $gt: new Date() } }).sort({ expiryDate: -1 }).lean()
      : null;
    const limit = Number(payment?.metadata?.profileDetailLimit);
    const isUnlimited = limit === -1;
    let fullAccess = false;
    let used = 0;
    if (viewer && payment && (isUnlimited || Number.isFinite(limit))) {
      const existing = await ProfileDetailAccess.findOne({ viewerId: viewer._id, profileUserId: userId, paymentId: payment._id, expiresAt: { $gt: new Date() } }).lean();
      used = await ProfileDetailAccess.countDocuments({ viewerId: viewer._id, paymentId: payment._id, expiresAt: { $gt: new Date() } });
      if (existing || isUnlimited || used < limit) {
        fullAccess = true;
        if (!existing) {
          try { await ProfileDetailAccess.create({ viewerId: viewer._id, profileUserId: userId, paymentId: payment._id, expiresAt: payment.expiryDate }); used += 1; }
          catch { fullAccess = Boolean(await ProfileDetailAccess.exists({ viewerId: viewer._id, profileUserId: userId, paymentId: payment._id })); }
        }
      }
    }

    const profile = await Profile.findOne({
      userId,
      isVisible: true,
      isDeactivated: false,
    })
      .select(
        fullAccess ? FULL_ACCESS_FIELDS : FREE_FIELDS
      )
      .lean();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const owner = fullAccess && profile.showContactInfo
      ? await User.findById(userId).select("phone").lean()
      : null;

    return NextResponse.json({
      profile: {
        ...profile,
        _id: profile._id.toString(),
        contactNumber: owner?.phone || "",
        photos: fullAccess ? profile.photos.map((photo) => ({
          url: photo.url,
          isPrimary: photo.isPrimary,
        })) : [],
      },
      access: { fullAccess, limit: Number.isFinite(limit) ? limit : 0, used, expiresAt: payment?.expiryDate || null },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
