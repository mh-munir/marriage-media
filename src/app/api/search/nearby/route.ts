import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);

    // Get the current user's profile to determine their location
    const myProfile = await Profile.findOne({ userId: user._id }).lean();
    if (!myProfile) {
      return NextResponse.json(
        { error: "Complete your profile first" },
        { status: 400 }
      );
    }

    const radius = parseInt(searchParams.get("radius") || "50"); // km
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;

    // Build the base filter - same division, prefer same district
    const filter: Record<string, unknown> = {
      isVisible: true,
      isDeactivated: false,
      userId: { $ne: user._id },
      division: myProfile.division,
    };

    // Gender filter - show opposite gender by default
    if (myProfile.gender === "Male") {
      filter.gender = "Female";
    } else {
      filter.gender = "Male";
    }

    // If radius is small (<=20), prefer same district
    // If radius is medium (<=50), same division
    // If radius is large, same country
    if (radius <= 20 && myProfile.district) {
      // Prefer same district but don't exclude others
      filter.$or = [
        { district: myProfile.district },
        { division: myProfile.division },
      ];
    }

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort({
          district: myProfile.district ? 1 : -1,
          isProfileBoosted: -1,
          isPremium: -1,
          lastActiveAt: -1,
        } as Record<string, 1 | -1>)
        .skip(skip)
        .limit(limit)
        .select("firstName lastName gender age height religion caste division district area highestEducation profession isPremium isVerified isProfileBoosted boostedAt lastActiveAt photos aboutMe maritalStatus")
        .lean(),
      Profile.countDocuments(filter),
    ]);

    // Enrich with proximity info
    const enrichedProfiles = profiles.map((profile) => {
      const sameDistrict = profile.district === myProfile.district;
      const sameArea = profile.area && myProfile.area && profile.area === myProfile.area;
      let proximityLabel = "";
      if (sameArea) {
        proximityLabel = "Same Area";
      } else if (sameDistrict) {
        proximityLabel = "Same District";
      } else {
        proximityLabel = "Same Division";
      }

      return {
        ...profile,
        proximity: proximityLabel,
        sameDistrict,
        sameArea,
      };
    });

    return NextResponse.json({
      profiles: enrichedProfiles,
      myLocation: {
        division: myProfile.division,
        district: myProfile.district,
        area: myProfile.area,
      },
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