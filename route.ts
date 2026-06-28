import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile } from "@/models";
import { validateBody } from "@/lib/validation";
import type { Schema } from "ajv";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const photoActionSchema: Schema = {
  type: "object",
  properties: {
    userId: { type: "string", minLength: 1 },
    publicId: { type: "string", minLength: 1 },
  },
  required: ["userId", "publicId"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const adminUser = await requireAuth(request);

    // @ts-ignore - Assuming user model has a 'role' property
    if (adminUser.role !== "admin") {
      return jsonError("Forbidden: You are not an administrator.", 403);
    }

    const { isValid, body, error } = await validateBody<{
      userId: string;
      publicId: string;
    }>(request, photoActionSchema);
    if (!isValid) {
      return jsonError(error || "Invalid request body", 400);
    }
    const { userId, publicId } = body;

    const updatedProfile = await Profile.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        "photos.publicId": publicId,
      },
      { $set: { "photos.$.isApproved": true } },
      { new: true }
    );

    if (!updatedProfile) {
      return jsonError("Profile or photo not found.", 404);
    }

    return NextResponse.json({ message: "Photo approved successfully." });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}