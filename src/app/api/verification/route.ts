export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import {
  getVerificationStatus,
  submitProfileVerification,
} from "@/lib/verification";

/**
 * GET /api/verification
 * Get user's complete verification status including badge, timeline, and all verifications
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const status = await getVerificationStatus(user._id.toString());

    return NextResponse.json(status);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * POST /api/verification
 * Submit a verification request (NID, Passport, Face, Selfie, Photo, Identity)
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const {
      type,
      documentUrl,
      documentPublicId,
      documentType,
      documentNumber,
      selfieUrl,
      selfiePublicId,
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Verification type is required" },
        { status: 400 }
      );
    }

    const validTypes = ["profile", "phone"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid verification type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    let result: { verification: any; error?: string };

    switch (type) {
      case "profile":
        result = await submitProfileVerification(user._id.toString(), documentUrl || "profile-review");
        break;

      case "phone":
        return NextResponse.json({ error: "Phone verification must be submitted via /api/verification/phone" }, { status: 400 });
      default:
        return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
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