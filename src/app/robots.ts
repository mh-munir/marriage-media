import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo-constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/pricing", "/blog", "/contact", "/success-stories"],
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/login",
          "/register",
          "/success",
          "/_next/",
          "/*.json$",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/"],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
