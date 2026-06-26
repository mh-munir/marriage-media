import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlanTier = "free" | "silver" | "gold" | "platinum";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  currency: string;
  duration: number; // days
  features: string[];
  limits: {
    interests: number; // -1 = unlimited
    messages: number;
    profileViews: number;
    searchResults: number;
    aiRecommendations: number;
  };
}

export interface UserSubscription {
  planId: string;
  tier: PlanTier;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscription | null;
  coupons: { code: string; discount: number; expiresAt: string }[];

  setPlans: (plans: SubscriptionPlan[]) => void;
  setSubscription: (subscription: UserSubscription | null) => void;
  isPremium: () => boolean;
  hasFeature: (feature: string) => boolean;
  getPlan: () => SubscriptionPlan | null;
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    price: 0,
    currency: "BDT",
    duration: -1,
    features: [
      "Create Profile",
      "Basic Search",
      "5 Interests per day",
      "Save Favorites",
    ],
    limits: {
      interests: 5,
      messages: 10,
      profileViews: 20,
      searchResults: 10,
      aiRecommendations: 3,
    },
  },
  {
    id: "silver",
    name: "Silver",
    tier: "silver",
    price: 599,
    currency: "BDT",
    duration: 30,
    features: [
      "30 Interests per day",
      "Unlimited Chat",
      "View Contact Info",
      "AI Match Recommendations",
      "See Who Viewed You",
    ],
    limits: {
      interests: 30,
      messages: -1,
      profileViews: 100,
      searchResults: 50,
      aiRecommendations: 20,
    },
  },
  {
    id: "gold",
    name: "Gold",
    tier: "gold",
    price: 999,
    currency: "BDT",
    duration: 30,
    features: [
      "Unlimited Interests",
      "Unlimited Chat",
      "View Contact Info",
      "AI Match Recommendations",
      "Profile Boost",
      "Top Search Results",
      "Featured Badge",
      "Priority Support",
    ],
    limits: {
      interests: -1,
      messages: -1,
      profileViews: -1,
      searchResults: -1,
      aiRecommendations: -1,
    },
  },
  {
    id: "platinum",
    name: "Platinum",
    tier: "platinum",
    price: 1999,
    currency: "BDT",
    duration: 30,
    features: [
      "Everything in Gold",
      "Profile Highlight",
      "Dedicated Matchmaker",
      "Video Profile",
      "Private Gallery",
      "Priority Support",
      "Custom Badge",
    ],
    limits: {
      interests: -1,
      messages: -1,
      profileViews: -1,
      searchResults: -1,
      aiRecommendations: -1,
    },
  },
];

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plans: defaultPlans,
      currentSubscription: null,
      coupons: [],

      setPlans: (plans) => set({ plans }),

      setSubscription: (subscription) => set({ currentSubscription: subscription }),

      isPremium: () => {
        const { currentSubscription } = get();
        if (!currentSubscription?.isActive) return false;
        return new Date(currentSubscription.endDate) > new Date();
      },

      hasFeature: (feature: string) => {
        const { plans, currentSubscription } = get();
        const plan = plans.find((p) => p.tier === currentSubscription?.tier) || plans[0];
        return plan.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()));
      },

      getPlan: () => {
        const { plans, currentSubscription } = get();
        if (!currentSubscription) return plans[0];
        return plans.find((p) => p.tier === currentSubscription.tier) || plans[0];
      },
    }),
    {
      name: "marriage-media-subscription",
      partialize: (state) => ({
        currentSubscription: state.currentSubscription,
      }),
    }
  )
);