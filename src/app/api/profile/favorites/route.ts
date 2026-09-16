export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Favorite, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateMatchScore, type MatchableProfile, type PartnerPreferences } from "@/lib/profile-matching";
import { getActiveSubscription } from "@/lib/profile-access";

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
    const canViewProfileImages = Boolean(await getActiveSubscription(user._id));

    const favorites = await Favorite.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean<{ _id: Types.ObjectId; profileId: Types.ObjectId; createdAt: Date }[]>()
      .exec();

    if (!favorites.length) {
      return NextResponse.json({ favorites: [] });
    }

    const profileIds = favorites.map((favorite) => favorite.profileId);
    const currentProfile = await Profile.findOne({ userId: user._id, isDeactivated: false })
      .select("age height weight maritalStatus religion caste motherTongue highestEducation annualIncome country division district thana union area familyType familyStatus familyValues diet smoke hobbies isVerified partnerPreferences")
      .lean<MatchableProfile & { partnerPreferences?: PartnerPreferences }>();
    const profiles = await Profile.find({ userId: { $in: profileIds }, isVisible: true, isDeactivated: false })
      .select("userId publicId firstName lastName age height weight maritalStatus profession highestEducation annualIncome country division district thana union area familyType familyStatus familyValues religion caste motherTongue diet smoke hobbies photos isPremium isVerified lastActiveAt profileViews createdAt")
      .lean<{
        userId: Types.ObjectId;
        publicId?: string;
        firstName?: string;
        lastName?: string;
        age?: number;
        height?: string;
        profession?: string;
        highestEducation?: string;
        district?: string;
        division?: string;
        area?: string;
        religion?: string;
        photos?: Array<{ url?: string }>;
        isPremium?: boolean;
        isVerified?: boolean;
        lastActiveAt?: Date;
        profileViews?: number;
        createdAt?: Date;
      }[]>()
      .exec();

    const profileMap = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));

    const mappedFavorites = favorites.map((favorite) => {
      const profile = profileMap.get(favorite.profileId.toString());
      const matchPercentage = profile ? calculateMatchScore(profile, currentProfile) : 0;
      return {
        id: favorite._id.toString(),
        profileUserId: profile?.userId?.toString() || favorite.profileId.toString(),
        userId: profile?.userId?.toString() || favorite.profileId.toString(),
        firstName: profile?.firstName || "Saved",
        lastName: profile?.lastName || "Profile",
        name: profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : "Saved profile",
        age: profile?.age ?? null,
        height: profile?.height ?? "",
        location: profile?.district || profile?.division || "Bangladesh",
        religion: profile?.religion ?? "",
        profession: profile?.profession ?? "",
        education: profile?.highestEducation ?? "",
        compatibility: matchPercentage,
        matchPercentage,
        isFavorite: true,
        publicId: profile?.publicId || "",
        imageUrl: canViewProfileImages ? profile?.photos?.[0]?.url || null : null,
        division: profile?.division || "",
        district: profile?.district || "",
        area: profile?.area || "",
        profileViews: profile?.profileViews || 0,
        createdAt: profile?.createdAt || null,
        isOnline: Boolean(profile?.lastActiveAt && new Date(profile.lastActiveAt).getTime() > Date.now() - 15 * 60 * 1000),
        isPremium: Boolean(profile?.isPremium),
        isVerified: Boolean(profile?.isVerified),
        addedAt: favorite.createdAt ? new Date(favorite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently saved",
      };
    });

    mappedFavorites.sort((first, second) => second.matchPercentage - first.matchPercentage);

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
