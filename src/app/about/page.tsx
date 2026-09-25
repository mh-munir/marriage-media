export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import AboutContent from "./about-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";
import { getPageMetadata } from "@/lib/page-seo";

const page = PAGE_SEO.about;

export async function generateMetadata(): Promise<Metadata> { return getPageMetadata("about"); }

export default function AboutPage() {
  return (
    <>
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={`${SITE_CONFIG.url}/about`}
        breadcrumbs={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "About", url: `${SITE_CONFIG.url}/about` },
        ]}
      />
      <AboutContent />
    </>
  );
}
