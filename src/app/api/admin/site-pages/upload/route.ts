export const dynamic = "force-dynamic";

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
        { folder: "site-pages/home", resource_type: "image", transformation: [{ width: 1800, height: 1200, crop: "limit", quality: "auto:good", fetch_format: "auto" }] },
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
