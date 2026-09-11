export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Blog, EmailTemplate } from "@/models";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// Get CMS content (blogs + email templates)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blogs";

    if (type === "email-templates") {
      const templates = await EmailTemplate.find()
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ templates });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const blogFilter = type === "success-stories"
      ? { category: /success stories/i }
      : { category: { $not: /success stories/i } };
    const [blogs, total] = await Promise.all([
      Blog.find(blogFilter)
        .populate("author", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(blogFilter),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Create or update blog
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { blogId, title, content, excerpt, category, tags, isPublished, metaTitle, metaDescription, featuredImage, likes } = body;
    const likeCount = Number.isFinite(Number(likes)) ? Math.max(0, Math.floor(Number(likes))) : 0;

    if (blogId) {
      // Update
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        { $set: { title, content, excerpt, category, tags, isPublished, metaTitle, metaDescription, featuredImage, likes: likeCount, publishedAt: isPublished ? new Date() : undefined } },
        { new: true }
      );
      return NextResponse.json({ blog });
    }

    // Create
    const blog = await Blog.create({
      title,
      slug: slugify(title) + "-" + Date.now(),
      content,
      excerpt: excerpt || "",
      category: category || "General",
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : undefined,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      featuredImage: featuredImage || { url: "", publicId: "" },
      likes: likeCount,
      author: admin._id,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Update email template
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const body = await request.json();
    const { templateId, ...updates } = body;

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const template = await EmailTemplate.findByIdAndUpdate(
      templateId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ template });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}