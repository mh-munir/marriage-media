export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Verification } from "@/models";
import { requireAuth } from "@/lib/auth";
import {
  getVerificationStatus,
  submitNIDVerification,
  submitPassportVerification,
  submitFaceVerification,
  submitSelfieVerification,
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

    const validTypes = ["nid", "passport", "face", "selfie", "photo", "identity"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid verification type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    let result: { verification: any; error?: string };

    switch (type) {
      case "nid":
        if (!documentUrl || !documentNumber) {
          return NextResponse.json(
            { error: "Document URL and NID number are required" },
            { status: 400 }
          );
        }
        result = await submitNIDVerification(
          user._id.toString(),
          documentUrl,
          documentNumber,
          documentPublicId
        );
        break;

      case "passport":
        if (!documentUrl || !documentNumber) {
          return NextResponse.json(
            { error: "Document URL and passport number are required" },
            { status: 400 }
          );
        }
        result = await submitPassportVerification(
          user._id.toString(),
          documentUrl,
          documentNumber,
          documentPublicId
        );
        break;

      case "face":
        if (!selfieUrl) {
          return NextResponse.json(
            { error: "Selfie URL is required for face verification" },
            { status: 400 }
          );
        }
        result = await submitFaceVerification(
          user._id.toString(),
          selfieUrl,
          selfiePublicId
        );
        break;

      case "selfie":
        if (!selfieUrl) {
          return NextResponse.json(
            { error: "Selfie URL is required for selfie verification" },
            { status: 400 }
          );
        }
        result = await submitSelfieVerification(
          user._id.toString(),
          selfieUrl,
          selfiePublicId
        );
        break;

      default:
        // Legacy support for photo/identity types
        if (!documentUrl) {
          return NextResponse.json(
            { error: "Document URL is required" },
            { status: 400 }
          );
        }

        // Check for existing pending verification
        const existing = await Verification.findOne({
          userId: user._id,
          type,
          status: "pending",
        });

        if (existing) {
          return NextResponse.json(
            { error: "You already have a pending verification request" },
            { status: 409 }
          );
        }

        const verification = await Verification.create({
          userId: user._id,
          type,
          documentUrl,
          documentPublicId: documentPublicId || "",
          documentType: documentType || type,
          selfieUrl: selfieUrl || "",
          selfiePublicId: selfiePublicId || "",
          contributesToBadge: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timeline: [
            {
              status: "pending",
              timestamp: new Date(),
              note: `${type} verification submitted`,
            },
          ],
        });

        result = { verification };
        break;
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