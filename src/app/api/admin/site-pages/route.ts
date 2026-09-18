export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { SitePage } from "@/models";

const PAGE_SLUGS = new Set(["home", "about", "pricing", "blog", "success-stories"]);

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const slug = new URL(request.url).searchParams.get("slug");
    const pages = slug && PAGE_SLUGS.has(slug) ? await SitePage.findOne({ slug }).lean() : await SitePage.find({ slug: { $in: [...PAGE_SLUGS] } }).sort({ slug: 1 }).lean();
    return NextResponse.json({ pages: Array.isArray(pages) ? pages : pages ? [pages] : [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const body = (await request.json()) as Partial<{ slug: string; title: string; titleBn: string; titleEn: string; description: string; descriptionBn: string; descriptionEn: string; content: string; contentBn: string; contentEn: string; seoTitle: string; seoDescription: string; isPublished: boolean; sections: Array<Record<string, unknown>> }>;
    if (!body.slug || !PAGE_SLUGS.has(body.slug) || !body.title?.trim()) return NextResponse.json({ error: "A valid page slug and title are required" }, { status: 400 });
    const page = await SitePage.findOneAndUpdate(
      { slug: body.slug },
      { $set: { title: body.title.trim(), titleBn: body.titleBn || body.title.trim(), titleEn: body.titleEn || body.title.trim(), description: body.description || "", descriptionBn: body.descriptionBn || body.description || "", descriptionEn: body.descriptionEn || body.description || "", content: body.content || "", contentBn: body.contentBn || body.content || "", contentEn: body.contentEn || body.content || "", seoTitle: body.seoTitle || "", seoDescription: body.seoDescription || "", isPublished: body.isPublished !== false, ...(Array.isArray(body.sections) ? { sections: body.sections } : {}) } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
