import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;

    // Get the current user's profile for matching
    const myProfile = await Profile.findOne({ userId: user._id }).lean();
    if (!myProfile) {
      return NextResponse.json(
        { error: "Complete your profile to get recommendations" },
        { status: 400 }
      );
    }

    // Target opposite gender
    const targetGender = myProfile.gender === "Male" ? "Female" : "Male";

    // Base filter
    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: { $ne: user._id },
      gender: targetGender,
    };

    // Get all potential matches (limit to reasonable set for scoring)
    const allProfiles = await Profile.find(filter)
      .select("firstName lastName gender age height weight bloodGroup religion caste subCaste motherTongue languages country division district area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues diet smoke drink hobbies aboutMe partnerPreference photos isPremium isVerified isProfileBoosted boostedAt lastActiveAt profileViews maritalStatus profileCreatedBy")
      .limit(500)
      .lean();

    // Score each profile based on compatibility with current user's profile
    const scoredProfiles = allProfiles.map((profile) => {
      let score = 0;
      let maxScore = 0;

      // Religion match (high weight)
      maxScore += 20;
      if (profile.religion === myProfile.religion) score += 20;

      // Caste match (if specified)
      if (myProfile.caste && profile.caste) {
        maxScore += 10;
        if (profile.caste === myProfile.caste) score += 10;
      }

      // Mother tongue match
      if (myProfile.motherTongue && profile.motherTongue) {
        maxScore += 5;
        if (profile.motherTongue === myProfile.motherTongue) score += 5;
      }

      // Age compatibility (closer age = better)
      maxScore += 15;
      const ageDiff = Math.abs(profile.age - myProfile.age);
      if (ageDiff <= 2) score += 15;
      else if (ageDiff <= 5) score += 12;
      else if (ageDiff <= 8) score += 8;
      else if (ageDiff <= 12) score += 4;

      // Education level compatibility
      maxScore += 10;
      const eduLevels = [
        "Primary",
        "Secondary",
        "Higher Secondary",
        "Diploma",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD",
        "Professional Degree",
      ];
      const myEduIdx = eduLevels.indexOf(myProfile.highestEducation);
      const theirEduIdx = eduLevels.indexOf(profile.highestEducation);
      if (myEduIdx !== -1 && theirEduIdx !== -1) {
        const eduDiff = Math.abs(myEduIdx - theirEduIdx);
        if (eduDiff === 0) score += 10;
        else if (eduDiff === 1) score += 8;
        else if (eduDiff === 2) score += 5;
      }

      // Location compatibility
      maxScore += 15;
      if (profile.division === myProfile.division) {
        score += 8;
        if (profile.district === myProfile.district) {
          score += 5;
          if (profile.area && myProfile.area && profile.area === myProfile.area) {
            score += 2;
          }
        }
      }

      // Family values compatibility
      if (myProfile.familyValues && profile.familyValues) {
        maxScore += 8;
        const familyValueOrder = ["Orthodox", "Traditional", "Moderate", "Liberal", "Secular"];
        const myIdx = familyValueOrder.indexOf(myProfile.familyValues);
        const theirIdx = familyValueOrder.indexOf(profile.familyValues);
        if (myIdx !== -1 && theirIdx !== -1) {
          const diff = Math.abs(myIdx - theirIdx);
          if (diff === 0) score += 8;
          else if (diff === 1) score += 5;
          else if (diff === 2) score += 2;
        }
      }

      // Diet compatibility
      if (myProfile.diet && profile.diet) {
        maxScore += 5;
        if (profile.diet === myProfile.diet) score += 5;
        else if (
          (myProfile.diet === "Halal" && profile.diet === "Non-Veg") ||
          (myProfile.diet === "Non-Veg" && profile.diet === "Halal")
        ) {
          score += 3;
        }
      }

      // Hobbies overlap
      if (myProfile.hobbies?.length && profile.hobbies?.length) {
        maxScore += 7;
        const commonHobbies = myProfile.hobbies.filter((h: string) =>
          profile.hobbies.includes(h)
        );
        const hobbyScore = Math.min(commonHobbies.length * 2, 7);
        score += hobbyScore;
      }

      // Lifestyle compatibility (smoke/drink)
      if (myProfile.smoke && profile.smoke) {
        maxScore += 3;
        if (profile.smoke === myProfile.smoke) score += 3;
        else if (myProfile.smoke === "No" && profile.smoke === "No") score += 3;
      }

      // Bonus for verified profiles
      maxScore += 3;
      if (profile.isVerified) score += 3;

      // Calculate percentage
      const compatibility = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;

      return {
        ...profile,
        compatibility,
        score,
      };
    });

    // Sort by compatibility score (highest first)
    scoredProfiles.sort((a, b) => b.compatibility - a.compatibility);

    // Paginate
    const total = scoredProfiles.length;
    const paginatedProfiles = scoredProfiles.slice(skip, skip + limit);

    return NextResponse.json({
      profiles: paginatedProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}