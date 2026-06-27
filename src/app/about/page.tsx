import type { Metadata } from "next";
import AboutContent from "./about-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

const page = PAGE_SEO.about;

export const metadata: Metadata = {
  title: "About",
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/about" },
  openGraph: {
    title: page.title,
    description: page.description,
    url: "/about",
  },
  twitter: {
    title: page.title,
    description: page.description,
  },
};

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
