export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, User } from "@/models";
import { syncRejectedProfileUserFlags } from "@/lib/rejected-profile-users";

export async function GET() {
  try {
    await connectToDatabase();
    await syncRejectedProfileUserFlags();
    const activeUserFilter = {
      role: "user",
      isPhoneVerified: true,
      isActive: true,
      isBlocked: false,
      isProfileVerificationRejected: { $ne: true },
    } as const;
    const now = new Date();
    const activeUserIds = await User.distinct("_id", activeUserFilter);
    const verifiedProfileFilter = {
      userId: { $in: activeUserIds },
      isVisible: true,
      isDeactivated: false,
      isVerified: true,
    };
    const [verifiedUserIds, maleUserIds, femaleUserIds, premiumUserIds] = await Promise.all([
      Profile.distinct("userId", verifiedProfileFilter),
      Profile.distinct("userId", { ...verifiedProfileFilter, gender: "Male" }),
      Profile.distinct("userId", { ...verifiedProfileFilter, gender: "Female" }),
      Profile.distinct("userId", {
        ...verifiedProfileFilter,
        isPremium: true,
        premiumExpiry: { $gt: now },
      }),
    ]);

    const activeUsers = verifiedUserIds.length;
    const maleUsers = maleUserIds.length;
    const femaleUsers = femaleUserIds.length;
    const premiumUsers = premiumUserIds.length;

    return NextResponse.json({ stats: { activeUsers, maleUsers, femaleUsers, premiumUsers } });
  } catch (error) {
    console.error("Unable to load About statistics:", error);
    return NextResponse.json({ error: "Unable to load About statistics" }, { status: 500 });
  }
}
