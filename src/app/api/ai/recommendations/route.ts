export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { getEnhancedRecommendations, getRecentlyActiveProfiles } from "@/lib/recommendation-engine";

// Get AI recommendations
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "recommendations";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (type === "recently-active") {
      const days = parseInt(searchParams.get("days") || "7");
      const profiles = await getRecentlyActiveProfiles(user._id.toString(), days, limit);
      return NextResponse.json({ profiles });
    }

    const recommendations = await getEnhancedRecommendations(user._id.toString(), limit);
    return NextResponse.json({ recommendations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}