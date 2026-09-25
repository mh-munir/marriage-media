export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { SitePage } from "@/models";

const pages = ["home", "about", "pricing", "success-stories", "contact", "blog"] as const;
const labels: Record<(typeof pages)[number], string> = { home: "Home", about: "About", pricing: "Pricing", "success-stories": "Success Stories", contact: "Contact", blog: "Blog" };

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request); await connectToDatabase();
    const saved = await SitePage.find({ slug: { $in: pages } }).lean();
    return NextResponse.json({ pages: pages.map((slug) => ({ slug, title: labels[slug], seoTitle: "", seoDescription: "", seoKeywords: "", seoCanonical: "", seoOgImage: "", seoNoIndex: false, ...saved.find((page) => page.slug === slug) })) });
  } catch (error) { const message = error instanceof Error ? error.message : "Internal server error"; return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request); await connectToDatabase();
    const body = await request.json() as { slug?: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string; seoCanonical?: string; seoOgImage?: string; seoNoIndex?: boolean };
    if (!body.slug || !pages.includes(body.slug as (typeof pages)[number])) return NextResponse.json({ error: "Valid page is required" }, { status: 400 });
    const page = await SitePage.findOneAndUpdate({ slug: body.slug }, { $set: { title: labels[body.slug as (typeof pages)[number]], seoTitle: body.seoTitle?.trim() || "", seoDescription: body.seoDescription?.trim() || "", seoKeywords: body.seoKeywords?.trim() || "", seoCanonical: body.seoCanonical?.trim() || "", seoOgImage: body.seoOgImage?.trim() || "", seoNoIndex: body.seoNoIndex === true } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }).lean();
    return NextResponse.json({ page });
  } catch (error) { const message = error instanceof Error ? error.message : "Internal server error"; return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 }); }
}
