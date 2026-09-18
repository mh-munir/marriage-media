export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Blog from "@/models/Blog";

interface StoryDocument {
  _id: { toString(): string };
  title?: string;
  titleBn?: string;
  titleEn?: string;
  slug?: string;
  excerpt?: string;
  excerptBn?: string;
  excerptEn?: string;
  category?: string;
  categoryBn?: string;
  categoryEn?: string;
  featuredImage?: { url?: string };
  publishedAt?: Date | string;
  createdAt?: Date | string;
}

function mapStory(story: StoryDocument) {
  return {
    id: story._id.toString(),
    title: story.title || "Success story",
    titleBn: story.titleBn || story.title || "সফলতার গল্প",
    titleEn: story.titleEn || story.title || "Success story",
    slug: story.slug || "",
    excerpt: story.excerpt || "",
    excerptBn: story.excerptBn || story.excerpt || "",
    excerptEn: story.excerptEn || story.excerpt || "",
    category: story.category || "Success Stories",
    categoryBn: story.categoryBn || story.category || "সফলতার গল্প",
    categoryEn: story.categoryEn || story.category || "Success Stories",
    imageUrl: story.featuredImage?.url || null,
    publishedAt: story.publishedAt ? new Date(story.publishedAt).toISOString() : null,
    createdAt: story.createdAt ? new Date(story.createdAt).toISOString() : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = request.nextUrl;
    const limitParam = searchParams.get("limit");
    const limit = Number.parseInt(limitParam ?? "6", 10);
    const safeLimit = Number.isNaN(limit) ? 6 : Math.min(Math.max(limit, 1), 12);

    const stories = await Blog.find({
      isPublished: true,
      category: /success stories/i,
    })
      .select("title titleBn titleEn slug excerpt excerptBn excerptEn category categoryBn categoryEn featuredImage publishedAt createdAt")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(safeLimit)
      .lean<StoryDocument[]>()
      .exec();

    return NextResponse.json({ stories: stories.map(mapStory) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load success stories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
