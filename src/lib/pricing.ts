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

export const defaultManualPaymentNumbers: ManualPaymentNumbers = {
  bkash: "01811914795",
  nagad: "01811914795",
};

export const defaultPricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Get started with basic features",
    price: "999",
    period: "/3 months",
    popular: false,
    features: ["Create Profile", "Basic Search", "5 Interests per day", "Save Favorites", "View Profile Photos"],
    notIncluded: ["Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost", "See Who Viewed You", "Featured Badge"],
    icon: "heart",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Maximum visibility and features",
    price: "1,999",
    period: "/6 months",
    popular: false,
    features: ["Everything in Premium", "Top Search Results", "Profile Highlight", "Dedicated Matchmaker", "Profile Boost (3x/month)", "VIP Support"],
    notIncluded: [],
    icon: "sparkles",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Everything you need to find your match",
    price: "2,999",
    period: "/year",
    popular: true,
    features: ["Everything in Basic", "Unlimited Interests", "Unlimited Chat", "View Contact Info", "AI Match Recommendations", "Profile Boost (1x/month)", "See Who Viewed You", "Featured Badge", "Priority Support"],
    notIncluded: [],
    icon: "crown",
  },
];
