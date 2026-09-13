import { Profile, Notification } from "@/models";
import { createNotification } from "@/lib/notifications";

export type PartnerPreferences = {
  age?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  religion?: string;
  highestEducation?: string;
  annualIncome?: string;
  country?: string;
  division?: string;
  district?: string;
  thana?: string;
  union?: string;
  area?: string;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
};

export type MatchableProfile = {
  userId: { toString(): string };
  gender?: string;
  age?: number;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  religion?: string;
  highestEducation?: string;
  annualIncome?: string;
  country?: string;
  division?: string;
  district?: string;
  thana?: string;
  union?: string;
  area?: string;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  firstName?: string;
  lastName?: string;
};

const preferenceFields: Array<keyof PartnerPreferences> = [
  "age",
  "height",
  "weight",
  "maritalStatus",
  "religion",
  "highestEducation",
  "annualIncome",
  "country",
  "division",
  "district",
  "thana",
  "union",
  "area",
  "familyType",
  "familyStatus",
  "familyValues",
];

function numberRange(value: string): { min: number; max: number } | null {
  const feetAndInches = [...value.matchAll(/(\d+)\s*'\s*(\d+)/g)].map((match) =>
    Number(match[1]) * 12 + Number(match[2])
  );
  if (feetAndInches.length) {
    return {
      min: feetAndInches[0],
      max: feetAndInches[feetAndInches.length - 1],
    };
  }

  const numbers = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (!numbers.length) return null;
  return { min: numbers[0], max: numbers[1] ?? numbers[0] };
}

function matchesRange(preference: string, value: string | number | undefined): boolean {
  if (!preference || value === undefined || value === "") return false;
  const preferred = numberRange(preference);
  const actual = numberRange(String(value));
  if (!preferred || !actual) return false;
  return actual.min >= preferred.min && actual.max <= preferred.max;
}

function matchesPreference(field: keyof PartnerPreferences, preference: string, profile: MatchableProfile): boolean {
  if (field === "age" || field === "height" || field === "weight") {
    return matchesRange(preference, profile[field]);
  }

  const actual = profile[field];
  if (!actual) return false;
  const selectedValues = String(preference)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return selectedValues.includes(actual.trim().toLowerCase());
}

export function calculatePartnerMatchScore(
  profile: MatchableProfile,
  preferences?: PartnerPreferences
): number {
  if (!preferences) return 0;

  const activeFields = preferenceFields.filter((field) => {
    const preference = preferences[field];
    return typeof preference === "string" && preference.trim().length > 0;
  });
  if (!activeFields.length) return 0;

  const matchedFields = activeFields.filter((field) =>
    matchesPreference(field, preferences[field] as string, profile)
  ).length;

  return Math.round((matchedFields / activeFields.length) * 100);
}

function hasPartnerPreferences(preferences?: PartnerPreferences): boolean {
  return preferenceFields.some((field) => {
    const value = preferences?.[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

type CompatibilityProfile = MatchableProfile & {
  caste?: string;
  motherTongue?: string;
  hobbies?: string[];
  diet?: string;
  smoke?: string;
  isVerified?: boolean;
};

export function calculateCompatibilityScore(
  profile: CompatibilityProfile,
  currentProfile: CompatibilityProfile
): number {
  let score = 0;
  let maxScore = 0;

  maxScore += 20;
  if (profile.religion === currentProfile.religion) score += 20;

  if (currentProfile.caste && profile.caste) {
    maxScore += 10;
    if (profile.caste === currentProfile.caste) score += 10;
  }

  if (currentProfile.motherTongue && profile.motherTongue) {
    maxScore += 5;
    if (profile.motherTongue === currentProfile.motherTongue) score += 5;
  }

  maxScore += 15;
  const ageDiff = Math.abs((profile.age ?? 0) - (currentProfile.age ?? 0));
  if (ageDiff <= 2) score += 15;
  else if (ageDiff <= 5) score += 12;
  else if (ageDiff <= 8) score += 8;
  else if (ageDiff <= 12) score += 4;

  maxScore += 10;
  const educationLevels = [
    "Primary", "Secondary", "Higher Secondary", "Diploma",
    "Bachelor's Degree", "Master's Degree", "PhD", "Professional Degree",
  ];
  const profileEducation = educationLevels.indexOf(profile.highestEducation || "");
  const currentEducation = educationLevels.indexOf(currentProfile.highestEducation || "");
  if (profileEducation !== -1 && currentEducation !== -1) {
    const educationDiff = Math.abs(profileEducation - currentEducation);
    if (educationDiff === 0) score += 10;
    else if (educationDiff === 1) score += 8;
    else if (educationDiff === 2) score += 5;
  }

  maxScore += 15;
  if (profile.division === currentProfile.division) {
    score += 8;
    if (profile.district === currentProfile.district) {
      score += 5;
      if (profile.area && currentProfile.area && profile.area === currentProfile.area) score += 2;
    }
  }

  if (currentProfile.familyValues && profile.familyValues) {
    maxScore += 8;
    const familyValues = ["Orthodox", "Traditional", "Moderate", "Liberal", "Secular"];
    const profileValue = familyValues.indexOf(profile.familyValues);
    const currentValue = familyValues.indexOf(currentProfile.familyValues);
    if (profileValue !== -1 && currentValue !== -1) {
      const valueDiff = Math.abs(profileValue - currentValue);
      if (valueDiff === 0) score += 8;
      else if (valueDiff === 1) score += 5;
      else if (valueDiff === 2) score += 2;
    }
  }

  if (currentProfile.diet && profile.diet) {
    maxScore += 5;
    if (profile.diet === currentProfile.diet) score += 5;
    else if ((currentProfile.diet === "Halal" && profile.diet === "Non-Veg") || (currentProfile.diet === "Non-Veg" && profile.diet === "Halal")) score += 3;
  }

  if (Array.isArray(currentProfile.hobbies) && Array.isArray(profile.hobbies)) {
    maxScore += 7;
    score += Math.min(currentProfile.hobbies.filter((hobby) => profile.hobbies?.includes(hobby)).length * 2, 7);
  }

  if (currentProfile.smoke && profile.smoke) {
    maxScore += 3;
    if (profile.smoke === currentProfile.smoke) score += 3;
  }

  maxScore += 3;
  if (profile.isVerified) score += 3;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

/**
 * The single score shown to a member across search, favorites, recommendations,
 * and the compatibility detail endpoint. A member's explicit partner preferences
 * take precedence; general profile compatibility is used only when none exist.
 */
export function calculateMatchScore(
  profile: CompatibilityProfile,
  currentProfile?: (CompatibilityProfile & { partnerPreferences?: PartnerPreferences }) | null
): number {
  if (!currentProfile) return 0;

  if (hasPartnerPreferences(currentProfile.partnerPreferences)) {
    return calculatePartnerMatchScore(profile, currentProfile.partnerPreferences);
  }

  return calculateCompatibilityScore(profile, currentProfile);
}

export async function notifyProfileMatches(profileUserId: string): Promise<void> {
  try {
    const sourceProfile = await Profile.findOne({ userId: profileUserId, isVisible: true, isDeactivated: false })
      .select("userId gender firstName lastName age height weight maritalStatus religion highestEducation annualIncome country division district thana union area familyType familyStatus familyValues partnerPreferences")
      .lean<MatchableProfile & { partnerPreferences?: PartnerPreferences }>();

    if (!sourceProfile?.partnerPreferences || !sourceProfile.gender) return;

    const candidates = await Profile.find({
      userId: { $ne: sourceProfile.userId.toString() },
      isVisible: true,
      isDeactivated: false,
    })
      .select("userId gender firstName lastName age height weight maritalStatus religion highestEducation annualIncome country division district thana union area familyType familyStatus familyValues partnerPreferences")
      .lean();

    const candidateProfiles = candidates as unknown as Array<MatchableProfile & { partnerPreferences?: PartnerPreferences }>;

    for (const candidate of candidateProfiles) {
      if (!candidate.gender || candidate.gender === sourceProfile.gender) continue;

      const sourceScore = calculatePartnerMatchScore(candidate, sourceProfile.partnerPreferences);
      const candidateScore = calculatePartnerMatchScore(sourceProfile, candidate.partnerPreferences);

      if (sourceScore >= 70) {
        await createMatchNotification(sourceProfile.userId.toString(), candidate, sourceScore);
      }

      if (candidateScore >= 70) {
        await createMatchNotification(candidate.userId.toString(), sourceProfile, candidateScore);
      }
    }
  } catch (error) {
    console.error("Profile match notification failed:", error);
  }
}

async function createMatchNotification(
  recipientId: string,
  matchedProfile: MatchableProfile,
  score: number
): Promise<void> {
  const matchedUserId = matchedProfile.userId.toString();
  const link = `/dashboard/profile/${matchedUserId}`;
  const existing = await Notification.exists({
    userId: recipientId,
    type: "system",
    link,
    isRead: false,
  });

  if (existing) return;

  const name = [matchedProfile.firstName, matchedProfile.lastName].filter(Boolean).join(" ") || "a member";
  await createNotification({
    userId: recipientId,
    type: "system",
    title: "New profile match",
    message: `${name}'s profile matches your expected partner preferences by ${score}%.`,
    link,
    channels: ["inapp"],
  });
}
