export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { SitePage } from "@/models";
import { defaultManualPaymentNumbers, defaultPricingPlans, type ManualPaymentNumbers, type PricingPlan } from "@/lib/pricing";

const planIds = defaultPricingPlans.map((plan) => plan.id);

function normalizePaymentNumbers(value: unknown): ManualPaymentNumbers | null {
  const input = value as Partial<ManualPaymentNumbers>;
  const bkash = typeof input?.bkash === "string" ? input.bkash.replace(/\D/g, "") : "";
  const nagad = typeof input?.nagad === "string" ? input.nagad.replace(/\D/g, "") : "";
  return /^01[3-9]\d{8}$/.test(bkash) && /^01[3-9]\d{8}$/.test(nagad) ? { bkash, nagad } : null;
}

function normalizePlans(value: unknown): PricingPlan[] | null {
  if (!Array.isArray(value) || value.length !== planIds.length) return null;
  const plans = value.map((item, index) => {
    const input = item as Partial<PricingPlan>;
    const fallback = defaultPricingPlans[index];
    return {
      ...fallback,
      id: fallback.id,
      name: typeof input.name === "string" ? input.name.trim() : fallback.name,
      nameBn: typeof input.nameBn === "string" ? input.nameBn.trim() : fallback.nameBn || fallback.name,
      nameEn: typeof input.nameEn === "string" ? input.nameEn.trim() : fallback.nameEn || fallback.name,
      description: typeof input.description === "string" ? input.description.trim() : fallback.description,
      descriptionBn: typeof input.descriptionBn === "string" ? input.descriptionBn.trim() : fallback.descriptionBn || fallback.description,
      descriptionEn: typeof input.descriptionEn === "string" ? input.descriptionEn.trim() : fallback.descriptionEn || fallback.description,
      price: typeof input.price === "string" ? input.price.trim() : fallback.price,
      period: typeof input.period === "string" ? input.period.trim() : fallback.period,
      periodBn: typeof input.periodBn === "string" ? input.periodBn.trim() : fallback.periodBn || fallback.period,
      periodEn: typeof input.periodEn === "string" ? input.periodEn.trim() : fallback.periodEn || fallback.period,
      popular: input.popular === true,
      features: Array.isArray(input.features) ? input.features.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.features,
      featuresBn: Array.isArray(input.featuresBn) ? input.featuresBn.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.featuresBn || fallback.features,
      featuresEn: Array.isArray(input.featuresEn) ? input.featuresEn.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.featuresEn || fallback.features,
      notIncluded: Array.isArray(input.notIncluded) ? input.notIncluded.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.notIncluded,
      notIncludedBn: Array.isArray(input.notIncludedBn) ? input.notIncludedBn.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.notIncludedBn || fallback.notIncluded,
      notIncludedEn: Array.isArray(input.notIncludedEn) ? input.notIncludedEn.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.notIncludedEn || fallback.notIncluded,
    };
  });
  return plans.every((plan, index) => plan.id === planIds[index] && plan.name) ? plans : null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const page = await SitePage.findOne({ slug: "pricing" }).select("pricingPlans paymentNumbers").lean();
    return NextResponse.json({ plans: page?.pricingPlans?.length ? page.pricingPlans : defaultPricingPlans, paymentNumbers: page?.paymentNumbers || defaultManualPaymentNumbers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { plans?: unknown; paymentNumbers?: unknown };
    const plans = normalizePlans(body.plans);
    const paymentNumbers = normalizePaymentNumbers(body.paymentNumbers);
    if (!plans) return NextResponse.json({ error: "Exactly Basic, Gold, and Premium plans are required" }, { status: 400 });
    if (!paymentNumbers) return NextResponse.json({ error: "Enter valid 11-digit bKash and Nagad numbers" }, { status: 400 });
    await connectToDatabase();
    const page = await SitePage.findOneAndUpdate(
      { slug: "pricing" },
      { $set: { pricingPlans: plans, paymentNumbers } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    ).select("pricingPlans paymentNumbers").lean();
    return NextResponse.json({ plans: page?.pricingPlans || plans, paymentNumbers: page?.paymentNumbers || paymentNumbers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
