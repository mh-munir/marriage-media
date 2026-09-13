export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/home-data";

export async function GET() {
  try {
    const homeData = await getHomeData();
    return NextResponse.json(homeData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load home content.";
    return NextResponse.json(
      {
        featuredProfiles: [],
        premiumMembers: [],
        recentMembers: [],
        successStories: [],
        stats: {
          activeProfiles: 0,
          acceptedMatches: 0,
          verifiedProfiles: 0,
          premiumMembers: 0,
          successStories: 0,
          recentMembers: 0,
        },
      },
      { status: 500, headers: { "x-error": message } }
    );
  }
}
