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

    // 1. Gender filter
    const gender = searchParams.get("gender");
    if (gender) {
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

    // 17. Nationality
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
        { aboutMe: regex },
        { district: regex },
        { area: regex },
      ];
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = searchParams.get("sortBy") || "relevance";
    let sort: Record<string, 1 | -1>;

    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "age-asc":
        sort = { age: 1 };
        break;
      case "age-desc":
        sort = { age: -1 };
        break;
      case "recently-active":
        sort = { lastActiveAt: -1 };
        break;
      case "profile-completeness":
        sort = { profileViews: -1, lastActiveAt: -1 };
        break;
      default:
        // Default: boosted first, then premium, then by last active
        sort = {
          isProfileBoosted: -1,
          isPremium: -1,
          lastActiveAt: -1,
        };
    }

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("firstName lastName gender age height weight bloodGroup religion caste motherTongue languages country division district area nationality highestEducation institution profession workingWith company annualIncome familyType familyStatus familyValues diet smoke drink hobbies aboutMe photos isPremium isVerified isProfileBoosted boostedAt lastActiveAt profileViews maritalStatus profileCreatedBy")
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