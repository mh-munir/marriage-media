"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Users,
  Search,
  MessageCircle,
  Crown,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Successful Matches", value: "10K+", icon: Heart },
  { label: "Verified Profiles", value: "25K+", icon: Shield },
  { label: "Happy Families", value: "8K+", icon: Star },
];

const features = [
  {
    icon: Search,
    title: "Advanced Search",
    description:
      "Find your ideal partner with 20+ filters including religion, education, profession, and location.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description:
      "Every profile is manually verified by our team to ensure authenticity and safety.",
  },
  {
    icon: Sparkles,
    title: "AI Matching",
    description:
      "Our AI algorithm analyzes compatibility based on preferences, interests, and values.",
  },
  {
    icon: MessageCircle,
    title: "Secure Chat",
    description:
      "Connect with potential matches through our real-time encrypted messaging system.",
  },
  {
    icon: Crown,
    title: "Premium Features",
    description:
      "Unlock unlimited interests, profile boost, and AI recommendations with Premium.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your data is encrypted and protected. Control who sees your contact information.",
  },
];

const testimonials = [
  {
    name: "Farhana & Imran",
    location: "Dhaka",
    story:
      "We found each other on Marriage Media and got married within 3 months. The AI matching was spot on!",
  },
  {
    name: "Nusrat & Fahim",
    location: "Chittagong",
    story:
      "The verified profiles gave us confidence. We're now happily married with a beautiful daughter.",
  },
  {
    name: "Sabrina & Rafi",
    location: "Sylhet",
    story:
      "I was skeptical about online matrimony, but Marriage Media changed my perspective. Highly recommended!",
  },
];

export default function HomeClient() {
  return (
    <div className="min-h-screen">
      <Header />

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="premium" className="mb-6 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI-Powered Matchmaking
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Find Your Perfect{" "}
              <span className="bg-linear-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Life Partner
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Bangladesh&apos;s most trusted matrimony platform with AI-powered
              matching, verified profiles, and a commitment to your happily ever
              after.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="gradient"
                size="xl"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/register">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                100% Free to Register
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Verified Profiles
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Secure & Private
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Find Love
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines traditional values with modern technology to
              help you find your perfect match.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three Simple Steps to Your Soulmate
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description:
                  "Sign up for free and create a detailed profile with your preferences and expectations.",
              },
              {
                step: "02",
                title: "Search & Discover",
                description:
                  "Use our advanced filters and AI recommendations to find profiles that match your criteria.",
              },
              {
                step: "03",
                title: "Connect & Match",
                description:
                  "Send interests, start conversations, and take the first step towards your happily ever after.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="text-7xl font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative pt-10">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Love Stories That Inspire
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thousands of couples have found their perfect match on Marriage
              Media.
            </p>
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
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 italic">
                      &ldquo;{testimonial.story}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-linear-to-br from-rose-500 via-pink-500 to-purple-600 p-12 lg:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Your Love Story Starts Here
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                Join 50,000+ singles who are already looking for their perfect
                match. Register now and start your journey to happily ever after.
              </p>
              <Button variant="secondary" size="xl" asChild>
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
