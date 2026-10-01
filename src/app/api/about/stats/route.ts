export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Blog, Profile, User } from "@/models";
import { syncRejectedProfileUserFlags } from "@/lib/rejected-profile-users";

export async function GET() {
  try {
    await connectToDatabase();
    await syncRejectedProfileUserFlags();
    const [activeUsers, premiumProfiles, verifiedProfiles, happyFamilies] = await Promise.all([
      User.countDocuments({ role: "user", isActive: true, isBlocked: false, isProfileVerificationRejected: { $ne: true } }),
      Profile.countDocuments({ isPremium: true, premiumExpiry: { $gt: new Date() } }),
      Profile.countDocuments({ isVisible: true, isDeactivated: false, isVerified: true }),
      Blog.countDocuments({ isPublished: true, category: /success stories/i }),
    ]);

    return NextResponse.json({ stats: { activeUsers, premiumProfiles, verifiedProfiles, happyFamilies } });
  } catch {
    return NextResponse.json({ error: "Unable to load About statistics" }, { status: 500 });
  }
}
