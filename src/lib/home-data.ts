import { cache } from "react";
import type { Types } from "mongoose";
import { ensurePublicIdForProfile } from "@/lib/public-id";

type RawHomeProfile = {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  publicId?: string;
  age?: number;
  gender?: "Male" | "Female";
  district?: string;
  division?: string;
  country?: string;
  highestEducation?: string;
  profession?: string;
  religion?: string;
  maritalStatus?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  isProfileBoosted?: boolean;
  profileViews?: number;
  lastActiveAt?: Date;
  createdAt?: Date;
};

type RawSuccessStory = {
  _id: Types.ObjectId;
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  publishedAt?: Date;
  featuredImage?: {
    url?: string;
  };
};

export type HomeProfile = {
  id: string;
  publicId: string;
  name: string;
  age: number | null;
  gender?: "Male" | "Female";
  location: string;
  profession: string;
  education: string;
  religion: string;
  maritalStatus: string;
  imageUrl: string | null;
  isPremium: boolean;
  isVerified: boolean;
  isProfileBoosted: boolean;
  profileViews: number;
  lastActiveAt: string | null;
  createdAt: string | null;
};

export type HomeSuccessStory = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

export type HomeStats = {
  activeProfiles: number;
  acceptedMatches: number;
  verifiedProfiles: number;
  premiumMembers: number;
  successStories: number;
  recentMembers: number;
};

export type HomeData = {
  featuredProfiles: HomeProfile[];
  premiumMembers: HomeProfile[];
  recentMembers: HomeProfile[];
  successStories: HomeSuccessStory[];
  stats: HomeStats;
};

const PROFILE_SELECT =
  "userId publicId age gender district division country highestEducation profession religion maritalStatus isPremium isVerified isProfileBoosted profileViews lastActiveAt createdAt";

const publicProfileFilter = {
  isDeactivated: false,
};

function toIsoString(value: Date | undefined): string | null {
  return value instanceof Date ? value.toISOString() : null;
}

async function mapProfile(profile: RawHomeProfile): Promise<HomeProfile> {
  const location = [profile.district, profile.division, profile.country]
    .filter(Boolean)
    .join(", ");
  const publicId = profile.userId
    ? await ensurePublicIdForProfile(profile.userId, profile.publicId)
    : profile.publicId?.trim() || `IMD-${profile._id.toString().slice(-6).toUpperCase()}`;

  return {
    id: profile.userId?.toString() || profile._id.toString(),
    publicId,
    // Kept as a non-identifying fallback for the legacy CMS renderer.
    name: "Member",
    age: typeof profile.age === "number" ? profile.age : null,
    gender: profile.gender,
    location: location || "Bangladesh",
    profession: profile.profession || "Profession not added",
    education: profile.highestEducation || "Education not added",
    religion: profile.religion || "Religion not added",
    maritalStatus: profile.maritalStatus || "Marital status not added",
    // Home cards deliberately never receive members' photo URLs.
    imageUrl: null,
    isPremium: Boolean(profile.isPremium),
    isVerified: Boolean(profile.isVerified),
    isProfileBoosted: Boolean(profile.isProfileBoosted),
    profileViews: profile.profileViews ?? 0,
    lastActiveAt: toIsoString(profile.lastActiveAt),
    createdAt: toIsoString(profile.createdAt),
  };
}

function mapSuccessStory(story: RawSuccessStory): HomeSuccessStory {
  return {
    id: story._id.toString(),
    title: story.title || "Success Story",
    slug: story.slug || "",
    excerpt: story.excerpt || "",
    category: story.category || "Success Stories",
    imageUrl: story.featuredImage?.url || null,
    publishedAt: toIsoString(story.publishedAt),
  };
}

async function connectHomeDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Home page database content is unavailable because MONGODB_URI is not configured.");
  }

  const { default: connectToDatabase } = await import("@/lib/mongodb");
  await connectToDatabase();
}

export const getHomeData = cache(async (): Promise<HomeData> => {
  await connectHomeDatabase();

  const now = new Date();
  const [{ default: Profile }, { default: Interest }, { default: Blog }] =
    await Promise.all([
      import("@/models/Profile"),
      import("@/models/Interest"),
      import("@/models/Blog"),
    ]);

  const activePremiumFilter = {
    ...publicProfileFilter,
    isPremium: true,
    premiumExpiry: { $gt: now },
  };

  const successStoryFilter = {
    isPublished: true,
    category: /success stories/i,
  };

  const [
    premiumMembers,
    successStories,
    activeProfiles,
    acceptedMatches,
    verifiedProfiles,
    premiumMembersCount,
    successStoriesCount,
    recentMembersCount,
  ] = await Promise.all([
    Profile.find(activePremiumFilter)
      .select(PROFILE_SELECT)
      .sort({ premiumExpiry: -1, lastActiveAt: -1 })
      .limit(12)
      .lean<RawHomeProfile[]>()
      .exec(),
    Blog.find(successStoryFilter)
      .select("title slug excerpt category featuredImage publishedAt")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean<RawSuccessStory[]>()
      .exec(),
    Profile.countDocuments(publicProfileFilter),
    Interest.countDocuments({ status: "accepted" }),
    Profile.countDocuments({ ...publicProfileFilter, isVerified: true }),
    Profile.countDocuments(activePremiumFilter),
    Blog.countDocuments(successStoryFilter),
    Profile.countDocuments({
      ...publicProfileFilter,
      createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  return {
    featuredProfiles: [],
    premiumMembers: await Promise.all(premiumMembers.map(mapProfile)),
    recentMembers: [],
    successStories: successStories.map(mapSuccessStory),
    stats: {
      activeProfiles,
      acceptedMatches,
      verifiedProfiles,
      premiumMembers: premiumMembersCount,
      successStories: successStoriesCount,
      recentMembers: recentMembersCount,
    },
  };
});
