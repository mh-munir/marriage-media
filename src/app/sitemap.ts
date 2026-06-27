import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_CONFIG } from "@/lib/seo-constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_CONFIG.url}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "en-BD": `${SITE_CONFIG.url}${route.path === "/" ? "" : route.path}`,
      },
    },
  }));
}
