import type { Metadata } from "next";
import HomeClient from "./home-client";
import {
  LocalBusinessSchema,
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebPageSchema,
  WebsiteSchema,
} from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

const page = PAGE_SEO.home;

export const metadata: Metadata = {
  title: {
    absolute: page.title,
  },
  description: page.description,
  keywords: page.keywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_CONFIG.name,
    title: page.title,
    description: page.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} matrimony platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: page.title,
    description: page.description,
    images: ["/twitter-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />
      <SoftwareApplicationSchema />
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={SITE_CONFIG.url}
        breadcrumbs={[{ name: "Home", url: SITE_CONFIG.url }]}
      />
      <HomeClient />
    </>
  );
}
