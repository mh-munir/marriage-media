import type { Metadata } from "next";
import SuccessStoriesContent from "./successstories-content";
import { WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

const page = PAGE_SEO.successStories;

export const metadata: Metadata = {
  title: "Success Stories",
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: "/success-stories" },
  openGraph: {
    title: page.title,
    description: page.description,
    url: "/success-stories",
  },
  twitter: {
    title: page.title,
    description: page.description,
  },
};

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
