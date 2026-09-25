export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ContactContent from "./contact-content";
import { LocalBusinessSchema, WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";
import { getPageMetadata } from "@/lib/page-seo";

const page = PAGE_SEO.contact;

export async function generateMetadata(): Promise<Metadata> { return getPageMetadata("contact"); }

export default function ContactPage() {
  return (
    <>
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={`${SITE_CONFIG.url}/contact`}
        breadcrumbs={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Contact", url: `${SITE_CONFIG.url}/contact` },
        ]}
      />
      <LocalBusinessSchema />
      <ContactContent />
    </>
  );
}
