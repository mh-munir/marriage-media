"use client";

export const dynamic = "force-dynamic";

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
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";
import { defaultManagedSections, sectionValue, useManagedPage } from "@/components/seo/managed-page-content";
import { useLanguage } from "@/providers/language-provider";
import { localizedField } from "@/lib/localized-content";
import { localizedText } from "@/lib/localized-content";

interface PricingPlan {
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

interface Testimonial {
  name: string;
  location: string;
  plan: string;
  story: string;
}

interface FAQItem {
  q: string;
  a: string;
}

interface PricingData {
  plans: PricingPlan[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  couponCount?: number;
}

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

export default function PricingPage() {
  const { language, translateText: text } = useLanguage();
  const { page, loading } = useSitePage("pricing");
  const { sections, loading: managedLoading } = useManagedPage("pricing");
  const [pricingData, setPricingData] = React.useState<PricingData | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadPricingData() {
      try {
        const response = await fetch("/api/pricing");
        const data = (await response.json()) as PricingData;
        if (isMounted) {
          setPricingData(data);
        }
      } catch {
        if (isMounted) {
          setPricingData(null);
        }
      }
    }

    loadPricingData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || managedLoading) return null;
  if (page?.content || page?.contentBn || page?.contentEn) return <SitePageOverride page={page} />;

  const defaults = defaultManagedSections("pricing");
  const hero = sectionValue(sections.length ? sections : defaults, "hero", defaults[0]);
  const benefits = sectionValue(sections.length ? sections : defaults, "benefits", defaults[1]);
  const testimonialsSection = sectionValue(sections.length ? sections : defaults, "testimonials", defaults[2]);
  const faqSection = sectionValue(sections.length ? sections : defaults, "faq", defaults[3]);
  const managedBenefits = benefits.items.map((item, index) => {
    const benefit = premiumBenefits[index] || { icon: Sparkles, title: item.title, description: item.text };
    const resolvedTitle = localizedField(item as unknown as Record<string, unknown>, "title", language, benefit.title);
    const resolvedDescription = localizedField(item as unknown as Record<string, unknown>, "text", language, benefit.description);
    return {
      ...benefit,
      title: text(resolvedTitle),
      description: text(resolvedDescription),
    };
  });

  const plans = pricingData?.plans ?? [];
  const testimonials = pricingData?.testimonials ?? [];
  const faqs = pricingData?.faqs ?? [];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      {hero.visible ? <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-18 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="premium" className="mb-4">
              <Crown className="mr-1 h-3.5 w-3.5" />
              {text(localizedField(hero as unknown as Record<string, unknown>, "eyebrow", language, hero.eyebrow))}
            </Badge>
            <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {text(localizedField(hero as unknown as Record<string, unknown>, "title", language, hero.title))}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {text(localizedField(hero as unknown as Record<string, unknown>, "description", language, hero.description))}
            </p>
          </motion.div>
        </div>
      </section> : null}

      {/* Plans */}
      <section className="pb-18 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full w-full ${
                    plan.popular
                      ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="premium">{text("Most Popular")}</Badge>
                    </div>
                  )}
                  <CardContent className="p-5 sm:p-8">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {plan.icon === "crown" ? <Crown className="h-5 w-5 text-primary" /> : plan.icon === "sparkles" ? <Sparkles className="h-5 w-5 text-primary" /> : <Heart className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{text(localizedText({ bn: plan.nameBn, en: plan.nameEn }, language, plan.name))}</h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">৳</span>
                        <span className="text-3xl font-bold sm:text-4xl">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{text(localizedText({ bn: plan.periodBn, en: plan.periodEn }, language, plan.period))}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{text(localizedText({ bn: plan.descriptionBn, en: plan.descriptionEn }, language, plan.description))}</p>
                    </div>

                    <Button
                      variant={plan.popular ? "gradient" : "outline"}
                      className="mb-6 w-full"
                      asChild
                    >
                      <Link href={`/payment?plan=${encodeURIComponent(plan.id)}`}>
                        {plan.popular ? text("Start Premium") : plan.name === "Gold" ? text("Go Gold") : text("Get Started Free")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <div className="space-y-3">
                      {(language === "bn" ? plan.featuresBn || plan.features : plan.featuresEn || plan.features).map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="text-sm leading-relaxed wrap-break-word">{text(feature)}</span>
                        </div>
                      ))}
                      {(language === "bn" ? plan.notIncludedBn || plan.notIncluded : plan.notIncludedEn || plan.notIncluded).map((feature) => (
                        <div key={feature} className="flex items-start gap-2 opacity-50">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm leading-relaxed wrap-break-word">{text(feature)}</span>
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
      {benefits.visible ? <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              {text("Why Upgrade?")}
            </Badge>
            <h2 className="text-3xl font-bold mb-4">{text(localizedField(benefits as unknown as Record<string, unknown>, "title", language, benefits.title))}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {text(localizedField(benefits as unknown as Record<string, unknown>, "description", language, benefits.description))}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {managedBenefits.map((benefit, index) => (
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
                    <h3 className="font-semibold mb-2">{text(benefit.title)}</h3>
                    <p className="text-sm text-muted-foreground">{text(benefit.description)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> : null}

      {/* Testimonials */}
      {testimonialsSection.visible ? <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              {text(testimonialsSection.eyebrow)}
            </Badge>
            <h2 className="text-3xl font-bold mb-4">{text(testimonialsSection.title)}</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
      </section> : null}

      {/* FAQ */}
      {faqSection.visible ? <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{faqSection.title}</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> : null}

      <Footer />
    </div>
  );
}
