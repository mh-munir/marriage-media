export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Favorite, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

type FavoriteBody = {
  profileUserId?: string;
};

function unauthorizedStatus(message: string): number {
  return message === "Unauthorized" ? 401 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const favorites = await Favorite.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean<{ _id: Types.ObjectId; profileId: Types.ObjectId; createdAt: Date }[]>()
      .exec();

    if (!favorites.length) {
      return NextResponse.json({ favorites: [] });
    }

    const profileIds = favorites.map((favorite) => favorite.profileId);
    const profiles = await Profile.find({ userId: { $in: profileIds } })
      .select("userId firstName lastName age height profession highestEducation photos isPremium isVerified district division religion")
      .lean<{
        userId: Types.ObjectId;
        firstName?: string;
        lastName?: string;
        age?: number;
        height?: string;
        profession?: string;
        highestEducation?: string;
        district?: string;
        division?: string;
        religion?: string;
        photos?: Array<{ url?: string }>;
        isPremium?: boolean;
        isVerified?: boolean;
      }[]>()
      .exec();

    const profileMap = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));

    const mappedFavorites = favorites.map((favorite) => {
      const profile = profileMap.get(favorite.profileId.toString());
      return {
        id: favorite._id.toString(),
        profileUserId: profile?.userId?.toString() || favorite.profileId.toString(),
        name: profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : "Saved profile",
        age: profile?.age ?? null,
        height: profile?.height ?? "",
        location: profile?.district || profile?.division || "Bangladesh",
        religion: profile?.religion ?? "",
        profession: profile?.profession ?? "",
        education: profile?.highestEducation ?? "",
        compatibility: profile?.isPremium ? 92 : 86,
        isPremium: Boolean(profile?.isPremium),
        isVerified: Boolean(profile?.isVerified),
        addedAt: favorite.createdAt ? new Date(favorite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently saved",
      };
    });

    return NextResponse.json({ favorites: mappedFavorites });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: unauthorizedStatus(message) });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = (await request.json()) as FavoriteBody;
    const profileUserId = body.profileUserId;

    if (!profileUserId || !Types.ObjectId.isValid(profileUserId)) {
      return NextResponse.json({ error: "Valid profileUserId is required" }, { status: 400 });
    }

    if (profileUserId === user._id.toString()) {
      return NextResponse.json({ error: "You cannot favorite your own profile" }, { status: 400 });
    }

    const profile = await Profile.findOne({
      userId: profileUserId,
      isVisible: true,
      isDeactivated: false,
    })
      .select("userId")
      .lean<{ userId: Types.ObjectId } | null>()
      .exec();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = await Favorite.findOne({
      userId: user._id,
      profileId: profile.userId,
    })
      .select("_id")
      .lean<{ _id: Types.ObjectId } | null>()
      .exec();

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return NextResponse.json({ isFavorite: false });
    }

    await Favorite.create({
      userId: user._id,
      profileId: profile.userId,
    });

    return NextResponse.json({ isFavorite: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: unauthorizedStatus(message) });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const profileUserId = new URL(request.url).searchParams.get("profileUserId");

    if (!profileUserId || !Types.ObjectId.isValid(profileUserId)) {
      return NextResponse.json({ error: "Valid profileUserId is required" }, { status: 400 });
    }

    await Favorite.deleteOne({
      userId: user._id,
      profileId: profileUserId,
    });

    return NextResponse.json({ isFavorite: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: unauthorizedStatus(message) });
  }
}
