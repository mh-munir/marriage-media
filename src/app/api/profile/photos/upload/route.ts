import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile } from "@/models";
import { cloudinary } from "@/lib/cloudinary";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getSingleFileFromForm(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) return null;
  return file;
}

async function bufferFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const file = await getSingleFileFromForm(request);
    if (!file) return jsonError("Missing file field (multipart/form-data).");

    if (file.size > MAX_BYTES) return jsonError("File too large. Max 5MB.");

    if (!ALLOWED_MIME.has(file.type)) {
      return jsonError("Invalid file type. Use JPG, PNG, or WEBP.");
    }

    const buffer = await bufferFromFile(file);

    // Normalize + crop to square
    const croppedResized = sharp(buffer).resize(1024, 1024, {
      fit: "cover",
      position: "center",
    });

    // Compress (JPEG for predictable size)
    const compressedBuffer = await croppedResized
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    // Use timestamp for uniqueness
    const timestamp = Date.now();
    const publicIdBase = `profiles/${user._id.toString()}/avatar/${timestamp}`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profiles",
          public_id: publicIdBase,
          overwrite: true,
          resource_type: "image",
          format: "jpg",
          transformation: [{ quality: "auto:good" }],
        },
        (error: any, result: any) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary upload failed."));
          resolve(result);
        }
      );

      uploadStream.end(compressedBuffer);
    });

    const url = uploadResult?.secure_url as string | undefined;
    const cloudinaryPublicId = uploadResult?.public_id as string | undefined;

    if (!url || !cloudinaryPublicId) {
      return jsonError("Cloudinary returned an invalid response.");
    }

    // Mark previous primary as not primary
    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          "photos.$[elem].isPrimary": false,
          "photos.$[elem].isApproved": false,
        },
      },
      {
        arrayFilters: [{ "elem.isPrimary": true }],
      }
    );

    // Store new primary photo
    const updated = await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        $push: {
          photos: {
            url,
            publicId: cloudinaryPublicId,
            isPrimary: true,
            isApproved: true,
          },
        },
      },
      { new: true }
    );

    if (!updated) return jsonError("Profile not found.", 404);

    const primary = updated.photos.find((p) => p.isPrimary) ?? updated.photos[0];

    return NextResponse.json({
      photo: primary
        ? {
            url: primary.url,
            publicId: primary.publicId,
            isPrimary: primary.isPrimary,
            isApproved: primary.isApproved,
          }
        : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
