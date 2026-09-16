export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { UploadApiResponse } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const actor = await requireAdmin(request);
    const formData = await request.formData();
    const requestedUserId = formData.get("userId");
    const targetUserId = typeof requestedUserId === "string" && requestedUserId ? requestedUserId : actor._id.toString();
    const target = await User.findById(targetUserId).select("_id role").lean();
    if (!target || (target.role !== "admin" && target.role !== "superadmin")) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }
    if (actor.role !== "superadmin" && actor._id.toString() !== targetUserId) {
      return NextResponse.json({ error: "Only the account owner or superadmin can update this avatar" }, { status: 403 });
    }
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No image selected" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please select an image file" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Avatar must be smaller than 5 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudinary = getCloudinary();
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "admin/avatars", resource_type: "image", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto:good", fetch_format: "auto" }] },
        (error, uploadResult) => error ? reject(error) : uploadResult ? resolve(uploadResult) : reject(new Error("Avatar upload failed")),
      );
      stream.end(buffer);
    });

    await User.findByIdAndUpdate(targetUserId, { avatarUrl: result.secure_url, avatarPublicId: result.public_id });
    return NextResponse.json({ avatarUrl: result.secure_url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Avatar upload failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}