import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Favorite, Profile, ProfileView } from "@/models";
import { requireAuth } from "@/lib/auth";

type ViewRecord = {
  viewedId: Types.ObjectId;
  viewCount: number;
  lastViewedAt: Date;
};

type ViewedProfile = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  age?: number;
  height?: string;
  religion?: string;
  caste?: string;
  division?: string;
  district?: string;
  area?: string;
  highestEducation?: string;
  profession?: string;
  isPremium?: boolean;
  premiumExpiry?: Date;
  isVerified?: boolean;
  isProfileBoosted?: boolean;
  boostedAt?: Date;
  lastActiveAt?: Date;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
  aboutMe?: string;
  maritalStatus?: string;
};

type ViewBody = {
  profileUserId?: string;
};

const PROFILE_SELECT =
  "userId firstName lastName age height religion caste division district area highestEducation profession isPremium premiumExpiry isVerified isProfileBoosted boostedAt lastActiveAt photos aboutMe maritalStatus";

function parsePositiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function getPrimaryPhoto(photos: ViewedProfile["photos"]): string | null {
  const approved = photos?.filter((photo) => photo.isApproved && photo.url) ?? [];
  return approved.find((photo) => photo.isPrimary)?.url ?? approved[0]?.url ?? null;
}

function errorStatus(message: string): number {
  return message === "Unauthorized" ? 401 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1, 10_000);
    const limit = parsePositiveInt(searchParams.get("limit"), 12, 50);
    const skip = (page - 1) * limit;

    const [viewRecords, total] = await Promise.all([
      ProfileView.find({ viewerId: user._id })
        .sort({ lastViewedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("viewedId viewCount lastViewedAt")
        .lean<ViewRecord[]>()
        .exec(),
      ProfileView.countDocuments({ viewerId: user._id }),
    ]);

    if (viewRecords.length === 0) {
      return NextResponse.json({
        profiles: [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    const viewedUserIds = viewRecords.map((record) => record.viewedId);
    const [profiles, favorites] = await Promise.all([
      Profile.find({
        userId: { $in: viewedUserIds },
        isVisible: true,
        isDeactivated: false,
      })
        .select(PROFILE_SELECT)
        .lean<ViewedProfile[]>()
        .exec(),
      Favorite.find({
        userId: user._id,
        profileId: { $in: viewedUserIds },
      })
        .select("profileId")
        .lean<{ profileId: Types.ObjectId }[]>()
        .exec(),
    ]);

    const now = new Date();
    const onlineSince = now.getTime() - 15 * 60 * 1000;
    const favoriteIds = new Set(favorites.map((favorite) => favorite.profileId.toString()));
    const profileMap = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));

    const enrichedProfiles = viewRecords.flatMap((record) => {
      const profile = profileMap.get(record.viewedId.toString());
      if (!profile) return [];

      const lastActiveAt = profile.lastActiveAt instanceof Date ? profile.lastActiveAt : null;

      return {
        _id: profile._id.toString(),
        userId: profile.userId.toString(),
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        age: profile.age ?? null,
        height: profile.height || "",
        religion: profile.religion || "",
        caste: profile.caste || "",
        division: profile.division || "",
        district: profile.district || "",
        area: profile.area || "",
        highestEducation: profile.highestEducation || "",
        profession: profile.profession || "",
        imageUrl: getPrimaryPhoto(profile.photos),
        isPremium: Boolean(
          profile.isPremium &&
            profile.premiumExpiry instanceof Date &&
            profile.premiumExpiry > now
        ),
        isVerified: Boolean(profile.isVerified),
        isProfileBoosted: Boolean(profile.isProfileBoosted),
        isFavorite: favoriteIds.has(profile.userId.toString()),
        isOnline: Boolean(lastActiveAt && lastActiveAt.getTime() >= onlineSince),
        lastActiveAt: lastActiveAt?.toISOString() ?? null,
        aboutMe: profile.aboutMe || "",
        maritalStatus: profile.maritalStatus || "",
        viewCount: record.viewCount,
        lastViewedAt: record.lastViewedAt.toISOString(),
      };
    });

    return NextResponse.json({
      profiles: enrichedProfiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = (await request.json()) as ViewBody;
    const profileUserId = body.profileUserId;

    if (!profileUserId || !Types.ObjectId.isValid(profileUserId)) {
      return NextResponse.json({ error: "Valid profileUserId is required" }, { status: 400 });
    }

    if (profileUserId === user._id.toString()) {
      return NextResponse.json({ error: "You cannot view your own profile" }, { status: 400 });
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

    await Promise.all([
      ProfileView.findOneAndUpdate(
        { viewerId: user._id, viewedId: profile.userId },
        {
          $inc: { viewCount: 1 },
          $set: { lastViewedAt: new Date() },
          $setOnInsert: { viewerId: user._id, viewedId: profile.userId },
        },
        { new: true, upsert: true }
      ),
      Profile.updateOne({ userId: profile.userId }, { $inc: { profileViews: 1 } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}
