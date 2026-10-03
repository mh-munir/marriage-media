export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import type { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Favorite, Profile, User } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/profile-matching";
import { ensurePublicIdForProfile } from "@/lib/public-id";
import { getActiveSubscription } from "@/lib/profile-access";

type ProfilePhoto = {
  url?: string;
  isPrimary?: boolean;
  isApproved?: boolean;
};

type SearchProfile = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  publicId?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: number;
  height?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  country?: string;
  division?: string;
  district?: string;
  area?: string;
  union?: string;
  highestEducation?: string;
  profession?: string;
  workingWith?: string;
  familyStatus?: string;
  photos?: ProfilePhoto[];
  isPremium?: boolean;
  isVerified?: boolean;
  isProfileBoosted?: boolean;
  boostedAt?: Date;
  premiumExpiry?: Date;
  lastActiveAt?: Date;
  profileViews?: number;
  maritalStatus?: string;
  profileCreatedBy?: string;
  createdAt?: Date;
  partnerPreferences?: Record<string, string>;
};

const PROFILE_SELECT =
  "userId publicId firstName lastName gender age height weight maritalStatus religion caste motherTongue country division district thana union area nationality highestEducation institution profession workingWith annualIncome familyType familyStatus familyValues diet smoke drink hobbies photos isPremium isVerified isProfileBoosted boostedAt premiumExpiry lastActiveAt profileViews profileCreatedBy createdAt";

function parsePositiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function getSort(sortBy: string | null): Record<string, 1 | -1> {
  switch (sortBy) {
    case "newest":
      return { createdAt: -1, _id: -1 };
    case "oldest":
      return { createdAt: 1, _id: 1 };
    case "age-asc":
      return { age: 1, lastActiveAt: -1 };
    case "age-desc":
      return { age: -1, lastActiveAt: -1 };
    case "recently-active":
      return { lastActiveAt: -1, isPremium: -1 };
    case "profile-completeness":
    case "views-desc":
      return { profileViews: -1, lastActiveAt: -1 };
    case "premium":
      return { isPremium: -1, premiumExpiry: -1, lastActiveAt: -1 };
    case "verified":
      return { isVerified: -1, lastActiveAt: -1 };
    default:
      return {
        isProfileBoosted: -1,
        isPremium: -1,
        isVerified: -1,
        lastActiveAt: -1,
      };
  }
}

