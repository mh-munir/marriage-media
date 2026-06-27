export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ContactContent from "./contact-content";
import { LocalBusinessSchema, WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

const page = PAGE_SEO.contact;

export const metadata: Metadata = {
  title: "Contact",
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: page.title,
    description: page.description,
    url: "/contact",
  },
  twitter: {
    title: page.title,
    description: page.description,
  },
};

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
