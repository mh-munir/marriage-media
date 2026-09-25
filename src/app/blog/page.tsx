export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import BlogContent from "@/app/blog/blog-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";
import { getPageMetadata } from "@/lib/page-seo";

const page = PAGE_SEO.blog;

export async function generateMetadata(): Promise<Metadata> { return getPageMetadata("blog"); }

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
