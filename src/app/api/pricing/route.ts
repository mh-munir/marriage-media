export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  popular: boolean;
  features: string[];
  notIncluded: string[];
  icon: string;
}

const defaultPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    price: "0",
    period: "forever",
    popular: false,
    features: ["Create Profile", "Basic Search", "5 Interests per day", "Save Favorites", "View Profile Photos"],
    notIncluded: ["Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost", "See Who Viewed You", "Featured Badge"],
    icon: "heart",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Everything you need to find your match",
    price: "999",
    period: "/month",
    popular: true,
    features: ["Everything in Free", "Unlimited Interests", "Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost (1x/month)", "See Who Viewed You", "Featured Badge", "Priority Support"],
    notIncluded: [],
    icon: "crown",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Maximum visibility and features",
    price: "1,999",
    period: "/month",
    popular: false,
    features: ["Everything in Premium", "Top Search Results", "Profile Highlight", "Dedicated Matchmaker", "Profile Boost (3x/month)", "VIP Support"],
    notIncluded: [],
    icon: "sparkles",
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    const couponCount = await Coupon.countDocuments({ isActive: true });

    return NextResponse.json({
      plans: defaultPlans,
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
        { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade from Free to Premium or Gold at any time." },
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
