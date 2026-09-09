import { Profile, Notification } from "@/models";
import { createNotification } from "@/lib/notifications";

type PartnerPreferences = {
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

type MatchableProfile = {
  userId: { toString(): string };
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

export async function notifyProfileMatches(profileUserId: string): Promise<void> {
  try {
    const sourceProfile = await Profile.findOne({ userId: profileUserId, isVisible: true, isDeactivated: false })
      .select("userId firstName lastName age height weight maritalStatus religion highestEducation annualIncome country division district thana union area familyType familyStatus familyValues partnerPreferences")
      .lean<MatchableProfile & { partnerPreferences?: PartnerPreferences }>();

    if (!sourceProfile?.partnerPreferences) return;

    const candidates = await Profile.find({
      userId: { $ne: sourceProfile.userId.toString() },
      isVisible: true,
      isDeactivated: false,
    })
      .select("userId firstName lastName age height weight maritalStatus religion highestEducation annualIncome country division district thana union area familyType familyStatus familyValues partnerPreferences")
      .lean();

    const candidateProfiles = candidates as unknown as Array<MatchableProfile & { partnerPreferences?: PartnerPreferences }>;

    for (const candidate of candidateProfiles) {
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
