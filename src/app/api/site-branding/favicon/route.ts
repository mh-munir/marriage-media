export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SiteBranding } from "@/models";

const fallbackFavicon = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#e11d48"/><text x="96" y="125" font-family="Arial,sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">M</text></svg>`;

function resolveFaviconUrl(rawUrl: string, request: NextRequest) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  try {
    return new URL(trimmed, request.url).toString();
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const branding = await SiteBranding.findOne({ key: "default" }).select("faviconUrl").lean();
    const faviconUrl = typeof branding?.faviconUrl === "string" ? branding.faviconUrl : "";
    const resolvedFaviconUrl = resolveFaviconUrl(faviconUrl, request);

    if (resolvedFaviconUrl) {
      const faviconResponse = await fetch(resolvedFaviconUrl, {
        cache: "no-store",
        headers: {
          Accept: "image/*,*/*;q=0.8",
        },
      });

      if (faviconResponse.ok) {
        const contentType = faviconResponse.headers.get("content-type") || "image/png";
        if (!contentType.includes("text/html")) {
          return new NextResponse(await faviconResponse.arrayBuffer(), {
            headers: {
              "Cache-Control": "no-store, max-age=0",
              "Content-Type": contentType,
            },
          });
        }
      }
    }
  } catch {
    // Use the built-in icon when branding is unavailable.
  }

  return new NextResponse(fallbackFavicon, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "image/svg+xml",
    },
  });
}