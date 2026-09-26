"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomePageOverride, type HomeSection } from "@/components/seo/home-page-override";
import { localizedField } from "@/lib/localized-content";
import { useLanguage } from "@/providers/language-provider";

export interface SitePageData {
  slug: string;
  title: string;
  titleBn?: string;
  titleEn?: string;
  description: string;
  descriptionBn?: string;
  descriptionEn?: string;
  content: string;
  contentBn?: string;
  contentEn?: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  sections?: HomeSection[];
}

const pageCache = new Map<string, Promise<SitePageData | null>>();

export function useSitePage(slug: string) {
  const [page, setPage] = React.useState<SitePageData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      if (!pageCache.has(slug)) {
        pageCache.set(
          slug,
          fetch(`/api/site-pages/${slug}`)
            .then(async (response) => (response.ok ? (await response.json()) as { page?: SitePageData | null } : { page: null }))
            .then((data) => data.page || null)
            .catch(() => null),
        );
      }

      const result = await pageCache.get(slug)!;
      if (mounted) setPage(result);
    };

    void loadPage().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [slug]);

  return { page, loading };
}

export function SitePageOverride({ page }: { page: SitePageData }) {
  const { language } = useLanguage();
  const pageRecord = page as unknown as Record<string, unknown>;
  const title = localizedField(pageRecord, "title", language, page.title);
  const description = localizedField(pageRecord, "description", language, page.description);
  const content = localizedField(pageRecord, "content", language, page.content);
  if (page.slug === "home" && page.sections?.length) return <HomePageOverride sections={page.sections} />;
  return <div className="min-h-screen"><Header /><main className="bg-background"><section className="mx-auto max-w-4xl px-5 py-24 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Halal Biye Bangladesh</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>{description ? <p className="mt-5 text-lg text-muted-foreground">{description}</p> : null}<article className="prose prose-slate mt-12 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} /></section></main><Footer /></div>;
}
