export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SiteVisitor } from "@/models";

const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const visitorId = request.cookies.get("siteVisitorId")?.value;
  if (!visitorId || !VISITOR_ID_PATTERN.test(visitorId)) {
    return NextResponse.json({ error: "Visitor identifier is missing." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await SiteVisitor.updateOne(
      { _id: visitorId },
      { $setOnInsert: { firstVisitedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to record site visitor:", error);
    return NextResponse.json({ error: "Unable to record visitor." }, { status: 500 });
  }
}