export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { submitFaceVerification, submitSelfieVerification } from "@/lib/verification";

/**
 * POST /api/verification/face
 * Submit face verification (AI face match)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { selfieUrl, selfiePublicId, type } = body;

    if (!selfieUrl) {
      return NextResponse.json(
        { error: "Selfie URL is required" },
        { status: 400 }
      );
    }

    const verifyType = type || "face";

    if (verifyType !== "face" && verifyType !== "selfie") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'face' or 'selfie'" },
        { status: 400 }
      );
    }

    let result: Awaited<ReturnType<typeof submitFaceVerification>>;

    if (verifyType === "face") {
      result = await submitFaceVerification(
        user._id.toString(),
        selfieUrl,
        selfiePublicId
      );
    } else {
      result = await submitSelfieVerification(
        user._id.toString(),
        selfieUrl,
        selfiePublicId
      );
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ verification: result.verification }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}