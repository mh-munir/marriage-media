export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models";
import { AI_AVAILABLE } from "@/lib/ai-client";
import {
  aiMatchRecommendations,
  aiCompatibilityScore,
  aiGenerateBio,
  aiInterestPrediction,
  aiProfileImprovements,
  aiConversationStarters,
  aiSpamDetection,
  aiFakeProfileDetection,
  aiContentModeration,
} from "@/lib/ai-services";

/**
 * GET /api/ai — AI status & feature list
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const feature = url.searchParams.get("feature");

    if (feature === "status") {
      return NextResponse.json({
        available: AI_AVAILABLE,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        features: [
          "match-recommendations",
          "compatibility",
          "bio-generator",
          "interest-prediction",
          "profile-improvements",
          "conversation-starters",
          "spam-detection",
          "fake-detection",
          "content-moderation",
        ],
      });
    }

    return NextResponse.json({ error: "Use POST for AI features" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/ai — Execute AI features
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const body = await request.json();
    const { feature, ...params } = body;

    if (!feature) {
      return NextResponse.json({ error: "feature is required" }, { status: 400 });
    }

    const profile = await Profile.findOne({ userId: user._id }).lean();

    switch (feature) {
      case "match-recommendations": {
        const matches = await aiMatchRecommendations(user._id.toString(), params.limit || 10);
        return NextResponse.json({ matches, aiAvailable: AI_AVAILABLE });
      }

      case "compatibility": {
        const { targetUserId } = params;
        if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
        const targetProfile = await Profile.findOne({ userId: targetUserId }).lean();
        if (!profile || !targetProfile) return NextResponse.json({ error: "Profiles not found" }, { status: 404 });
        const result = await aiCompatibilityScore(
          profile as Parameters<typeof aiCompatibilityScore>[0],
          targetProfile as Parameters<typeof aiCompatibilityScore>[1]
        );
        return NextResponse.json({ ...result, aiAvailable: AI_AVAILABLE });
      }

      case "bio-generator": {
        if (!profile) return NextResponse.json({ error: "Complete your profile first" }, { status: 404 });
        const bio = await aiGenerateBio(profile as Parameters<typeof aiGenerateBio>[0]);
        return NextResponse.json({ bio, aiAvailable: AI_AVAILABLE });
      }

      case "interest-prediction": {
        const prediction = await aiInterestPrediction(user._id.toString());
        return NextResponse.json({ ...prediction, aiAvailable: AI_AVAILABLE });
      }

      case "profile-improvements": {
        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        const improvements = await aiProfileImprovements(profile as Parameters<typeof aiProfileImprovements>[0]);
        return NextResponse.json({ improvements, aiAvailable: AI_AVAILABLE });
      }

      case "conversation-starters": {
        const { targetUserId } = params;
        if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
        const targetProfile = await Profile.findOne({ userId: targetUserId }).lean();
        if (!profile || !targetProfile) return NextResponse.json({ error: "Profiles not found" }, { status: 404 });
        const starters = await aiConversationStarters(
          profile as Parameters<typeof aiConversationStarters>[0],
          targetProfile as Parameters<typeof aiConversationStarters>[1]
        );
        return NextResponse.json({ starters, aiAvailable: AI_AVAILABLE });
      }

      case "spam-detection": {
        const { content, context } = params;
        if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });
        const spamResult = await aiSpamDetection(content, context);
        return NextResponse.json({ ...spamResult, aiAvailable: AI_AVAILABLE });
      }

      case "fake-detection": {
        const { targetUserId } = params;
        const userId = targetUserId || user._id.toString();
        const targetProfile = await Profile.findOne({ userId }).lean();
        if (!targetProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        const fakeResult = await aiFakeProfileDetection(
          targetProfile as unknown as Parameters<typeof aiFakeProfileDetection>[0]
        );
        return NextResponse.json({ ...fakeResult, aiAvailable: AI_AVAILABLE });
      }

      case "content-moderation": {
        const { content, contentType } = params;
        if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });
        const modResult = await aiContentModeration(content, contentType || "profile");
        return NextResponse.json({ ...modResult, aiAvailable: AI_AVAILABLE });
      }

      default:
        return NextResponse.json({ error: `Unknown feature: ${feature}` }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
    }
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}