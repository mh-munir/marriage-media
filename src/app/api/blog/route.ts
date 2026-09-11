export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Blog from "@/models/Blog";

interface BlogDocument {
  _id: { toString(): string };
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  featuredImage?: { url?: string };
  publishedAt?: Date | string;
  createdAt?: Date | string;
  likes?: number;
}

function mapBlogPost(post: BlogDocument) {
  return {
    id: post._id.toString(),
    title: post.title || "Untitled article",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    category: post.category || "General",
    imageUrl: post.featuredImage?.url || null,
    likes: post.likes || 0,
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = request.nextUrl;
    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category")?.trim();
    const limit = Number.parseInt(limitParam ?? "12", 10);
    const safeLimit = Number.isNaN(limit) ? 12 : Math.min(Math.max(limit, 1), 24);

    const query: Record<string, unknown> = { isPublished: true };
    if (category) {
      query.category = category;
    }

    const posts = await Blog.find(query)
      .select("title slug excerpt category featuredImage publishedAt createdAt likes")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(safeLimit)
      .lean<BlogDocument[]>()
      .exec();

    return NextResponse.json({ posts: posts.map(mapBlogPost) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load blog posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
