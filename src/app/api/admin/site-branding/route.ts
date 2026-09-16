export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { SiteBranding } from "@/models";

const cleanLogoUrl = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const branding = await SiteBranding.findOne({ key: "default" }).lean();
    return NextResponse.json({ headerLogoUrl: branding?.headerLogoUrl || "", footerLogoUrl: branding?.footerLogoUrl || "", faviconUrl: branding?.faviconUrl || "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json() as Record<string, unknown>;
    await connectToDatabase();
    const branding = await SiteBranding.findOneAndUpdate(
      { key: "default" },
      { $set: { headerLogoUrl: cleanLogoUrl(body.headerLogoUrl), footerLogoUrl: cleanLogoUrl(body.footerLogoUrl), faviconUrl: cleanLogoUrl(body.faviconUrl) } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();
    return NextResponse.json({ branding });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
