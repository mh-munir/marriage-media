export interface PricingPlan {
  id: string;
  name: string;
  nameBn?: string;
  nameEn?: string;
  description: string;
  descriptionBn?: string;
  descriptionEn?: string;
  price: string;
  period: string;
  periodBn?: string;
  periodEn?: string;
  popular: boolean;
  features: string[];
  featuresBn?: string[];
  featuresEn?: string[];
  notIncluded: string[];
  notIncludedBn?: string[];
  notIncludedEn?: string[];
  icon: string;
}

export interface ManualPaymentNumbers {
  bkash: string;
  nagad: string;
}

export function parsePricingAmount(value: string): number {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export const SUBSCRIPTION_PLAN_ACCESS = {
  basic: { durationDays: 180, profileDetailLimit: 30 },
  gold: { durationDays: 365, profileDetailLimit: 75 },
  premium: { durationDays: 365, profileDetailLimit: 150 },
} as const;

export function getProfileDetailLimit(planId: string): number {
  const normalizedPlan = planId.toLowerCase();
  const plan = normalizedPlan === "quarterly" ? "basic"
    : normalizedPlan === "half-yearly" ? "gold"
    : normalizedPlan === "yearly" ? "premium"
    : normalizedPlan;
  return plan in SUBSCRIPTION_PLAN_ACCESS
    ? SUBSCRIPTION_PLAN_ACCESS[plan as keyof typeof SUBSCRIPTION_PLAN_ACCESS].profileDetailLimit
    : 0;
}

export const defaultManualPaymentNumbers: ManualPaymentNumbers = {
  bkash: "01811914795",
  nagad: "01811914795",
};

export const defaultPricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Get started with basic features",
    price: "",
    period: "/6 months",
    popular: false,
    features: ["Create Profile", "Basic Search", "View up to 30 biodatas", "5 Interests per day", "Save Favorites", "View Profile Photos"],
    notIncluded: ["Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost", "See Who Viewed You", "Featured Badge"],
    icon: "heart",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Maximum visibility and features",
    price: "",
    period: "/year",
    popular: false,
    features: ["Everything in Premium", "View up to 75 biodatas", "Top Search Results", "Profile Highlight", "Dedicated Matchmaker", "Profile Boost (3x/month)", "VIP Support"],
    notIncluded: [],
    icon: "sparkles",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Everything you need to find your match",
    price: "",
    period: "/year",
    popular: true,
    features: ["Everything in Basic", "View up to 150 biodatas", "Unlimited Interests", "Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost (1x/month)", "See Who Viewed You", "Featured Badge", "Priority Support"],
    notIncluded: [],
    icon: "crown",
  },
];
