"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  X,
  Heart,
  Shield,
  Sparkles,
  MessageCircle,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Get started with basic features",
    icon: Heart,
    features: [
      { text: "Create Profile", included: true },
      { text: "Basic Search", included: true },
      { text: "5 Interests per day", included: true },
      { text: "Save Favorites", included: true },
      { text: "View Profile Photos", included: true },
    ],
    notIncluded: [
      "Unlimited Chat",
      "View Contact Info",
      "AI Match Recommendations",
      "Profile Boost",
      "See Who Viewed You",
      "Featured Badge",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "999",
    period: "/month",
    description: "Everything you need to find your match",
    icon: Crown,
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited Interests", included: true },
      { text: "Unlimited Chat", included: true },
      { text: "View Contact Info", included: true },
      { text: "AI Match Recommendations", included: true },
      { text: "Profile Boost (1x/month)", included: true },
      { text: "See Who Viewed You", included: true },
      { text: "Featured Badge", included: true },
      { text: "Priority Support", included: true },
    ],
    notIncluded: [],
    cta: "Start Premium",
    popular: true,
  },
  {
    name: "Gold",
    price: "1,999",
    period: "/month",
    description: "Maximum visibility and features",
    icon: Sparkles,
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Top Search Results", included: true },
      { text: "Profile Highlight", included: true },
      { text: "Dedicated Matchmaker", included: true },
      { text: "Profile Boost (3x/month)", included: true },
      { text: "VIP Support", included: true },
    ],
    notIncluded: [],
    cta: "Go Gold",
    popular: false,
  },
];

const premiumBenefits = [
  {
    icon: MessageCircle,
    title: "Unlimited Chat",
    description: "Send and receive unlimited messages with your matches.",
  },
  {
    icon: Sparkles,
    title: "AI Matching",
    description: "Get personalized match recommendations powered by AI.",
  },
  {
    icon: Shield,
    title: "View Contact Info",
    description: "Access phone numbers and email addresses of your matches.",
  },
  {
    icon: Zap,
    title: "Profile Boost",
    description: "Get 10x more profile views with monthly profile boosts.",
  },
];

const testimonials = [
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
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "quarterly" | "yearly">("monthly");

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="premium" className="mb-4">
              <Crown className="h-3.5 w-3.5 mr-1" />
              Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Find Your Perfect Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that suits your journey to finding your life partner.
              Start free and upgrade when you're ready.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  billingCycle === cycle
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === "quarterly" && (
                  <span className="ml-1 text-xs">Save 10%</span>
                )}
                {cycle === "yearly" && (
                  <span className="ml-1 text-xs">Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`h-full relative ${
                    plan.popular
                      ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="premium">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <plan.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">৳</span>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>

                    <Button
                      variant={plan.popular ? "gradient" : "outline"}
                      className="w-full mb-6"
                      asChild
                    >
                      <Link href="/register">
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.text} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 opacity-50">
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Why Upgrade?
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Unlock Premium Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium members find their match 3x faster. Here's what you get.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Success Stories
            </Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Premium Members Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 italic">
                      &ldquo;{testimonial.story}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                        </div>
                      </div>
                      <Badge variant="premium" className="text-[10px]">
                        {testimonial.plan}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade my plan later?",
                a: "Yes, you can upgrade from Free to Premium or Gold at any time. The price will be prorated for the remaining days in your billing cycle.",
              },
              {
                q: "Is there a refund policy?",
                a: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with your premium experience, contact us for a full refund.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept bKash, Nagad, SSLCommerz, and Stripe. All payments are secure and encrypted.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel anytime from your dashboard. You'll continue to enjoy premium features until the end of your billing period.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}