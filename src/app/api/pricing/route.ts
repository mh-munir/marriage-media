export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { SitePage } from "@/models";
import { defaultPricingPlans } from "@/lib/pricing";

export async function GET() {
  try {
    await connectToDatabase();

    const [couponCount, pricingPage] = await Promise.all([
      Coupon.countDocuments({ isActive: true }),
      SitePage.findOne({ slug: "pricing" }).select("pricingPlans").lean(),
    ]);

    return NextResponse.json({
      plans: pricingPage?.pricingPlans?.length ? pricingPage.pricingPlans : defaultPricingPlans,
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