function getPrimaryPhoto(photos: ProfilePhoto[] | undefined): string | null {
  const approved = photos?.filter((photo) => photo.isApproved && photo.url) ?? [];
  return approved.find((photo) => photo.isPrimary)?.url ?? approved[0]?.url ?? null;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser(request);
    const canViewProfileImages = user ? Boolean(await getActiveSubscription(user._id)) : false;

    const { searchParams } = new URL(request.url);

    // Build filter
    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: user ? { $ne: user._id } : { $exists: true },
    };

    // 1. Gender filter
    const currentProfile = user
      ? await Profile.findOne({ userId: user._id })
          .select("gender age height weight maritalStatus religion caste motherTongue country division district thana union area highestEducation profession annualIncome familyType familyStatus familyValues diet smoke drink hobbies isVerified partnerPreferences")
          .lean()
      : null;
    if (currentProfile?.gender) {
      filter.gender = currentProfile.gender === "Male" ? "Female" : "Male";
    }
    const gender = searchParams.get("gender");
    if ((gender === "Male" || gender === "Female") && (!currentProfile?.gender || gender === filter.gender)) {
      filter.gender = gender;
    }

    // 2-3. Age range
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) (filter.age as Record<string, number>).$gte = parseInt(ageMin);
      if (ageMax) (filter.age as Record<string, number>).$lte = parseInt(ageMax);
    }

    // 4-5. Height range
    const heightMin = searchParams.get("heightMin");
    const heightMax = searchParams.get("heightMax");
    if (heightMin || heightMax) {
      filter.height = {};
      if (heightMin) filter.height = { ...filter.height as Record<string, string>, $gte: heightMin };
      if (heightMax) filter.height = { ...filter.height as Record<string, string>, $lte: heightMax };
    }

    // 6. Religion
    const religion = searchParams.get("religion");
    if (religion) {
      filter.religion = religion;
    }

    // 7. Caste
    const caste = searchParams.get("caste");
    if (caste) {
      filter.caste = caste;
    }

    // 8. Marital Status
    const maritalStatus = searchParams.get("maritalStatus");
    if (maritalStatus) {
      filter.maritalStatus = maritalStatus;
    }

    // 9. Mother Tongue
    const motherTongue = searchParams.get("motherTongue");
    if (motherTongue) {
      filter.motherTongue = motherTongue;
    }

    // 10. Education
    const education = searchParams.get("education");
    if (education) {
      filter.highestEducation = education;
    }

    // 11. Institution
    const institution = searchParams.get("institution");
    if (institution) {
      filter.institution = { $regex: institution, $options: "i" };
    }

    // 12. Profession
    const profession = searchParams.get("profession");
    if (profession) {
      filter.profession = profession;
    }

    const workingWith = searchParams.get("workingWith");
    if (workingWith) {
      filter.workingWith = workingWith;
    }

    // 13. Income Range
    const incomeRange = searchParams.get("incomeRange");
    if (incomeRange) {
      filter.annualIncome = incomeRange;
    }

    // 14. Country
    const country = searchParams.get("country");
    if (country) {
      filter.country = country;
    }

    // 15. Division
    const division = searchParams.get("division");
    if (division) {
      filter.division = division;
    }

    // 16. District
    const district = searchParams.get("district");
    if (district) {
      filter.district = district;
    }

    // 17. Thana
    const thana = searchParams.get("thana");
    if (thana) {
      filter.thana = thana;
    }

    // 18. Nationality
    const nationality = searchParams.get("nationality");
    if (nationality) {
      filter.nationality = nationality;
    }

    // 18. Family Type
    const familyType = searchParams.get("familyType");
    if (familyType) {
      filter.familyType = familyType;
    }

    // 19. Family Status
    const familyStatus = searchParams.get("familyStatus");
    if (familyStatus) {
      filter.familyStatus = familyStatus;
    }

    // 20. Family Values
    const familyValues = searchParams.get("familyValues");
    if (familyValues) {
      filter.familyValues = familyValues;
    }

    // 21. Diet
    const diet = searchParams.get("diet");
    if (diet) {
      filter.diet = diet;
    }

    // 22. Smoke
    const smoke = searchParams.get("smoke");
    if (smoke) {
      filter.smoke = smoke;
    }

    // 23. Drink
    const drink = searchParams.get("drink");
    if (drink) {
      filter.drink = drink;
    }

    // 24. Blood Group
    const bloodGroup = searchParams.get("bloodGroup");
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    // 25. Profile Created By
    const profileCreatedBy = searchParams.get("profileCreatedBy");
    if (profileCreatedBy) {
      filter.profileCreatedBy = profileCreatedBy;
    }

    // 26. Premium only
    const isPremium = searchParams.get("isPremium");
    if (isPremium === "true") {
      filter.isPremium = true;
      filter.premiumExpiry = { $gt: new Date() };
    }

    // 27. Verified only
    const isVerified = searchParams.get("isVerified");
    if (isVerified === "true") {
      filter.isVerified = true;
    }

    // 28. Has Photo
    const hasPhoto = searchParams.get("hasPhoto");
    if (hasPhoto === "true") {
      filter["photos.isApproved"] = true;
    }

    // 29. Profile Boosted
    const isBoosted = searchParams.get("isBoosted");
    if (isBoosted === "true") {
      filter.isProfileBoosted = true;
      filter.boostedAt = { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    // 30. Hobbies (comma-separated)
    const hobbies = searchParams.get("hobbies");
    if (hobbies) {
      const hobbyList = hobbies.split(",").map(h => h.trim()).filter(Boolean);
      if (hobbyList.length > 0) {
        filter.hobbies = { $in: hobbyList };
      }
    }

    // 31. Languages (comma-separated)
    const languages = searchParams.get("languages");
    if (languages) {
      const langList = languages.split(",").map(l => l.trim()).filter(Boolean);
      if (langList.length > 0) {
        filter.languages = { $in: langList };
      }
    }

    // 32. Exclude user IDs (blocked/hidden)
    const excludeIds = searchParams.get("excludeIds");
    if (excludeIds) {
      const ids = excludeIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        filter.userId = { ...filter.userId as Record<string, unknown>, $nin: ids };
      }
    }

    // 33. Active within days
    const activeWithinDays = searchParams.get("activeWithinDays");
    if (activeWithinDays) {
      const days = parseInt(activeWithinDays);
      filter.lastActiveAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    // 34. Text search (name, profession, location)
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      const regex = { $regex: searchQuery, $options: "i" };
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { profession: regex },
        { district: regex },
        { area: regex },
      ];
    }

    const registeredPublicUserIds = await User.distinct("_id", {
      role: "user",
      isPhoneVerified: true,
      isActive: true,
      isBlocked: false,
      isProfileVerificationRejected: { $ne: true },
    });
    const databaseFilter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: {
        $in: registeredPublicUserIds,
        ...(user ? { $ne: user._id } : {}),
      },
      ...(typeof filter.gender === "string" ? { gender: filter.gender } : {}),
      ...(typeof filter.division === "string" ? { division: filter.division } : {}),
      ...(typeof filter.district === "string" ? { district: filter.district } : {}),
      ...(typeof filter.thana === "string" ? { thana: filter.thana } : {}),
    };
    const basicEducation = searchParams.get("education");
    const location = searchParams.get("location");
    const basicAgeMin = Number(searchParams.get("ageMin"));
    const basicAgeMax = Number(searchParams.get("ageMax"));
    if (basicEducation) databaseFilter.highestEducation = basicEducation;
    if (location) {
      databaseFilter.$or = [
        { country: { $regex: location, $options: "i" } },
        { division: { $regex: location, $options: "i" } },
        { district: { $regex: location, $options: "i" } },
        { area: { $regex: location, $options: "i" } },
      ];
    }
    if ((basicAgeMin > 0 && Number.isFinite(basicAgeMin)) || (basicAgeMax > 0 && Number.isFinite(basicAgeMax))) {
      databaseFilter.age = {};
      if (basicAgeMin > 0 && Number.isFinite(basicAgeMin)) (databaseFilter.age as Record<string, number>).$gte = basicAgeMin;
      if (basicAgeMax > 0 && Number.isFinite(basicAgeMax)) (databaseFilter.age as Record<string, number>).$lte = basicAgeMax;
    }
    if (searchParams.get("premiumOnly") === "true") {
      databaseFilter.isPremium = true;
      databaseFilter.premiumExpiry = { $gt: new Date() };
    }

    // Pagination
    const page = parsePositiveInt(searchParams.get("page"), 1, 10_000);
    const limit = parsePositiveInt(searchParams.get("limit"), 12, 50);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy");
    const isBestMatchSort = !sortBy || sortBy === "relevance";
    const total = await Profile.countDocuments(databaseFilter);
    const profiles = await Profile.find(databaseFilter)
      .sort(isBestMatchSort ? { _id: 1 } : getSort(sortBy))
      .select(PROFILE_SELECT)
      .lean<SearchProfile[]>()
      .exec();

    const paginatedProfiles = isBestMatchSort
      ? profiles
          .sort((first, second) =>
            calculateMatchScore(second, currentProfile) - calculateMatchScore(first, currentProfile)
          )
          .slice(skip, skip + limit)
      : profiles.slice(skip, skip + limit);

    const now = new Date();
    const onlineSince = now.getTime() - 15 * 60 * 1000;
    const profileUserIds = paginatedProfiles.map((profile) => profile.userId);
    const favorites = user && profileUserIds.length
      ? await Favorite.find({
          userId: user._id,
          profileId: { $in: profileUserIds },
        })
          .select("profileId")
          .lean<{ profileId: Types.ObjectId }[]>()
          .exec()
      : [];
    const favoriteIds = new Set(favorites.map((favorite) => favorite.profileId.toString()));

    const enrichedProfiles = await Promise.all(paginatedProfiles.map(async (profile) => {
      const lastActiveAt = profile.lastActiveAt instanceof Date ? profile.lastActiveAt : null;
      const publicId = await ensurePublicIdForProfile(profile.userId, profile.publicId);

      return {
        _id: profile._id.toString(),
        userId: profile.userId.toString(),
        publicId,
        firstName: canViewProfileImages ? profile.firstName || "" : "",
        lastName: canViewProfileImages ? profile.lastName || "" : "",
        gender: profile.gender || "",
        age: profile.age ?? null,
        height: profile.height || "",
        religion: profile.religion || "",
        caste: profile.caste || "",
        motherTongue: profile.motherTongue || "",
        country: profile.country || "",
        division: profile.division || "",
        district: profile.district || "",
        union: profile.union || "",
        highestEducation: profile.highestEducation || "",
        profession: profile.profession || "",
        workingWith: profile.workingWith || "",
        familyStatus: profile.familyStatus || "",
        imageUrl: canViewProfileImages ? getPrimaryPhoto(profile.photos) : null,
        isPremium: Boolean(
          profile.isPremium &&
            profile.premiumExpiry instanceof Date &&
            profile.premiumExpiry > now
        ),
        isVerified: Boolean(profile.isVerified),
        isProfileBoosted: Boolean(profile.isProfileBoosted),
        isFavorite: Boolean(user && favoriteIds.has(profile.userId.toString())),
        isOnline: Boolean(lastActiveAt && lastActiveAt.getTime() >= onlineSince),
        lastActiveAt: lastActiveAt?.toISOString() ?? null,
        profileViews: profile.profileViews ?? 0,
        maritalStatus: profile.maritalStatus || "",
        profileCreatedBy: profile.profileCreatedBy || "",
        createdAt: profile.createdAt?.toISOString() ?? null,
        matchPercentage: calculateMatchScore(profile, currentProfile),
      };
    }));

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
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
