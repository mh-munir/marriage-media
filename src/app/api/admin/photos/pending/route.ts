import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { Profile } from "@/models";

export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const pendingPhotos = await Profile.aggregate([
      { $unwind: "$photos" },
      { $match: { "photos.isApproved": false } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$userId",
          username: "$user.username",
          photo: {
            url: "$photos.url",
            publicId: "$photos.publicId",
            isPrimary: "$photos.isPrimary",
            isApproved: "$photos.isApproved",
          },
        },
      },
    ]);

    return NextResponse.json({ pendingPhotos });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}