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
    const body = (await request.json()) as { data?: Record<string, unknown>; step?: number; completed?: boolean; sync?: boolean };
    if (!body.data || typeof body.data !== "object") return NextResponse.json({ error: "Onboarding data is required." }, { status: 400 });
    const incomingData = { ...body.data } as Record<string, unknown>;
    delete incomingData.highestEducation;
    delete incomingData.profession;
    const isSync = body.sync === true;
    const step = isSync ? user.onboardingStep || 1 : Math.min(8, Math.max(1, Number(body.step) || 1));
    const data = { ...(user.onboardingData || {}), ...incomingData };
    const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
    const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
    const gender = data.gender === "Male" || data.gender === "Female" ? data.gender : undefined;
    const whatsappNumber = typeof data.whatsappNumber === "string" ? data.whatsappNumber.trim() : "";
    if (!isSync && step >= 2 && !whatsappNumber) {
      return NextResponse.json({ error: "WhatsApp/Imo number is required." }, { status: 400 });
    }
    if (!isSync && whatsappNumber && !/^\+88\d{11}$/.test(whatsappNumber)) {
      return NextResponse.json({ error: "WhatsApp/Imo number must be exactly 11 digits after +88." }, { status: 400 });
    }
    const permanentLocation = data.permanentLocation as Record<string, unknown> | undefined;
    if (!isSync && step >= 4 && (!data.country || !data.division || !data.district || !data.thana || !data.union || !data.area || !permanentLocation?.country || !permanentLocation.division || !permanentLocation.district || !permanentLocation.thana || !permanentLocation.union || !permanentLocation.area)) {
      return NextResponse.json({ error: "Please complete all location fields." }, { status: 400 });
    }
    if (!isSync && step >= 5 && (!Array.isArray(data.educationDetails) || !(data.educationDetails as Record<string, unknown>[]).some((entry) => String(entry.instituteName || "").trim() || String(entry.year || "").trim()))) {
      return NextResponse.json({ error: "Complete at least one education field." }, { status: 400 });
    }
    const requiredHabits = ["Exercise", "Reading", "Travel", "Cooking", "Smoking", "Drinking"];
    if (!isSync && step >= 6 && (!data.habitAnswers || typeof data.habitAnswers !== "object" || requiredHabits.some((habit) => !["Yes", "No"].includes(String((data.habitAnswers as Record<string, unknown>)[habit]))))) {
      return NextResponse.json({ error: "Please answer Yes or No for every habit." }, { status: 400 });
    }
    const requiredPartnerFields = ["age", "height", "weight", "maritalStatus", "religion", "highestEducation", "annualIncome", "country", "division", "district", "familyType", "familyStatus", "familyValues"];
    if (!isSync && step >= 8 && (!data.partnerPreferences || requiredPartnerFields.some((field) => !String((data.partnerPreferences as Record<string, unknown>)[field] || "").trim()))) {
      return NextResponse.json({ error: "Please complete every expected partner field." }, { status: 400 });
    }
    await User.findByIdAndUpdate(user._id, { $set: { onboardingData: data, ...(isSync ? {} : { onboardingStep: step }), ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}), ...(gender ? { gender } : {}), ...(whatsappNumber ? { whatsappNumber } : {}), ...(body.completed ? { onboardingCompleted: true } : {}) } });
    return NextResponse.json({ data, step });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to save onboarding details.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
