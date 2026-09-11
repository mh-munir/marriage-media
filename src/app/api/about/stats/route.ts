export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Blog, Profile, User } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const [activeUsers, premiumProfiles, verifiedProfiles, happyFamilies] = await Promise.all([
      User.countDocuments({ role: "user", isActive: true, isBlocked: false }),
      Profile.countDocuments({ isPremium: true, premiumExpiry: { $gt: new Date() } }),
      Profile.countDocuments({ isVisible: true, isDeactivated: false, isVerified: true }),
      Blog.countDocuments({ isPublished: true, category: /success stories/i }),
    ]);

    return NextResponse.json({ stats: { activeUsers, premiumProfiles, verifiedProfiles, happyFamilies } });
  } catch {
    return NextResponse.json({ error: "Unable to load About statistics" }, { status: 500 });
  }
}
