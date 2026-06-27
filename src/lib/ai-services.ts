/**
 * Enterprise AI Services for Marriage Media.
 * All AI features in one module, using OpenAI via the unified AI client.
 * Falls back to rule-based logic when AI is not configured.
 */

import { chatCompletion, parseAIJson, AI_AVAILABLE } from "./ai-client";
import connectToDatabase from "./mongodb";
import { Profile } from "@/models";

// ============================================================================
// Types
// ============================================================================

interface ProfileData {
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
  aboutMe: string;
  partnerPreference: string;
  maritalStatus: string;
  photos: { url: string; isPrimary: boolean }[];
}

export interface MatchResult {
  profileId: string;
  score: number;
  reasons: string[];
}

export interface CompatibilityResult {
  score: number;
  breakdown: Record<string, number>;
  summary: string;
  advice: string;
}

export interface ProfileImprovement {
  field: string;
  current: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

export interface FakeDetectionResult {
  isFake: boolean;
  confidence: number;
  riskScore: number;
  flags: string[];
}

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  severity: "none" | "low" | "medium" | "high";
  explanation: string;
}

// ============================================================================
// 1. AI MATCH RECOMMENDATION (enhanced with AI)
// ============================================================================

export async function aiMatchRecommendations(
  userId: string,
  limit: number = 10
): Promise<MatchResult[]> {
  await connectToDatabase();
  const userProfile = await Profile.findOne({ userId }).lean() as ProfileData | null;
  if (!userProfile) return [];

  const oppositeGender = userProfile.gender === "Male" ? "Female" : "Male";
  const candidates = await Profile.find({
    userId: { $ne: userId },
    gender: oppositeGender,
    isVisible: true,
    isDeactivated: false,
  }).lean() as Array<ProfileData & { userId: { toString(): string } }>;

  if (!AI_AVAILABLE || candidates.length === 0) {
    return basicMatchScore(userProfile, candidates, limit);
  }

  try {
    const candidateSummary = candidates.slice(0, 30).map((c, i) =>
      `${i + 1}. ${c.firstName} ${c.lastName}, age ${c.age}, ${c.profession}, ${c.religion}, ${c.division}, education: ${c.highestEducation}, hobbies: ${c.hobbies.join(", ")}`
    ).join("\n");

    const result = await chatCompletion({
      systemPrompt: `You are an AI matchmaking expert for a Bangladeshi marriage platform. Analyze profiles and rank matches based on compatibility. Return a JSON array of objects with profileIndex (1-based), score (0-100), and reasons (array of strings). Sort by score descending.`,
      userPrompt: `User profile: ${userProfile.firstName}, age ${userProfile.age}, ${userProfile.profession}, ${userProfile.religion}, ${userProfile.division}, education: ${userProfile.highestEducation}, hobbies: ${userProfile.hobbies.join(", ")}, familyValues: ${userProfile.familyValues}, diet: ${userProfile.diet}, partnerPreference: ${userProfile.partnerPreference || "No preference"}

Candidates:
${candidateSummary}

Return top ${limit} matches as JSON array: [{"profileIndex": 1, "score": 85, "reasons": ["reason1", "reason2"]}]`,
      maxTokens: 2048,
      temperature: 0.3,
    });

    const parsed = parseAIJson<Array<{ profileIndex: number; score: number; reasons: string[] }>>(result);
    return parsed.map((item) => ({
      profileId: candidates[item.profileIndex - 1]?.userId?.toString() || "",
      score: Math.min(100, Math.max(0, item.score)),
      reasons: item.reasons || [],
    })).filter((r) => r.profileId);
  } catch {
    return basicMatchScore(userProfile, candidates, limit);
  }
}

