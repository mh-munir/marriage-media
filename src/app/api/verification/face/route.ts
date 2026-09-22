export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/verification/face
 * Deprecated route retained only to return a clear message while the app uses the
 * simplified two-step verification flow: phone and profile.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    return NextResponse.json(
      {
        error: "Face and selfie verification are no longer supported. Use Phone Verification and Profile Verification only.",
      },
      { status: 410 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}