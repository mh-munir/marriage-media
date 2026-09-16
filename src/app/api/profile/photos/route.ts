import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile } from "@/models";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = (await request.json().catch(() => ({}))) as { publicId?: unknown };
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";

    if (!publicId) {
      return jsonError("A valid photo id is required.", 400);
    }

    const profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      return jsonError("Profile not found.", 404);
    }

    const photoToDelete = profile.photos.find((photo) => photo.publicId === publicId);

    if (!photoToDelete) {
      return jsonError("Photo not found.", 404);
    }

    const cloudinaryClient = getCloudinary();

    try {
      await cloudinaryClient.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Failed to delete Cloudinary image during profile photo removal:", cloudinaryError);
      return jsonError("Image deletion failed. Please try again.", 500);
    }

    const remainingPhotos = profile.photos.filter((photo) => photo.publicId !== publicId);

    if (photoToDelete.isPrimary && remainingPhotos.length > 0) {
      remainingPhotos[0] = {
        ...remainingPhotos[0],
        isPrimary: true,
      };
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: { photos: remainingPhotos } },
      { returnDocument: "after" }
    );

    if (!updatedProfile) {
      return jsonError("Failed to update profile after deleting the image.", 500);
    }

    return NextResponse.json({
      success: true,
      photo: {
        publicId,
        remainingPhotosCount: remainingPhotos.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
