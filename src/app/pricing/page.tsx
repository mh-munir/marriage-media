export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import PricingContent from "./pricing-content";
import { ProductSchema, WebPageSchema } from "@/components/seo/json-ld";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";
import { getPageMetadata } from "@/lib/page-seo";

const page = PAGE_SEO.pricing;

export async function generateMetadata(): Promise<Metadata> { return getPageMetadata("pricing"); }

export default function PricingPage() {
  return (
    <>
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={`${SITE_CONFIG.url}/pricing`}
        breadcrumbs={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Pricing", url: `${SITE_CONFIG.url}/pricing` },
        ]}
      />
      <ProductSchema
        name="Marriage Media Premium"
        description="Premium matrimony subscription with AI recommendations, unlimited interests, profile boost, and secure chat."
        price={999}
        features={["AI matching", "Unlimited chat", "Verified profiles", "Profile boost"]}
      />
      <PricingContent />
    </>
  );
}
