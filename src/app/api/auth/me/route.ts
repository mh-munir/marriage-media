export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();
    const profile = await Profile.findOne({ userId: user._id });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        avatar: user.avatarUrl || profile?.photos?.find((p: { isPrimary: boolean }) => p.isPrimary)?.url || "",
        isPremium: profile?.isPremium || false,
        premiumPlan: profile?.premiumPlan || "",
        isVerified: profile?.isVerified || false,
        profileCompleted: user.profileCompleted || 0,
        gender: profile?.gender || user.gender || undefined,
        onboardingCompleted: Boolean(
          user.onboardingCompleted || (profile?.firstName && profile?.lastName && profile?.gender)
        ),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}