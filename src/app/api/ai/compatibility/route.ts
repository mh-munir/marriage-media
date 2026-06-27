export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateCompatibilityScore } from "@/lib/ai-match";

// Calculate compatibility between current user and another profile
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    const [userProfile, targetProfile] = await Promise.all([
      Profile.findOne({ userId: user._id }).lean(),
      Profile.findOne({ userId: targetUserId }).lean(),
    ]);

    if (!userProfile || !targetProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const score = calculateCompatibilityScore(userProfile as never, targetProfile as never);

    // Determine matching factors
    const factors: { name: string; match: boolean; weight: number }[] = [
      { name: "Religion", match: userProfile.religion === targetProfile.religion, weight: 25 },
      { name: "Education", match: userProfile.highestEducation === targetProfile.highestEducation, weight: 15 },
      { name: "Family Values", match: userProfile.familyValues === targetProfile.familyValues, weight: 10 },
      { name: "Diet", match: userProfile.diet === targetProfile.diet || userProfile.diet === "No Preference" || targetProfile.diet === "No Preference", weight: 5 },
      { name: "Location", match: userProfile.country === targetProfile.country, weight: 15 },
      { name: "Age Compatibility", match: Math.abs(userProfile.age - targetProfile.age) <= 5, weight: 15 },
      { name: "Lifestyle", match: userProfile.smoke === targetProfile.smoke && userProfile.drink === targetProfile.drink, weight: 5 },
      { name: "Hobbies", match: userProfile.hobbies.some(h => targetProfile.hobbies.includes(h)), weight: 10 },
    ];

    return NextResponse.json({ score, factors });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}