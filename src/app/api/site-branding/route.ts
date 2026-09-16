export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SiteBranding } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const branding = await SiteBranding.findOne({ key: "default" }).lean();
    return NextResponse.json({
      headerLogoUrl: branding?.headerLogoUrl || "",
      footerLogoUrl: branding?.footerLogoUrl || "",
    });
  } catch {
    // Public pages retain their built-in fallback branding when the database is unavailable.
    return NextResponse.json({ headerLogoUrl: "", footerLogoUrl: "" });
  }
}