function basicMatchScore(user: ProfileData, candidates: Array<ProfileData & { userId: { toString(): string } }>, limit: number): MatchResult[] {
  return candidates.map((c) => {
    let score = 50;
    if (user.religion === c.religion) score += 15;
    if (user.division === c.division) score += 10;
    const ageDiff = Math.abs(user.age - c.age);
    if (ageDiff <= 3) score += 10;
    else if (ageDiff <= 7) score += 5;
    if (user.highestEducation === c.highestEducation) score += 5;
    const commonHobbies = user.hobbies.filter((h) => c.hobbies.includes(h));
    score += Math.min(commonHobbies.length * 3, 10);
    return { profileId: c.userId.toString(), score: Math.min(100, score), reasons: [] };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}

// ============================================================================
// 2. AI COMPATIBILITY SCORE
// ============================================================================

export async function aiCompatibilityScore(
  profile1: ProfileData,
  profile2: ProfileData
): Promise<CompatibilityResult> {
  if (!AI_AVAILABLE) {
    return basicCompatibility(profile1, profile2);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a compatibility expert for a marriage platform. Analyze two profiles and return a detailed compatibility score. Return JSON: {"score": 0-100, "breakdown": {"religion": 0-25, "age": 0-15, "education": 0-15, "location": 0-15, "values": 0-10, "hobbies": 0-10, "lifestyle": 0-10}, "summary": "brief summary", "advice": "relationship advice"}`,
      userPrompt: `Profile 1: ${profile1.firstName}, age ${profile1.age}, ${profile1.profession}, ${profile1.religion}, ${profile1.division}, education: ${profile1.highestEducation}, hobbies: ${profile1.hobbies.join(", ")}, familyValues: ${profile1.familyValues}, diet: ${profile1.diet}, aboutMe: ${(profile1.aboutMe || "").slice(0, 200)}

Profile 2: ${profile2.firstName}, age ${profile2.age}, ${profile2.profession}, ${profile2.religion}, ${profile2.division}, education: ${profile2.highestEducation}, hobbies: ${profile2.hobbies.join(", ")}, familyValues: ${profile2.familyValues}, diet: ${profile2.diet}, aboutMe: ${(profile2.aboutMe || "").slice(0, 200)}`,
      maxTokens: 1024,
      temperature: 0.3,
    });

    return parseAIJson<CompatibilityResult>(result);
  } catch {
    return basicCompatibility(profile1, profile2);
  }
}

function basicCompatibility(p1: ProfileData, p2: ProfileData): CompatibilityResult {
  const breakdown: Record<string, number> = {};
  breakdown.religion = p1.religion === p2.religion ? 25 : 5;
  const ageDiff = Math.abs(p1.age - p2.age);
  breakdown.age = ageDiff <= 2 ? 15 : ageDiff <= 5 ? 10 : ageDiff <= 8 ? 6 : 2;
  breakdown.education = p1.highestEducation === p2.highestEducation ? 15 : 8;
  breakdown.location = p1.division === p2.division ? 15 : p1.country === p2.country ? 8 : 3;
  breakdown.values = p1.familyValues === p2.familyValues ? 10 : 3;
  const commonHobbies = p1.hobbies.filter((h) => p2.hobbies.includes(h));
  breakdown.hobbies = Math.min(commonHobbies.length * 3, 10);
  breakdown.lifestyle = p1.diet === p2.diet ? 10 : 4;
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return {
    score: Math.min(100, score),
    breakdown,
    summary: `${p1.firstName} and ${p2.firstName} have a ${score}% compatibility match.`,
    advice: score >= 70 ? "You two seem highly compatible! Consider reaching out." : "There are some differences, but opposites can attract. Give it a try!",
  };
}

// ============================================================================
// 3. AI BIO GENERATOR (enhanced)
// ============================================================================

export async function aiGenerateBio(profile: ProfileData): Promise<string> {
  if (!AI_AVAILABLE) {
    return ruleBasedBio(profile);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a professional bio writer for a Bangladeshi marriage platform. Write a warm, authentic, engaging bio (150-250 words) that highlights the person's personality, values, and what they're looking for. Make it sound genuine and personal, not generic.`,
      userPrompt: `Write a marriage profile bio for: ${profile.firstName}, age ${profile.age}, ${profile.profession}, ${profile.highestEducation}, ${profile.religion}, from ${profile.division || profile.country}. Hobbies: ${profile.hobbies.join(", ")}. Family values: ${profile.familyValues}. Diet: ${profile.diet}. About: ${(profile.aboutMe || "").slice(0, 300)}. Partner preference: ${(profile.partnerPreference || "").slice(0, 200)}`,
      maxTokens: 600,
      temperature: 0.8,
    });

    return result || ruleBasedBio(profile);
  } catch {
    return ruleBasedBio(profile);
  }
}

