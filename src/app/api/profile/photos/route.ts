import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile, User } from "@/models";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const queryPublicId = request.nextUrl.searchParams.get("publicId") || "";
    const body = (await request.json().catch(() => ({}))) as { publicId?: unknown };
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : queryPublicId.trim();

    if (!publicId) {
      return jsonError("A valid photo id is required.", 400);
    }

    const profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      const onboardingUser = await User.findById(user._id).select("onboardingData");
      const onboardingPhotos = Array.isArray(onboardingUser?.onboardingData?.photos)
        ? onboardingUser.onboardingData.photos as { publicId?: string }[]
        : [];
      if (!publicId.startsWith(`profiles/${user._id.toString()}/`)) {
        return jsonError("Photo not found.", 404);
      }

      try {
        await getCloudinary().uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete onboarding Cloudinary image:", cloudinaryError);
        return jsonError("Image deletion failed. Please try again.", 500);
      }

      if (onboardingPhotos.some((photo) => photo.publicId === publicId)) {
        await User.findByIdAndUpdate(user._id, {
          $set: { "onboardingData.photos": onboardingPhotos.filter((photo) => photo.publicId !== publicId) },
        });
      }
      return NextResponse.json({ success: true, photo: { publicId, remainingPhotosCount: onboardingPhotos.length - 1 } });
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
    const currentPrimaryIndex = remainingPhotos.findIndex(
      (photo) => photo.isPrimary && photo.url,
    );
    const nextPrimaryIndex =
      photoToDelete.isPrimary || currentPrimaryIndex === -1
        ? remainingPhotos.findIndex((photo) => photo.url)
        : currentPrimaryIndex;
    const normalizedPhotos = remainingPhotos.map((photo, index) => ({
      ...photo,
      isPrimary: index === nextPrimaryIndex,
    }));

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: { photos: normalizedPhotos } },
      { returnDocument: "after" }
    );

    if (!updatedProfile) {
      return jsonError("Failed to update profile after deleting the image.", 500);
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        avatarUrl: normalizedPhotos.find((photo) => photo.isPrimary)?.url || "",
      },
    });

    return NextResponse.json({
      success: true,
      photo: {
        publicId,
        remainingPhotosCount: normalizedPhotos.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
