export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SiteBranding } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const branding = await SiteBranding.findOne({ key: "default" }).select("faviconUrl").lean();
    const faviconUrl = typeof branding?.faviconUrl === "string" ? branding.faviconUrl.trim() : "";
    if (/^https?:\/\//i.test(faviconUrl)) return NextResponse.redirect(faviconUrl);
  } catch {
    // Use the built-in icon when branding is unavailable.
  }

  return NextResponse.redirect(new URL("/icons/icon-192x192.svg", request.url));
}