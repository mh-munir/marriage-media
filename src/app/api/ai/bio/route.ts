export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { generateBio, generatePartnerPreferenceSuggestions } from "@/lib/ai-bio-generator";

// Generate AI bio
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const profile = await Profile.findOne({ userId: user._id }).lean();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const bio = generateBio({
      firstName: profile.firstName,
      gender: profile.gender,
      age: profile.age,
      profession: profile.profession,
      highestEducation: profile.highestEducation,
      religion: profile.religion,
      hobbies: profile.hobbies,
      familyValues: profile.familyValues,
      diet: profile.diet,
      partnerPreference: profile.partnerPreference,
      country: profile.country,
      division: profile.division,
      maritalStatus: profile.maritalStatus,
      height: profile.height,
    });

    const partnerSuggestions = generatePartnerPreferenceSuggestions({
      firstName: profile.firstName,
      gender: profile.gender,
      age: profile.age,
      profession: profile.profession,
      highestEducation: profile.highestEducation,
      religion: profile.religion,
      hobbies: profile.hobbies,
      familyValues: profile.familyValues,
      diet: profile.diet,
      country: profile.country,
      division: profile.division,
      maritalStatus: profile.maritalStatus,
    });

    return NextResponse.json({ bio, partnerSuggestions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}