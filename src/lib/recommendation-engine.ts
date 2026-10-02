import connectToDatabase from "./mongodb";
import { Profile, Interest, Favorite, ProfileView } from "@/models";
import type { IProfile } from "@/models";

interface RecommendationResult {
  profile: Partial<IProfile>;
  score: number;
  reasons: string[];
}

/**
 * Enhanced recommendation engine with weighted preferences.
 * Considers compatibility, user behavior, and collaborative signals.
 */
export async function getEnhancedRecommendations(
  userId: string,
  limit: number = 20
): Promise<RecommendationResult[]> {
  await connectToDatabase();

  const userProfile = await Profile.findOne({ userId }).lean() as Partial<IProfile> | null;
  if (!userProfile) return [];

  const oppositeGender = userProfile.gender === "Male" ? "Female" : "Male";

  // Get users the current user has already interacted with
  const [sentInterests, receivedInterests, favorites, profileViews] = await Promise.all([
    Interest.find({ senderId: userId }).select("receiverId").lean(),
    Interest.find({ receiverId: userId }).select("senderId").lean(),
    Favorite.find({ userId }).select("profileId").lean(),
    ProfileView.find({ viewerId: userId }).select("viewedId").lean(),
  ]);

  const interactedUserIds = new Set([
    ...sentInterests.map(i => i.receiverId?.toString()),
    ...receivedInterests.map(i => i.senderId?.toString()),
    ...favorites.map(f => f.profileId?.toString()),
    ...profileViews.map(v => v.viewedId?.toString()),
  ].filter(Boolean) as string[]);

  // Get candidates (exclude already interacted)
  const candidates = await Profile.find({
    userId: { $ne: userId, $nin: Array.from(interactedUserIds) },
    gender: oppositeGender,
    isVisible: true,
    isDeactivated: false,
  }).lean() as Partial<IProfile>[];

  // Score each candidate
  const scored = candidates.map(candidate => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Basic compatibility (0-40 points)
    const basicScore = calculateBasicCompatibility(userProfile, candidate);
    score += basicScore.score;
    reasons.push(...basicScore.reasons);

    // 2. Recency boost (0-15 points) - more recently active profiles
    if (candidate.lastActiveAt) {
      const daysSinceActive = (Date.now() - new Date(candidate.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive < 1) { score += 15; reasons.push("Active today"); }
      else if (daysSinceActive < 3) { score += 10; reasons.push("Active recently"); }
      else if (daysSinceActive < 7) { score += 5; reasons.push("Active this week"); }
    }

    // 3. Profile completeness boost (0-15 points)
    const completeness = calculateProfileCompleteness(candidate as Record<string, unknown>);
    score += Math.round(completeness * 0.15);
    if (completeness > 80) reasons.push("Complete profile");

    // 4. Premium boost (0-10 points)
    if (candidate.isPremium) {
      const premiumExpiry = candidate.premiumExpiry;
      if (premiumExpiry && new Date(premiumExpiry) > new Date()) {
        score += 10;
        reasons.push("Premium member");
      }
    }

    // 5. Verified boost (0-10 points)
    if (candidate.isVerified) {
      score += 10;
      reasons.push("Verified profile");
    }

    // 6. Photo count boost (0-10 points)
    const photos = candidate.photos;
    if (photos && photos.length > 0) {
      const approvedPhotos = photos.filter(p => p.isApproved).length;
      score += Math.min(approvedPhotos * 3, 10);
      if (approvedPhotos >= 3) reasons.push("Multiple photos");
    }

    return { profile: candidate, score: Math.min(score, 100), reasons };
  });

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function calculateBasicCompatibility(
  user: Partial<IProfile>,
  candidate: Partial<IProfile>
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Religion match (10 points)
  if (user.religion === candidate.religion) {
    score += 10;
    reasons.push("Same religion");
  }

  // Age compatibility (8 points)
  const ageDiff = Math.abs((user.age || 0) - (candidate.age || 0));
  if (ageDiff <= 3) { score += 8; reasons.push("Close age"); }
  else if (ageDiff <= 5) { score += 6; }
  else if (ageDiff <= 8) { score += 3; }

  // Education match (7 points)
  if (user.highestEducation === candidate.highestEducation) {
    score += 7;
    reasons.push("Similar education");
  }

  // Location match (8 points)
  if (user.country === candidate.country) {
    score += 3;
    if (user.division === candidate.division) {
      score += 3;
      if (user.district === candidate.district) {
        score += 2;
        reasons.push("Same area");
      }
    }
  }

  // Family values (5 points)
  if (user.familyValues === candidate.familyValues) {
    score += 5;
    reasons.push("Similar values");
  }

  // Diet (2 points)
  if (!user.diet || !candidate.diet || user.diet === candidate.diet) {
    score += 2;
  }

  return { score, reasons };
}

function calculateProfileCompleteness(profile: Record<string, unknown>): number {
  const fields = [
    "firstName", "lastName", "gender", "dateOfBirth", "height",
    "maritalStatus", "religion", "highestEducation", "profession",
    "country", "division", "district", "partnerPreference",
    "hobbies", "familyType", "familyStatus", "familyValues",
    "fatherName", "motherName", "institution", "annualIncome",
  ];

  let filled = 0;
  for (const field of fields) {
    const value = profile[field];
    if (value !== undefined && value !== null && value !== "" &&
        !(Array.isArray(value) && value.length === 0)) {
      filled++;
    }
  }

  return Math.round((filled / fields.length) * 100);
}

/**
 * Get "Recently Active" profiles
 */
export async function getRecentlyActiveProfiles(
  excludeUserId: string,
  days: number = 7,
  limit: number = 20
): Promise<Partial<IProfile>[]> {
  await connectToDatabase();

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return Profile.find({
    userId: { $ne: excludeUserId },
    isVisible: true,
    isDeactivated: false,
    lastActiveAt: { $gte: since },
  })
    .sort({ lastActiveAt: -1 })
    .limit(limit)
    .select("firstName lastName gender age height religion profession highestEducation country division district photos isPremium isVerified isProfileBoosted lastActiveAt")
    .lean();
}