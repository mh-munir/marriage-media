export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { SitePage } from "@/models";
import { defaultPricingPlans, type PricingPlan } from "@/lib/pricing";

const planIds = defaultPricingPlans.map((plan) => plan.id);

function normalizePlans(value: unknown): PricingPlan[] | null {
  if (!Array.isArray(value) || value.length !== planIds.length) return null;
  const plans = value.map((item, index) => {
    const input = item as Partial<PricingPlan>;
    const fallback = defaultPricingPlans[index];
    return {
      ...fallback,
      id: fallback.id,
      name: typeof input.name === "string" ? input.name.trim() : fallback.name,
      description: typeof input.description === "string" ? input.description.trim() : fallback.description,
      price: typeof input.price === "string" ? input.price.trim() : fallback.price,
      period: typeof input.period === "string" ? input.period.trim() : fallback.period,
      popular: input.popular === true,
      features: Array.isArray(input.features) ? input.features.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.features,
      notIncluded: Array.isArray(input.notIncluded) ? input.notIncluded.filter((feature): feature is string => typeof feature === "string" && feature.trim().length > 0).map((feature) => feature.trim()) : fallback.notIncluded,
    };
  });
  return plans.every((plan, index) => plan.id === planIds[index] && plan.name) ? plans : null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const page = await SitePage.findOne({ slug: "pricing" }).select("pricingPlans").lean();
    return NextResponse.json({ plans: page?.pricingPlans?.length ? page.pricingPlans : defaultPricingPlans });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { plans?: unknown };
    const plans = normalizePlans(body.plans);
    if (!plans) return NextResponse.json({ error: "Exactly Basic, Gold, and Premium plans are required" }, { status: 400 });
    await connectToDatabase();
    const page = await SitePage.findOneAndUpdate(
      { slug: "pricing" },
      { $set: { pricingPlans: plans } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select("pricingPlans").lean();
    return NextResponse.json({ plans: page?.pricingPlans || plans });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
