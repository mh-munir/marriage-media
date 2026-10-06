import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";
import { validateBody } from "@/lib/validation";
import { Profile, User } from "@/models";

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
    if (!isValid || !body) {
      return jsonError(error || "Invalid request body", 400);
    }

    const { userId, publicId } = body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return jsonError("Invalid user id.", 400);
    }

    const profile = await Profile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      photos: { $elemMatch: { publicId, isApproved: false } },
    });
    const rejectedPhoto = profile?.photos.find(
      (photo) => photo.publicId === publicId && !photo.isApproved,
    );

    if (!profile || !rejectedPhoto) {
      return jsonError("Pending photo not found.", 404);
    }

    await getCloudinary().uploader.destroy(publicId, { resource_type: "image" });

    const remainingPhotos = profile.photos.filter(
      (photo) => photo.publicId !== publicId,
    );
    const nextPrimaryIndex = rejectedPhoto.isPrimary
      ? remainingPhotos.findIndex((photo) => photo.isApproved && photo.url)
      : remainingPhotos.findIndex((photo) => photo.isPrimary && photo.url);
    const fallbackPrimaryIndex =
      nextPrimaryIndex === -1
        ? remainingPhotos.findIndex((photo) => photo.url)
        : nextPrimaryIndex;
    const normalizedPhotos = remainingPhotos.map((photo, index) => ({
      url: photo.url,
      publicId: photo.publicId,
      isPrimary: index === fallbackPrimaryIndex,
      isApproved: photo.isApproved,
    }));

    const updatedProfile = await Profile.findOneAndUpdate(
      {
        userId: profile.userId,
        photos: { $elemMatch: { publicId, isApproved: false } },
      },
      { $set: { photos: normalizedPhotos } },
      { returnDocument: "after" },
    );

    if (!updatedProfile) {
      return jsonError("Failed to remove the rejected photo from the profile.", 500);
    }

    await User.findByIdAndUpdate(profile.userId, {
      $set: {
        avatarUrl: normalizedPhotos.find((photo) => photo.isPrimary)?.url || "",
      },
    });

    return NextResponse.json({ message: "Photo rejected and removed." });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
