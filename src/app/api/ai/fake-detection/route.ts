import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  detectFakeProfile,
  analyzeImageQuality,
  getProfileCompletionSuggestions,
} from "@/lib/ai-fake-detection";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId") || user._id.toString();
    const imageUrl = searchParams.get("imageUrl");

    // If checking image quality
    if (imageUrl) {
      const imageResult = analyzeImageQuality(imageUrl);
      return NextResponse.json({ imageQuality: imageResult });
    }

    // Only allow users to check their own profile or admins to check any
    if (targetUserId !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Run fake detection
    const fakeDetection = await detectFakeProfile(targetUserId);

    // Get profile completion suggestions
    const profile = await Profile.findOne({ userId: targetUserId }).lean();
    const suggestions = profile
      ? getProfileCompletionSuggestions(profile as unknown as Record<string, unknown>)
      : [];

    return NextResponse.json({
      fakeDetection,
      profileSuggestions: suggestions,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}