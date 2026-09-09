import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { IProfile, Profile } from "@/models";
import { getCloudinary } from "@/lib/cloudinary";
import sharp from "sharp";
import { UploadApiResponse } from "cloudinary";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let cloudinaryPublicId: string | undefined;
  let cloudinaryClient: ReturnType<typeof getCloudinary> | undefined;

  try {
    const configuredCloudinary = getCloudinary();
    cloudinaryClient = configuredCloudinary;
    await connectToDatabase();
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonError("No file uploaded.");
    }

    if (!file.type.startsWith("image/")) {
      return jsonError("Please upload an image file.");
    }

    if (file.size > 10 * 1024 * 1024) {
      return jsonError("Image must be smaller than 10 MB.");
    }

    const profile = await Profile.findOne<IProfile>({ userId: user._id });

    if (!profile) {
      return jsonError("Profile not found.", 404);
    }

    if (profile.photos.length >= 5) {
      return jsonError("You can upload a maximum of 5 images.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    const timestamp = Date.now();
    const publicIdBase = `profiles/${user._id.toString()}/avatar/${timestamp}`;

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = configuredCloudinary.uploader.upload_stream(
            {
                folder: "profiles",
                public_id: publicIdBase,
                overwrite: true,
                resource_type: "image",
                format: "jpg",
                transformation: [{ quality: "auto:good" }],
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Cloudinary upload failed."));
                resolve(result);
            }
        );
        uploadStream.end(compressedBuffer);
    });

    const url = uploadResult.secure_url;
    cloudinaryPublicId = uploadResult.public_id;

    if (!url || !cloudinaryPublicId) {
      return jsonError("Cloudinary returned an invalid response.");
    }

    const isFirstPhoto = profile.photos.length === 0;

    const newPhoto = {
        url,
        publicId: cloudinaryPublicId,
        isPrimary: isFirstPhoto,
        isApproved: isFirstPhoto, // Auto-approve the first photo
    };

    const updated = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $push: { photos: newPhoto } },
      { new: true }
    );

    if (!updated) return jsonError("Failed to update profile.", 500);

    return NextResponse.json({
      photo: {
         url: newPhoto.url,
         publicId: newPhoto.publicId,
         isPrimary: newPhoto.isPrimary,
         isApproved: newPhoto.isApproved,
      }
    });
  } catch (error: unknown) {
    if (cloudinaryPublicId) {
        console.error("Database update failed, cleaning up orphaned Cloudinary image:", cloudinaryPublicId);
        try {
            await cloudinaryClient?.uploader.destroy(cloudinaryPublicId);
        } catch (cleanupError) {
            console.error("Failed to cleanup Cloudinary image during error handling:", cleanupError);
        }
    }
    const uploadError = error as { http_code?: number; message?: string };
    if (
      uploadError.http_code === 401 ||
      uploadError.message === "unknown api_key" ||
      uploadError.message === "cloud_name mismatch"
    ) {
      console.error("Cloudinary authentication failed. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
      return jsonError("Image service is temporarily unavailable. Please try again later.", 503);
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}