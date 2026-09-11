"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export interface SitePageData {
  slug: string;
  title: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
}

export function useSitePage(slug: string) {
  const [page, setPage] = React.useState<SitePageData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch(`/api/site-pages/${slug}`)
      .then(async (response) => (response.ok ? response.json() : { page: null }))
      .then((data: { page?: SitePageData | null }) => {
        if (mounted) setPage(data.page || null);
      })
      .catch(() => {
        if (mounted) setPage(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  return { page, loading };
}

export function SitePageOverride({ page }: { page: SitePageData }) {
  return <div className="min-h-screen"><Header /><main className="bg-background"><section className="mx-auto max-w-4xl px-5 py-24 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Marriage Media</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>{page.description ? <p className="mt-5 text-lg text-muted-foreground">{page.description}</p> : null}<article className="prose prose-slate mt-12 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: page.content }} /></section></main><Footer /></div>;
}
