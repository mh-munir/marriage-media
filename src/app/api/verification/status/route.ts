export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getVerificationStatus } from "@/lib/verification";

/**
 * GET /api/verification/status
 * Get the user's verification badge status, trust score, and timeline
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const status = await getVerificationStatus(user._id.toString());

    return NextResponse.json({
      badge: status.badge,
      completedSteps: status.completedSteps,
      totalSteps: status.totalSteps,
      progress: Math.round((status.completedSteps.length / status.totalSteps) * 100),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}