function ruleBasedBio(profile: ProfileData): string {
  const parts = [
    `Hi, I'm ${profile.firstName}. I'm a ${profile.age}-year-old ${profile.profession} with a ${profile.highestEducation.toLowerCase()} background.`,
  ];
  if (profile.hobbies.length > 0) {
    parts.push(`I enjoy ${profile.hobbies.slice(0, 4).join(", ").toLowerCase()}.`);
  }
  parts.push(`My faith as a ${profile.religion.toLowerCase()} is important to me, and I come from a ${profile.familyValues.toLowerCase()} family.`);
  parts.push(profile.partnerPreference || "I'm looking for a life partner who shares similar values.");
  return parts.join(" ");
}

// ============================================================================
// 4. AI INTEREST PREDICTION
// ============================================================================

export async function aiInterestPrediction(
  userId: string
): Promise<{ predictedInterests: string[]; confidence: number; reasoning: string }> {
  await connectToDatabase();
  const profile = await Profile.findOne({ userId }).lean() as ProfileData | null;
  if (!profile) return { predictedInterests: [], confidence: 0, reasoning: "No profile found" };

  if (!AI_AVAILABLE) {
    return {
      predictedInterests: profile.hobbies.slice(0, 5),
      confidence: 0.5,
      reasoning: "Based on current hobbies only (AI not configured)",
    };
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are an interest prediction AI for a marriage platform. Based on a user's profile, predict 5-8 interests/activities they might enjoy but haven't listed. Return JSON: {"predictedInterests": ["interest1", ...], "confidence": 0.0-1.0, "reasoning": "brief explanation"}`,
      userPrompt: `Profile: ${profile.firstName}, age ${profile.age}, ${profile.profession}, ${profile.religion}, education: ${profile.highestEducation}, current hobbies: ${profile.hobbies.join(", ")}, familyValues: ${profile.familyValues}, diet: ${profile.diet}, country: ${profile.country}`,
      maxTokens: 512,
      temperature: 0.5,
    });

    return parseAIJson(result);
  } catch {
    return { predictedInterests: [], confidence: 0, reasoning: "AI service unavailable" };
  }
}

// ============================================================================
// 5. AI PROFILE IMPROVEMENT SUGGESTIONS
// ============================================================================

export async function aiProfileImprovements(
  profile: ProfileData
): Promise<ProfileImprovement[]> {
  if (!AI_AVAILABLE) {
    return basicProfileImprovements(profile);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a dating profile optimization expert. Analyze the profile and suggest specific improvements. Return a JSON array of objects with field, current, suggestion, and priority (high/medium/low). Focus on the 5-8 most impactful improvements.`,
      userPrompt: `Profile: ${profile.firstName}, age ${profile.age}, ${profile.profession}, ${profile.highestEducation}, ${profile.religion}, ${profile.division || profile.country}. Hobbies: ${profile.hobbies.join(", ") || "none listed"}. AboutMe: "${(profile.aboutMe || "empty")}". PartnerPreference: "${(profile.partnerPreference || "empty")}". Photos: ${profile.photos.length} uploaded. MaritalStatus: ${profile.maritalStatus}.`,
      maxTokens: 1024,
      temperature: 0.4,
    });

    return parseAIJson<ProfileImprovement[]>(result);
  } catch {
    return basicProfileImprovements(profile);
  }
}

function basicProfileImprovements(profile: ProfileData): ProfileImprovement[] {
  const improvements: ProfileImprovement[] = [];
  if (!profile.aboutMe || profile.aboutMe.length < 50) {
    improvements.push({ field: "aboutMe", current: profile.aboutMe || "empty", suggestion: "Write a detailed 'About Me' section (100+ words) describing your personality, values, and what makes you unique.", priority: "high" });
  }
  if (profile.hobbies.length < 3) {
    improvements.push({ field: "hobbies", current: profile.hobbies.join(", ") || "none", suggestion: "Add at least 5-7 hobbies to increase profile visibility and matches.", priority: "high" });
  }
  if (profile.photos.length < 3) {
    improvements.push({ field: "photos", current: `${profile.photos.length} photos`, suggestion: "Upload at least 3-4 quality photos including a clear face shot and a full-body photo.", priority: "high" });
  }
  if (!profile.partnerPreference || profile.partnerPreference.length < 30) {
    improvements.push({ field: "partnerPreference", current: profile.partnerPreference || "empty", suggestion: "Describe what you're looking for in a partner - values, qualities, and expectations.", priority: "medium" });
  }
  return improvements;
}

