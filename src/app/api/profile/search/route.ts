import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);

    // Build filter
    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: { $ne: user._id },
    };

    // Gender filter (opposite gender by default)
    const gender = searchParams.get("gender");
    if (gender) {
      filter.gender = gender;
    }

    // Age filter
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) (filter.age as Record<string, number>).$gte = parseInt(ageMin);
      if (ageMax) (filter.age as Record<string, number>).$lte = parseInt(ageMax);
    }

    // Religion
    const religion = searchParams.get("religion");
    if (religion) {
      filter.religion = religion;
    }

    // Profession
    const profession = searchParams.get("profession");
    if (profession) {
      filter.profession = profession;
    }

    // Education
    const education = searchParams.get("education");
    if (education) {
      filter.highestEducation = education;
    }

    // Location
    const country = searchParams.get("country");
    if (country) {
      filter.country = country;
    }

    const division = searchParams.get("division");
    if (division) {
      filter.division = division;
    }

    const district = searchParams.get("district");
    if (district) {
      filter.district = district;
    }

    // Premium only
    const isPremium = searchParams.get("isPremium");
    if (isPremium === "true") {
      filter.isPremium = true;
      filter.premiumExpiry = { $gt: new Date() };
    }

    // Verified only
    const isVerified = searchParams.get("isVerified");
    if (isVerified === "true") {
      filter.isVerified = true;
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Sort: boosted first, then premium, then by last active
    const sort: Record<string, 1 | -1> = {
      isProfileBoosted: -1,
      isPremium: -1,
      lastActiveAt: -1,
    };

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("firstName lastName gender age height religion profession highestEducation country division district photos isPremium isVerified isProfileBoosted lastActiveAt aboutMe")
        .lean(),
      Profile.countDocuments(filter),
    ]);

    return NextResponse.json({
      profiles,
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