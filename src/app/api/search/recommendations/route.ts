export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Favorite, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/profile-matching";
import { ensurePublicIdForProfile } from "@/lib/public-id";
import { getActiveSubscription } from "@/lib/profile-access";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const canViewProfileImages = Boolean(await getActiveSubscription(user._id));

    const { searchParams } = new URL(request.url);
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "12", 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 12;
    const skip = (page - 1) * limit;

    // Get the current user's profile for matching
    const myProfile = await Profile.findOne({ userId: user._id }).lean();
    if (!myProfile) {
      return NextResponse.json({ profiles: [], needsProfile: true });
    }

    // Target opposite gender
    const targetGender = myProfile.gender === "Male" ? "Female" : "Male";

    // Base filter
    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: { $ne: user._id, $exists: true },
      gender: targetGender,
    };

    // Get all potential matches (limit to reasonable set for scoring)
    const allProfiles = await Profile.find(filter)
      .select("userId publicId firstName lastName gender age height weight bloodGroup religion caste subCaste motherTongue languages country division district thana union area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues diet smoke drink hobbies partnerPreference partnerPreferences photos isPremium isVerified isProfileBoosted boostedAt lastActiveAt profileViews maritalStatus profileCreatedBy createdAt")
      .limit(500)
      .lean();

    const favoriteRecords = await Favorite.find({
      userId: user._id,
    }).select("profileId").lean<{ profileId: typeof user._id }[]>();
    const favoriteIds = new Set(favoriteRecords.map((favorite) => favorite.profileId.toString()));

    // Score each profile based on compatibility with current user's profile
    const scoredProfiles = allProfiles.map((profile) => {
      let score = 0;

      // Religion match (high weight)
      if (profile.religion === myProfile.religion) score += 20;

      // Caste match (if specified)
      if (myProfile.caste && profile.caste) {
        if (profile.caste === myProfile.caste) score += 10;
      }

      // Mother tongue match
      if (myProfile.motherTongue && profile.motherTongue) {
        if (profile.motherTongue === myProfile.motherTongue) score += 5;
      }

      // Age compatibility (closer age = better)
      const ageDiff = Math.abs(profile.age - myProfile.age);
      if (ageDiff <= 2) score += 15;
      else if (ageDiff <= 5) score += 12;
      else if (ageDiff <= 8) score += 8;
      else if (ageDiff <= 12) score += 4;

      // Education level compatibility
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
      }
      // Location compatibility
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
        if (profile.diet === myProfile.diet) score += 5;
        else if (
          (myProfile.diet === "Halal" && profile.diet === "Non-Veg") ||
          (myProfile.diet === "Non-Veg" && profile.diet === "Halal")
        ) {
          score += 3;
        }
      }

      // Hobbies overlap
      if (Array.isArray(myProfile.hobbies) && Array.isArray(profile.hobbies)) {
        const commonHobbies = myProfile.hobbies.filter((h: string) =>
          profile.hobbies?.includes(h)
        );
        const hobbyScore = Math.min(commonHobbies.length * 2, 7);
        score += hobbyScore;
      }

      // Lifestyle compatibility (smoke/drink)
      if (myProfile.smoke && profile.smoke) {
        if (profile.smoke === myProfile.smoke) score += 3;
        else if (myProfile.smoke === "No" && profile.smoke === "No") score += 3;
      }

      // Bonus for verified profiles
      if (profile.isVerified) score += 3;

      return {
        ...profile,
        userId: profile.userId ? String(profile.userId) : "",
        isFavorite: favoriteIds.has(String(profile.userId)),
        compatibility: calculateMatchScore(profile, myProfile),
        score,
      };
    }).filter((profile) => profile.compatibility > 50);

    // Sort by compatibility score (highest first)
    scoredProfiles.sort((a, b) => b.compatibility - a.compatibility || b.score - a.score);

    // Paginate
    const total = scoredProfiles.length;
    const paginatedProfiles = await Promise.all(
      scoredProfiles.slice(skip, skip + limit).map(async ({ photos, ...profile }) => ({
        ...profile,
        photos: canViewProfileImages ? photos : [],
        publicId: await ensurePublicIdForProfile(profile.userId, profile.publicId),
      }))
    );

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
    console.error("Recommendations request failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
