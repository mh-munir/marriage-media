export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
  response.cookies.set("adminToken", "", cookieOptions);
  response.cookies.set("adminRefreshToken", "", cookieOptions);
  return response;
}
