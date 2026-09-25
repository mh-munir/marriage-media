export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import SuccessStoriesContent from "./successstories-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";
import { getPageMetadata } from "@/lib/page-seo";

const page = PAGE_SEO.successStories;

export async function generateMetadata(): Promise<Metadata> { return getPageMetadata("success-stories"); }

export default function SuccessStoriesPage() {
  return (
    <>
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={`${SITE_CONFIG.url}/success-stories`}
        breadcrumbs={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Success Stories", url: `${SITE_CONFIG.url}/success-stories` },
        ]}
      />
      <SuccessStoriesContent />
    </>
  );
}