// ============================================================================
// 6. AI CONVERSATION STARTER (enhanced)
// ============================================================================

export async function aiConversationStarters(
  user1: ProfileData,
  user2: ProfileData
): Promise<string[]> {
  if (!AI_AVAILABLE) {
    return ruleBasedStarters(user1, user2);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a relationship conversation expert. Generate 5 personalized, thoughtful conversation starters for two people on a marriage platform. Make them natural, warm, and specific to their shared interests. Return a JSON array of strings.`,
      userPrompt: `Person 1: ${user1.firstName}, age ${user1.age}, ${user1.profession}, hobbies: ${user1.hobbies.join(", ")}, religion: ${user1.religion}, familyValues: ${user1.familyValues}
Person 2: ${user2.firstName}, age ${user2.age}, ${user2.profession}, hobbies: ${user2.hobbies.join(", ")}, religion: ${user2.religion}, familyValues: ${user2.familyValues}`,
      maxTokens: 512,
      temperature: 0.8,
    });

    return parseAIJson<string[]>(result);
  } catch {
    return ruleBasedStarters(user1, user2);
  }
}

function ruleBasedStarters(user1: ProfileData, user2: ProfileData): string[] {
  const starters: string[] = [];
  const common = user1.hobbies.filter((h) => user2.hobbies.includes(h));
  if (common.length > 0) starters.push(`Hi ${user2.firstName}! I noticed we both enjoy ${common[0]}. What got you started with that?`);
  starters.push(`Hello ${user2.firstName}! Your profile caught my attention. What are you looking for in a life partner?`);
  starters.push(`Hey ${user2.firstName}! If you could travel anywhere in the world, where would you go first?`);
  starters.push(`Hi ${user2.firstName}! What's one thing on your bucket list you'd like to accomplish this year?`);
  starters.push(`Hello ${user2.firstName}! Do you have any favorite books or shows you've been enjoying lately?`);
  return starters.slice(0, 5);
}

// ============================================================================
// 7. AI SPAM DETECTION
// ============================================================================

export async function aiSpamDetection(
  content: string,
  context?: string
): Promise<SpamCheckResult> {
  if (!AI_AVAILABLE) {
    return ruleBasedSpamCheck(content);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a spam detection system for a marriage platform. Analyze the given content for spam, scam, or inappropriate content. Return JSON: {"isSpam": boolean, "confidence": 0.0-1.0, "reasons": ["reason1", ...]}`,
      userPrompt: `Content to check: "${content}"${context ? `\nContext: ${context}` : ""}`,
      maxTokens: 512,
      temperature: 0.1,
    });

    return parseAIJson<SpamCheckResult>(result);
  } catch {
    return ruleBasedSpamCheck(content);
  }
}

function ruleBasedSpamCheck(content: string): SpamCheckResult {
  const spamPatterns = [/whatsapp/gi, /telegram/gi, /click here/gi, /free money/gi, /send money/gi, /crypto/gi, /bitcoin/gi, /investment opportunity/gi, /http[s]?:\/\//gi];
  const matches = spamPatterns.filter((p) => p.test(content));
  return {
    isSpam: matches.length >= 2,
    confidence: Math.min(matches.length * 0.25, 1),
    reasons: matches.length > 0 ? ["Contains promotional or suspicious patterns"] : [],
  };
}

// ============================================================================
// 8. AI FAKE PROFILE DETECTION (enhanced)
// ============================================================================

export async function aiFakeProfileDetection(
  profile: ProfileData & { userId?: string; createdAt?: Date }
): Promise<FakeDetectionResult> {
  if (!AI_AVAILABLE) {
    return ruleBasedFakeDetection(profile);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a fake profile detection AI for a marriage platform. Analyze profile data for signs of fake/fraudulent accounts. Return JSON: {"isFake": boolean, "confidence": 0.0-1.0, "riskScore": 0-100, "flags": ["flag1", ...]}`,
      userPrompt: `Profile: ${profile.firstName} ${profile.lastName}, age ${profile.age}, ${profile.profession}, ${profile.religion}, ${profile.country}. About: "${(profile.aboutMe || "").slice(0, 300)}". Partner pref: "${(profile.partnerPreference || "").slice(0, 200)}". Hobbies: ${profile.hobbies.join(", ") || "none"}. Photos: ${profile.photos.length}. Marital status: ${profile.maritalStatus}. Education: ${profile.highestEducation}.`,
      maxTokens: 512,
      temperature: 0.1,
    });

    return parseAIJson<FakeDetectionResult>(result);
  } catch {
    return ruleBasedFakeDetection(profile);
  }
}

