"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Users,
  Target,
  Eye,
  Award,
  Handshake,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Every profile is manually verified by our team to ensure authenticity and prevent fake accounts.",
  },
  {
    icon: Heart,
    title: "Genuine Connections",
    description:
      "We focus on meaningful relationships that lead to lasting marriages, not casual encounters.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We build a supportive community where singles and families can find matches with confidence.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description:
      "Our AI-powered matching algorithm analyzes compatibility across 50+ data points for better matches.",
  },
];

const team = [
  {
    name: "Tanvir Ahmed",
    role: "Founder & CEO",
    description: "Visionary leader with 10+ years in the matchmaking industry.",
  },
  {
    name: "Sabrina Rahman",
    role: "Head of Operations",
    description: "Expert in building scalable platforms and exceptional user experiences.",
  },
  {
    name: "Imran Hossain",
    role: "Lead Engineer",
    description: "Full-stack developer passionate about creating secure, reliable systems.",
  },
  {
    name: "Farhana Khan",
    role: "Community Manager",
    description: "Dedicated to helping users find their perfect match and share success stories.",
  },
];

const stats = [
  { label: "Active Users", value: "50,000+" },
  { label: "Successful Matches", value: "10,000+" },
  { label: "Verified Profiles", value: "25,000+" },
  { label: "Happy Families", value: "8,000+" },
];

export default function AboutPage() {
  const { page, loading } = useSitePage("about");
  if (loading) return null;
  if (page?.content) return <SitePageOverride page={page} />;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Building Dreams of{" "}
              <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Happy Marriages
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Marriage Media was founded with a simple mission: to help people find their
              perfect life partner through technology, trust, and genuine care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize the matchmaking experience in Bangladesh by combining
                traditional values with modern technology. We strive to create a safe,
                trusted platform where individuals and families can find compatible life
                partners with confidence and ease.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To become Bangladesh's most trusted and loved matrimony platform,
                known for our commitment to genuine profiles, privacy, and helping millions
                of people find their happily ever after. We envision a world where every
                person finds their perfect match.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Our Values
            </Badge>
            <h2 className="text-3xl font-bold mb-4">What We Stand For</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our core values guide everything we do, from building features to serving our community.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Our Team
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Meet the People Behind Marriage Media</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A passionate team dedicated to helping you find your perfect match.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Verified Profiles",
                description:
                  "Every profile goes through a rigorous verification process. We manually check each profile to ensure authenticity.",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Matching",
                description:
                  "Our advanced AI algorithm analyzes 50+ compatibility factors to suggest the best matches for you.",
              },
              {
                icon: Handshake,
                title: "Family-Oriented",
                description:
                  "We understand the importance of family in Bangladeshi culture. Our platform supports family involvement in the matching process.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex gap-4"
              >
                <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-muted-foreground text-lg">
              Marriage Media has been recognized as one of the leading matrimony platforms
              in Bangladesh. Our commitment to trust, safety, and genuine connections has
              earned us the loyalty of over 50,000 active users and thousands of happy marriages.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
