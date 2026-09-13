import connectToDatabase from "./mongodb";
import { FraudLog, LoginHistory, Profile } from "@/models";

interface FraudCheckResult {
  isFraud: boolean;
  riskScore: number;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}

/**
 * Analyze a user's behavior for potential fraud indicators.
 */
export async function analyzeUserBehavior(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<FraudCheckResult> {
  await connectToDatabase();

  let riskScore = 0;
  const reasons: string[] = [];

  // 1. Check for multiple failed logins from same IP
  const recentFailedLogins = await LoginHistory.countDocuments({
    userId,
    status: "failed",
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
  });
  if (recentFailedLogins >= 3) {
    riskScore += 25;
    reasons.push(`${recentFailedLogins} failed login attempts in last hour`);
  }

  // 2. Check for rapid IP changes
  const uniqueIPs = await LoginHistory.distinct("ipAddress", {
    userId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
  });
  if (uniqueIPs.length > 5) {
    riskScore += 30;
    reasons.push(`Login from ${uniqueIPs.length} different IPs in 24h`);
  }

  // 3. Check if IP is used by multiple accounts (duplicate accounts)
  const accountsFromIP = await LoginHistory.distinct("userId", {
    ipAddress,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
  });
  if (accountsFromIP.length > 2) {
    riskScore += 35;
    reasons.push(`${accountsFromIP.length} accounts logged in from same IP`);
  }

  // 4. Check for suspiciously fast profile creation patterns
  const profile = await Profile.findOne({ userId });
  if (profile) {
    const accountAge = Date.now() - new Date(profile.createdAt).getTime();
    const hoursSinceCreation = accountAge / (1000 * 60 * 60);

    if (hoursSinceCreation < 1 && profile.photos.length === 0) {
      riskScore += 15;
      reasons.push("New account with no photos");
    }

  }

  // 5. Check for suspicious payment patterns
  const { Payment } = await import("@/models");
  const recentFailedPayments = await Payment.countDocuments({
    userId,
    status: "failed",
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentFailedPayments >= 3) {
    riskScore += 20;
    reasons.push(`${recentFailedPayments} failed payment attempts`);
  }

  // Determine severity
  let severity: "low" | "medium" | "high" | "critical" = "low";
  if (riskScore >= 75) severity = "critical";
  else if (riskScore >= 50) severity = "high";
  else if (riskScore >= 25) severity = "medium";

  const isFraud = riskScore >= 25;

  // Log the fraud detection result
  if (isFraud) {
    await FraudLog.create({
      userId,
      type: reasons.some(r => r.includes("duplicate") || r.includes("same IP"))
        ? "duplicate_account"
        : reasons.some(r => r.includes("payment"))
          ? "suspicious_payment"
          : "bot_behavior",
      severity,
      description: reasons.join("; "),
      evidence: reasons.map(r => ({ type: "behavior_analysis", data: r })),
      riskScore,
      ipAddress,
      userAgent,
      status: "detected",
    });
  }

  return {
    isFraud,
    riskScore,
    type: "behavior_analysis",
    severity,
    description: reasons.join("; ") || "No fraud indicators detected",
  };
}

/**
 * Check if an IP address should be blocked based on fraud logs.
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const blocked = await FraudLog.findOne({
      ipAddress,
      severity: "critical",
      status: "confirmed",
    });
    return !!blocked;
  } catch {
    return false;
  }
}

/**
 * Detect duplicate accounts by matching profile characteristics.
 */
export async function detectDuplicateAccounts(
  userId: string
): Promise<{ isDuplicate: boolean; matchingUserIds: string[] }> {
  await connectToDatabase();

  const profile = await Profile.findOne({ userId });
  if (!profile) return { isDuplicate: false, matchingUserIds: [] };

  // Find profiles with very similar data
  const candidates = await Profile.find({
    userId: { $ne: userId },
    gender: profile.gender,
    age: { $gte: profile.age - 1, $lte: profile.age + 1 },
    religion: profile.religion,
    highestEducation: profile.highestEducation,
    profession: profile.profession,
    district: profile.district,
  }).select("userId firstName lastName age");

  // Check for exact name matches
  const matchingUserIds = candidates
    .filter(c =>
      c.firstName.toLowerCase() === profile.firstName.toLowerCase() &&
      c.lastName.toLowerCase() === profile.lastName.toLowerCase()
    )
    .map(c => c.userId.toString());

  return {
    isDuplicate: matchingUserIds.length > 0,
    matchingUserIds,
  };
}