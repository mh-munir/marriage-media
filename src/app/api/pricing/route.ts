export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { SitePage } from "@/models";
import { defaultManualPaymentNumbers, defaultPricingPlans, SUBSCRIPTION_PLAN_ACCESS } from "@/lib/pricing";

export async function GET() {
  try {
    await connectToDatabase();

    const [couponCount, pricingPage] = await Promise.all([
      Coupon.countDocuments({ isActive: true }),
      SitePage.findOne({ slug: "pricing" }).select("pricingPlans paymentNumbers").lean(),
    ]);

    const plans = pricingPage?.pricingPlans?.length ? pricingPage.pricingPlans : defaultPricingPlans;
    const plansWithAccess = plans.map((plan) => {
      const access = SUBSCRIPTION_PLAN_ACCESS[plan.id as keyof typeof SUBSCRIPTION_PLAN_ACCESS];
      if (!access) return plan;
      const limitFeature = `View up to ${access.profileDetailLimit} biodatas`;
      const withoutOldLimit = (features: string[]) => features.filter((feature) => !/(view up to \d+ biodatas|বায়োডাটা দেখুন)/i.test(feature));
      return {
        ...plan,
        period: access.durationDays === 180 ? "/6 months" : "/year",
        periodEn: access.durationDays === 180 ? "/6 months" : "/year",
        periodBn: access.durationDays === 180 ? "/৬ মাস" : "/১ বছর",
        features: [...withoutOldLimit(plan.features), limitFeature],
        featuresEn: [...withoutOldLimit(plan.featuresEn || plan.features), limitFeature],
        featuresBn: [
          ...withoutOldLimit(plan.featuresBn || plan.features),
          `${access.profileDetailLimit}টি পর্যন্ত বায়োডাটা দেখুন`,
        ],
      };
    });

    return NextResponse.json({
      plans: plansWithAccess,
      paymentNumbers: {
        bkash: pricingPage?.paymentNumbers?.bkash || defaultManualPaymentNumbers.bkash,
        nagad: pricingPage?.paymentNumbers?.nagad || defaultManualPaymentNumbers.nagad,
      },
      testimonials: [
        {
          name: "Farhana & Imran",
          location: "Dhaka",
          plan: "Premium",
          story: "Upgraded to Premium and found my match within 2 weeks! The AI recommendations were spot on.",
        },
        {
          name: "Nusrat & Fahim",
          location: "Chittagong",
          plan: "Gold",
          story: "The Gold plan's dedicated matchmaker helped us find each other. Best investment ever!",
        },
        {
          name: "Sabrina & Rafi",
          location: "Sylhet",
          plan: "Premium",
          story: "Being able to see who viewed my profile and send unlimited interests made all the difference.",
        },
      ],
      faqs: [
        { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade from Basic to Premium or Gold at any time." },
        { q: "Is there a refund policy?", a: "Yes, we offer a 7-day money-back guarantee." },
        { q: "What payment methods do you accept?", a: "We accept bKash, Nagad, SSLCommerz, and Stripe." },
        { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from your dashboard." },
      ],
      couponCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load pricing data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
