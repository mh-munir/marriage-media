import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Verification, Profile, User } from "@/models";
import { requireAuth } from "@/lib/auth";

// Submit verification request
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { type, documentUrl, documentPublicId, documentType, selfieUrl, selfiePublicId } = body;

    if (!type || !documentUrl) {
      return NextResponse.json(
        { error: "Type and document URL are required" },
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
      documentType: documentType || "",
      selfieUrl: selfieUrl || "",
      selfiePublicId: selfiePublicId || "",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return NextResponse.json({ verification }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Get user's verification status
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const verifications = await Verification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ verifications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}