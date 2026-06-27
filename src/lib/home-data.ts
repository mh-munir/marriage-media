import { cache } from "react";
import type { Types } from "mongoose";

type HomePhoto = {
  url: string;
  isPrimary?: boolean;
  isApproved?: boolean;
};

type RawHomeProfile = {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
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
  photos?: HomePhoto[];
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
  name: string;
  age: number | null;
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
  "firstName lastName age gender district division country highestEducation profession religion maritalStatus photos isPremium isVerified isProfileBoosted profileViews lastActiveAt createdAt";

const visibleProfileFilter = {
  isVisible: true,
  isDeactivated: false,
};

function getPrimaryPhoto(photos: HomePhoto[] | undefined): string | null {
  const approvedPhotos = photos?.filter((photo) => photo.isApproved && photo.url) ?? [];
  return (
    approvedPhotos.find((photo) => photo.isPrimary)?.url ??
    approvedPhotos[0]?.url ??
    null
  );
}

function toIsoString(value: Date | undefined): string | null {
  return value instanceof Date ? value.toISOString() : null;
}

function mapProfile(profile: RawHomeProfile): HomeProfile {
  const firstName = profile.firstName?.trim() || "Member";
  const lastName = profile.lastName?.trim() || "";
  const location = [profile.district, profile.division, profile.country]
    .filter(Boolean)
    .join(", ");

  return {
    id: profile._id.toString(),
    name: [firstName, lastName].filter(Boolean).join(" "),
    age: typeof profile.age === "number" ? profile.age : null,
    location: location || "Bangladesh",
    profession: profile.profession || "Profession not added",
    education: profile.highestEducation || "Education not added",
    religion: profile.religion || "Religion not added",
    maritalStatus: profile.maritalStatus || "Marital status not added",
    imageUrl: getPrimaryPhoto(profile.photos),
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
    ...visibleProfileFilter,
    isPremium: true,
    premiumExpiry: { $gt: now },
  };

  const successStoryFilter = {
    isPublished: true,
    category: /success stories/i,
  };

  const [
    featuredProfiles,
    premiumMembers,
    recentMembers,
    successStories,
    activeProfiles,
    acceptedMatches,
    verifiedProfiles,
    premiumMembersCount,
    successStoriesCount,
    recentMembersCount,
  ] = await Promise.all([
    Profile.find({ ...visibleProfileFilter, isProfileBoosted: true })
      .select(PROFILE_SELECT)
      .sort({ boostedAt: -1, profileViews: -1, lastActiveAt: -1 })
      .limit(6)
      .lean<RawHomeProfile[]>()
      .exec(),
    Profile.find(activePremiumFilter)
      .select(PROFILE_SELECT)
      .sort({ premiumExpiry: -1, lastActiveAt: -1 })
      .limit(6)
      .lean<RawHomeProfile[]>()
      .exec(),
    Profile.find(visibleProfileFilter)
      .select(PROFILE_SELECT)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean<RawHomeProfile[]>()
      .exec(),
    Blog.find(successStoryFilter)
      .select("title slug excerpt category featuredImage publishedAt")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean<RawSuccessStory[]>()
      .exec(),
    Profile.countDocuments(visibleProfileFilter),
    Interest.countDocuments({ status: "accepted" }),
    Profile.countDocuments({ ...visibleProfileFilter, isVerified: true }),
    Profile.countDocuments(activePremiumFilter),
    Blog.countDocuments(successStoryFilter),
    Profile.countDocuments({
      ...visibleProfileFilter,
      createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  return {
    featuredProfiles: featuredProfiles.map(mapProfile),
    premiumMembers: premiumMembers.map(mapProfile),
    recentMembers: recentMembers.map(mapProfile),
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