function ruleBasedFakeDetection(profile: ProfileData): FakeDetectionResult {
  const flags: string[] = [];
  let riskScore = 0;

  if (profile.photos.length === 0) { flags.push("No photos"); riskScore += 30; }
  if (!profile.aboutMe || profile.aboutMe.length < 10) { flags.push("Very short bio"); riskScore += 15; }
  if (profile.hobbies.length === 0) { flags.push("No hobbies listed"); riskScore += 10; }
  if (!profile.profession || profile.profession === "Unknown") { flags.push("No profession"); riskScore += 15; }
  if (profile.photos.length === 1) { flags.push("Only one photo"); riskScore += 10; }

  return {
    isFake: riskScore >= 40,
    confidence: Math.min(riskScore / 100, 0.9),
    riskScore,
    flags,
  };
}

// ============================================================================
// 9. AI IMAGE MODERATION
// ============================================================================

export async function aiImageModeration(
  imageUrl: string
): Promise<ModerationResult> {
  if (!AI_AVAILABLE) {
    return { flagged: false, categories: [], severity: "none", explanation: "AI moderation not configured" };
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are an image moderation system for a family-friendly marriage platform. Analyze if the image URL suggests inappropriate content. Return JSON: {"flagged": boolean, "categories": ["category1", ...], "severity": "none|low|medium|high", "explanation": "brief explanation"}`,
      userPrompt: `Image URL: ${imageUrl}. Consider: Is this likely a profile-appropriate photo for a marriage platform? Check for inappropriate content indicators in the URL or context.`,
      maxTokens: 512,
      temperature: 0.1,
    });

    return parseAIJson<ModerationResult>(result);
  } catch {
    return { flagged: false, categories: [], severity: "none", explanation: "Moderation check unavailable" };
  }
}

// ============================================================================
// 10. AI CONTENT MODERATION
// ============================================================================

export async function aiContentModeration(
  content: string,
  contentType: "profile" | "message" | "blog" = "profile"
): Promise<ModerationResult> {
  if (!AI_AVAILABLE) {
    return ruleBasedContentModeration(content);
  }

  try {
    const result = await chatCompletion({
      systemPrompt: `You are a content moderation system for a family-friendly marriage platform. Check content for inappropriate language, hate speech, harassment, or anything unsuitable. Return JSON: {"flagged": boolean, "categories": ["category1", ...], "severity": "none|low|medium|high", "explanation": "brief explanation"}`,
      userPrompt: `Content type: ${contentType}. Content: "${content.slice(0, 1000)}"`,
      maxTokens: 512,
      temperature: 0.1,
    });

    return parseAIJson<ModerationResult>(result);
  } catch {
    return ruleBasedContentModeration(content);
  }
}

function ruleBasedContentModeration(content: string): ModerationResult {
  const lower = content.toLowerCase();
  const badPatterns = [/\b(badword1)\b/i, /hate/i, /kill/i];
  const matches = badPatterns.filter((p) => p.test(lower));
  if (matches.length > 0) {
    return { flagged: true, categories: ["inappropriate_language"], severity: "low", explanation: "Content may contain inappropriate language" };
  }
  return { flagged: false, categories: [], severity: "none", explanation: "Content appears appropriate" };
}