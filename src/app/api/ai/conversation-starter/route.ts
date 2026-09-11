export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { generateConversationStarters, generateIcebreakers } from "@/lib/ai-conversation-starter";

// Generate conversation starters for a match
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { matchUserId } = body;

    if (!matchUserId) {
      return NextResponse.json({ error: "Match user ID is required" }, { status: 400 });
    }

    const [userProfile, matchProfile] = await Promise.all([
      Profile.findOne({ userId: user._id }).lean(),
      Profile.findOne({ userId: matchUserId }).lean(),
    ]);

    if (!userProfile || !matchProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const starters = generateConversationStarters(
      {
        firstName: userProfile.firstName,
        gender: userProfile.gender,
        age: userProfile.age,
        profession: userProfile.profession,
        highestEducation: userProfile.highestEducation,
        religion: userProfile.religion,
        hobbies: userProfile.hobbies,
        familyValues: userProfile.familyValues,
        diet: userProfile.diet,
        country: userProfile.country,
        division: userProfile.division,
        photos: userProfile.photos,
      },
      {
        firstName: matchProfile.firstName,
        gender: matchProfile.gender,
        age: matchProfile.age,
        profession: matchProfile.profession,
        highestEducation: matchProfile.highestEducation,
        religion: matchProfile.religion,
        hobbies: matchProfile.hobbies,
        familyValues: matchProfile.familyValues,
        diet: matchProfile.diet,
        country: matchProfile.country,
        division: matchProfile.division,
        photos: matchProfile.photos,
      }
    );

    const icebreakers = generateIcebreakers(
      {
        firstName: userProfile.firstName,
        gender: userProfile.gender,
        age: userProfile.age,
        profession: userProfile.profession,
        highestEducation: userProfile.highestEducation,
        religion: userProfile.religion,
        hobbies: userProfile.hobbies,
        familyValues: userProfile.familyValues,
        diet: userProfile.diet,
        country: userProfile.country,
        division: userProfile.division,
        photos: userProfile.photos,
      },
      {
        firstName: matchProfile.firstName,
        gender: matchProfile.gender,
        age: matchProfile.age,
        profession: matchProfile.profession,
        highestEducation: matchProfile.highestEducation,
        religion: matchProfile.religion,
        hobbies: matchProfile.hobbies,
        familyValues: matchProfile.familyValues,
        diet: matchProfile.diet,
        country: matchProfile.country,
        division: matchProfile.division,
        photos: matchProfile.photos,
      }
    );

    return NextResponse.json({ starters, icebreakers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}