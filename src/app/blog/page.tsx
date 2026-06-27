export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import BlogContent from "@/app/blog/blog-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

const page = PAGE_SEO.blog;

export const metadata: Metadata = {
  title: "Blog",
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: page.title,
    description: page.description,
    url: "/blog",
  },
  twitter: {
    title: page.title,
    description: page.description,
  },
};

export default function BlogPage() {
  return (
    <>
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={`${SITE_CONFIG.url}/blog`}
        breadcrumbs={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
        ]}
      />
      <BlogContent />
    </>
  );
}
