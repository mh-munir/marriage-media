export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SiteBranding } from "@/models";

const fallbackFavicon = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#e11d48"/><text x="96" y="125" font-family="Arial,sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">M</text></svg>`;

export async function GET() {
  try {
    await connectToDatabase();
    const branding = await SiteBranding.findOne({ key: "default" }).select("faviconUrl").lean();
    const faviconUrl = typeof branding?.faviconUrl === "string" ? branding.faviconUrl.trim() : "";
    if (/^https?:\/\//i.test(faviconUrl)) {
      const faviconResponse = await fetch(faviconUrl, { cache: "no-store" });
      if (faviconResponse.ok) {
        const contentType = faviconResponse.headers.get("content-type") || "image/png";
        return new NextResponse(await faviconResponse.arrayBuffer(), {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": contentType,
          },
        });
      }
    }
  } catch {
    // Use the built-in icon when branding is unavailable.
  }

  return new NextResponse(fallbackFavicon, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/svg+xml",
    },
  });
}