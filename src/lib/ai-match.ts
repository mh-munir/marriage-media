import connectToDatabase from "./mongodb";
import { Profile } from "@/models";

interface MatchCriteria {
  userId: string;
  gender: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  height?: string;
  education?: string;
  profession?: string;
  country?: string;
  division?: string;
}

interface ProfileData {
  _id: { toString(): string };
  userId: { toString(): string };
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  height: string;
  religion: string;
  profession: string;
  highestEducation: string;
  country: string;
  division: string;
  district: string;
  hobbies: string[];
  familyValues: string;
  diet: string;
  partnerPreference: string;
  photos: { url: string; isPrimary: boolean }[];
  isPremium: boolean;
  isVerified: boolean;
}

/**
 * Calculate compatibility score between two profiles (0-100)
 */
export function calculateCompatibilityScore(
  profile1: ProfileData,
  profile2: ProfileData
): number {
  let score = 0;
  let maxScore = 0;

  // Religion match (25 points)
  maxScore += 25;
  if (profile1.religion === profile2.religion) {
    score += 25;
  } else {
    score += 5; // Some points for different religion
  }

  // Age compatibility (15 points)
  maxScore += 15;
  const ageDiff = Math.abs(profile1.age - profile2.age);
  if (ageDiff <= 2) score += 15;
  else if (ageDiff <= 5) score += 12;
  else if (ageDiff <= 8) score += 8;
  else if (ageDiff <= 12) score += 4;

  // Education level (15 points)
  maxScore += 15;
  const educationLevels = [
    "Primary", "Secondary", "Higher Secondary", "Diploma",
    "Bachelor's Degree", "Master's Degree", "PhD", "Professional Degree"
  ];
  const edu1 = educationLevels.indexOf(profile1.highestEducation);
  const edu2 = educationLevels.indexOf(profile2.highestEducation);
  if (edu1 !== -1 && edu2 !== -1) {
    const eduDiff = Math.abs(edu1 - edu2);
    if (eduDiff === 0) score += 15;
    else if (eduDiff === 1) score += 12;
    else if (eduDiff === 2) score += 8;
    else score += 4;
  }

  // Location match (15 points)
  maxScore += 15;
  if (profile1.country === profile2.country) {
    score += 5;
    if (profile1.division === profile2.division) {
      score += 5;
      if (profile1.district === profile2.district) {
        score += 5;
      }
    }
  }

  // Family values match (10 points)
  maxScore += 10;
  if (profile1.familyValues === profile2.familyValues) {
    score += 10;
  } else {
    score += 3;
  }

  // Diet compatibility (5 points)
  maxScore += 5;
  if (profile1.diet === profile2.diet || profile1.diet === "No Preference" || profile2.diet === "No Preference") {
    score += 5;
  } else {
    score += 1;
  }

  // Hobbies overlap (10 points)
  maxScore += 10;
  if (profile1.hobbies.length > 0 && profile2.hobbies.length > 0) {
    const commonHobbies = profile1.hobbies.filter((h) =>
      profile2.hobbies.includes(h)
    );
    const overlapRatio = commonHobbies.length / Math.max(profile1.hobbies.length, profile2.hobbies.length);
    score += Math.round(overlapRatio * 10);
  }

  // Height compatibility (5 points)
  maxScore += 5;
  if (profile1.height && profile2.height) {
    score += 3; // Base points for having height data
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Get AI match recommendations for a user
 */
export async function getMatchRecommendations(
  userId: string,
  limit: number = 10
): Promise<{ profile: ProfileData; score: number }[]> {
  await connectToDatabase();

  const userProfile = await Profile.findOne({ userId }).lean() as ProfileData | null;
  if (!userProfile) return [];

  // Find opposite gender profiles
  const oppositeGender = userProfile.gender === "Male" ? "Female" : "Male";

  const candidates = await Profile.find({
    userId: { $ne: userId },
    gender: oppositeGender,
    isVisible: true,
    isDeactivated: false,
  }).lean() as ProfileData[];

  // Calculate scores
  const scored = candidates.map((candidate) => ({
    profile: candidate,
    score: calculateCompatibilityScore(userProfile, candidate),
  }));

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Return top matches
  return scored.slice(0, limit);
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: Record<string, unknown>): number {
  const requiredFields = [
    "firstName", "lastName", "gender", "dateOfBirth", "height",
    "maritalStatus", "religion", "highestEducation", "profession",
    "country", "division", "district",
  ];

  const optionalFields = [
    "weight", "motherTongue", "languages", "institution",
    "annualIncome", "fatherName", "motherName", "hobbies",
    "partnerPreference", "familyType", "familyStatus",
  ];

  let completed = 0;
  const total = requiredFields.length * 2 + optionalFields.length; // Required fields weighted 2x

  requiredFields.forEach((field) => {
    if (profile[field]) completed += 2;
  });

  optionalFields.forEach((field) => {
    if (profile[field] && (Array.isArray(profile[field]) ? (profile[field] as unknown[]).length > 0 : true)) {
      completed += 1;
    }
  });

  return Math.min(Math.round((completed / total) * 100), 100);
}