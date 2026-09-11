export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SitePage } from "@/models";

const PAGE_SLUGS = new Set(["home", "about", "pricing", "blog", "success-stories"]);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!PAGE_SLUGS.has(slug)) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    await connectToDatabase();
    const page = await SitePage.findOne({ slug, isPublished: true }).select("slug title description content seoTitle seoDescription").lean();
    return NextResponse.json({ page: page || null });
  } catch {
    return NextResponse.json({ page: null });
  }
}
