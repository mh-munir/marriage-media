export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    return NextResponse.json({ data: user.onboardingData || {}, step: user.onboardingStep || 1, completed: user.onboardingCompleted });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load onboarding." }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = (await request.json()) as { data?: Record<string, unknown>; step?: number; completed?: boolean };
    if (!body.data || typeof body.data !== "object") return NextResponse.json({ error: "Onboarding data is required." }, { status: 400 });
    const step = Math.min(8, Math.max(1, Number(body.step) || 1));
    const data = { ...(user.onboardingData || {}), ...body.data };
    const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
    const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
    const gender = data.gender === "Male" || data.gender === "Female" ? data.gender : undefined;
    await User.findByIdAndUpdate(user._id, { $set: { onboardingData: data, onboardingStep: step, ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}), ...(gender ? { gender } : {}), ...(body.completed ? { onboardingCompleted: true } : {}) } });
    return NextResponse.json({ data, step });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to save onboarding details.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
