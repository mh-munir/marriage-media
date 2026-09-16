export const dynamic = "force-dynamic";

const MEDIA_FOLDER = "site-pages/home";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const cloudinary = getCloudinary();
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `${MEDIA_FOLDER}/`,
      resource_type: "image",
      max_results: 100,
    });

    return NextResponse.json({
      assets: result.resources.map((resource: { public_id: string; secure_url: string; width: number; height: number; bytes: number; created_at: string }) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        createdAt: resource.created_at,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not load media library";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { UploadApiResponse } from "cloudinary";
import { requireAdmin } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const file = (await request.formData()).get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No image selected" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please select an image file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 10 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const cloudinary = getCloudinary();
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: MEDIA_FOLDER, resource_type: "image", transformation: [{ width: 1800, height: 1200, crop: "limit", quality: "auto:good", fetch_format: "auto" }] },
        (error, uploadResult) => {
          if (error) return reject(error);
          if (!uploadResult) return reject(new Error("Image upload failed"));
          resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const publicId = new URL(request.url).searchParams.get("publicId")?.trim() || "";
    if (!publicId || !publicId.startsWith(`${MEDIA_FOLDER}/`)) {
      return NextResponse.json({ error: "A valid media asset is required" }, { status: 400 });
    }

    const result = await getCloudinary().uploader.destroy(publicId, { resource_type: "image" });
    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json({ error: "Could not delete media asset" }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not delete media asset";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
