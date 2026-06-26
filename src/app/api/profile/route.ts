import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, User } from "@/models";
import { requireAuth } from "@/lib/auth";
import { calculateAge } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: user._id });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PUT to update." },
        { status: 409 }
      );
    }

    // Calculate age
    const age = calculateAge(body.dateOfBirth);

    // Create profile
    const profile = await Profile.create({
      userId: user._id,
      ...body,
      age,
    });

    // Calculate profile completion
    const completionFields = [
      body.firstName, body.lastName, body.gender, body.dateOfBirth,
      body.height, body.maritalStatus, body.religion, body.highestEducation,
      body.profession, body.country, body.division, body.district,
      body.aboutMe,
    ];
    const completedFields = completionFields.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / completionFields.length) * 100);

    // Update user profile completion
    await User.findByIdAndUpdate(user._id, { profileCompleted: completionPercentage });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();

    // Calculate age if dateOfBirth is provided
    if (body.dateOfBirth) {
      body.age = calculateAge(body.dateOfBirth);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}