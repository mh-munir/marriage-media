import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import { SitePage } from "@/models";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

type SeoSlug = "home" | "about" | "pricing" | "contact" | "success-stories" | "blog";
const pageKey: Record<SeoSlug, keyof typeof PAGE_SEO> = { home: "home", about: "about", pricing: "pricing", contact: "contact", "success-stories": "successStories", blog: "blog" };

export async function getPageMetadata(slug: SeoSlug): Promise<Metadata> {
  const fallback = PAGE_SEO[pageKey[slug]];
  try {
    await connectToDatabase();
    const saved = await SitePage.findOne({ slug, isPublished: true }).select("seoTitle seoDescription seoKeywords seoCanonical seoOgImage seoNoIndex").lean();
    const title = saved?.seoTitle || fallback.title;
    const description = saved?.seoDescription || fallback.description;
    const keywords = saved?.seoKeywords ? saved.seoKeywords.split(",").map((keyword) => keyword.trim()).filter(Boolean) : fallback.keywords;
    const path = slug === "home" ? "/" : `/${slug}`;
    const canonical = saved?.seoCanonical || path;
    const image = saved?.seoOgImage || SITE_CONFIG.ogImage;
    return { title, description, keywords, alternates: { canonical }, robots: saved?.seoNoIndex ? { index: false, follow: false } : { index: true, follow: true }, openGraph: { title, description, url: canonical, images: [{ url: image }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
  } catch { return { title: fallback.title, description: fallback.description, keywords: fallback.keywords, alternates: { canonical: slug === "home" ? "/" : `/${slug}` } }; }
}
