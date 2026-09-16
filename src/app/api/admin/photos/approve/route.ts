import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { Profile } from "@/models";
import { validateBody } from "@/lib/validation";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const photoActionSchema = {
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
    await requireAdmin(request);

    const { isValid, body, error } = await validateBody<{
      userId: string;
      publicId: string;
    }>(request, photoActionSchema);
    if (!isValid) {
      return jsonError(error || "Invalid request body", 400);
    }
    if (!body) {
      return jsonError("Invalid request body", 400);
    }
    const { userId, publicId } = body;

    const updatedProfile = await Profile.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        "photos.publicId": publicId,
      },
      { $set: { "photos.$.isApproved": true } },
      { returnDocument: "after" }
    );

    if (!updatedProfile) {
      return jsonError("Profile or photo not found.", 404);
    }

    return NextResponse.json({ message: "Photo approved successfully." });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}