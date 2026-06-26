import connectToDatabase from "./mongodb";
import { Profile, FraudLog } from "@/models";

interface FakeDetectionResult {
  isSuspicious: boolean;
  riskScore: number;
  flags: string[];
  recommendations: string[];
}

/**
 * Analyze a profile for potential fake/fraudulent indicators using AI heuristics.
 */
export async function detectFakeProfile(userId: string): Promise<FakeDetectionResult> {
  await connectToDatabase();

  const profile = await Profile.findOne({ userId });
  if (!profile) {
    return { isSuspicious: false, riskScore: 0, flags: [], recommendations: [] };
  }

  let riskScore = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  // 1. Check profile completeness
  const requiredFields = [
    "firstName", "lastName", "aboutMe", "partnerPreference",
    "fatherName", "motherName", "institution",
  ];
  const filledRequired = requiredFields.filter(f => profile[f as keyof typeof profile]);
  const completenessRatio = filledRequired.length / requiredFields.length;

  if (completenessRatio < 0.5) {
    riskScore += 20;
    flags.push("Profile is less than 50% complete");
    recommendations.push("Complete your profile to increase trust");
  }

  // 2. Check for photo analysis
  if (!profile.photos || profile.photos.length === 0) {
    riskScore += 25;
    flags.push("No photos uploaded");
    recommendations.push("Upload at least one verified photo");
  } else {
    const approvedPhotos = profile.photos.filter((p: { isApproved: boolean }) => p.isApproved);
    if (approvedPhotos.length === 0 && profile.photos.length > 0) {
      riskScore += 15;
      flags.push("Photos uploaded but none approved");
    }
  }

  // 3. Check about me length and quality
  if (profile.aboutMe) {
    const aboutLength = profile.aboutMe.length;
    if (aboutLength < 20) {
      riskScore += 15;
      flags.push("Very short 'About Me' section");
      recommendations.push("Write a detailed 'About Me' to attract genuine matches");
    }
    // Check for spam patterns
    const spamPatterns = [/buy now/i, /click here/i, /whatsapp/i, /\d{10,}/, /www\./i, /http/i];
    const hasSpam = spamPatterns.some(p => p.test(profile.aboutMe));
    if (hasSpam) {
      riskScore += 30;
      flags.push("Suspicious content detected in About Me");
    }
  }

  // 4. Check partner preference
  if (!profile.partnerPreference || profile.partnerPreference.length < 10) {
    riskScore += 10;
    flags.push("Missing or minimal partner preferences");
  }

  // 5. Check for generic/default values
  const genericNames = ["test", "user", "demo", "admin", "sample"];
  const firstNameLower = profile.firstName?.toLowerCase() || "";
  if (genericNames.includes(firstNameLower)) {
    riskScore += 35;
    flags.push("Generic first name detected");
  }

  // 6. Check family info completeness
  if (!profile.fatherName && !profile.motherName) {
    riskScore += 10;
    flags.push("Family information missing");
  }

  // 7. Check for realistic age
  if (profile.age && (profile.age < 18 || profile.age > 80)) {
    riskScore += 20;
    flags.push("Unusual age detected");
  }

  // Determine if suspicious
  const isSuspicious = riskScore >= 30;

  // Log suspicious profiles
  if (isSuspicious) {
    await FraudLog.create({
      userId,
      type: "fake_profile",
      severity: riskScore >= 60 ? "high" : riskScore >= 45 ? "medium" : "low",
      description: flags.join("; "),
      evidence: flags.map(f => ({ type: "ai_analysis", data: f })),
      riskScore,
      ipAddress: "system",
      userAgent: "ai-fake-detection",
      status: "detected",
    });
  }

  return {
    isSuspicious,
    riskScore: Math.min(riskScore, 100),
    flags,
    recommendations,
  };
}

/**
 * Analyze image quality and detect potential stock/stolen photos.
 */
export interface ImageQualityResult {
  quality: "high" | "medium" | "low" | "rejected";
  score: number;
  issues: string[];
  suggestions: string[];
}

export function analyzeImageQuality(imageUrl: string): ImageQualityResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check URL validity
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return {
      quality: "rejected",
      score: 0,
      issues: ["Invalid image URL"],
      suggestions: ["Upload a valid image file"],
    };
  }

  // Check for common stock photo URLs
  const stockPhotoDomains = [
    "shutterstock.com", "gettyimages.com", "istockphoto.com",
    "depositphotos.com", "dreamstime.com", "123rf.com",
  ];
  const isStockPhoto = stockPhotoDomains.some(d => imageUrl.toLowerCase().includes(d));
  if (isStockPhoto) {
    score -= 50;
    issues.push("Image appears to be from a stock photo site");
    suggestions.push("Upload an original photo of yourself");
  }

  // Check for very small images (likely thumbnails or icons)
  if (imageUrl.includes("thumb") || imageUrl.includes("icon") || imageUrl.includes("avatar")) {
    score -= 20;
    issues.push("Image may be too small or low resolution");
    suggestions.push("Upload a full-size photo for better visibility");
  }

  // Check for watermarked images
  if (imageUrl.includes("watermark")) {
    score -= 30;
    issues.push("Image appears to have a watermark");
    suggestions.push("Upload a clean photo without watermarks");
  }

  // Determine quality
  let quality: "high" | "medium" | "low" | "rejected";
  if (score >= 80) quality = "high";
  else if (score >= 60) quality = "medium";
  else if (score >= 30) quality = "low";
  else quality = "rejected";

  return { quality, score: Math.max(score, 0), issues, suggestions };
}

/**
 * Get profile completion suggestions for a user.
 */
export interface ProfileSuggestion {
  field: string;
  label: string;
  priority: "high" | "medium" | "low";
  description: string;
}

export function getProfileCompletionSuggestions(
  profile: Record<string, unknown>
): ProfileSuggestion[] {
  const suggestions: ProfileSuggestion[] = [];

  const fieldChecks: Array<{ field: string; label: string; priority: "high" | "medium" | "low"; description: string }> = [
    { field: "aboutMe", label: "About Me", priority: "high", description: "Write about yourself to attract more matches" },
    { field: "partnerPreference", label: "Partner Preference", priority: "high", description: "Describe your ideal partner" },
    { field: "photos", label: "Photos", priority: "high", description: "Upload at least 3 photos for 5x more views" },
    { field: "height", label: "Height", priority: "medium", description: "Add your height for better matching" },
    { field: "weight", label: "Weight", priority: "low", description: "Add your weight" },
    { field: "motherTongue", label: "Mother Tongue", priority: "medium", description: "Specify your mother tongue" },
    { field: "institution", label: "Education Institution", priority: "medium", description: "Add your educational institution" },
    { field: "annualIncome", label: "Annual Income", priority: "low", description: "Add income range (optional but helps matching)" },
    { field: "fatherName", label: "Father's Name", priority: "medium", description: "Add family details" },
    { field: "motherName", label: "Mother's Name", priority: "medium", description: "Add family details" },
    { field: "hobbies", label: "Hobbies", priority: "medium", description: "Add hobbies to find compatible matches" },
    { field: "languages", label: "Languages", priority: "low", description: "Add languages you speak" },
    { field: "bloodGroup", label: "Blood Group", priority: "low", description: "Add your blood group" },
  ];

  for (const check of fieldChecks) {
    const value = profile[check.field];
    const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === "";
    if (isEmpty) {
      suggestions.push(check);
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}