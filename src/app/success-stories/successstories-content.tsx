"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  Calendar,
  Quote,
  ArrowRight,
  Users,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";

interface StoryCard {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string | null;
}

const stats = [
  { label: "Happy Couples", value: "Live", icon: Heart },
  { label: "Success Rate", value: "Database", icon: Star },
  { label: "Average Match Time", value: "Live", icon: Calendar },
  { label: "Cities Covered", value: "Live", icon: MapPin },
];

export default function SuccessStoriesPage() {
  const { page, loading: pageLoading } = useSitePage("success-stories");
  const [stories, setStories] = React.useState<StoryCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadStories() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/success-stories?limit=6");
        const data = (await response.json()) as { stories?: StoryCard[] };
        if (isMounted) {
          setStories(Array.isArray(data.stories) ? data.stories : []);
        }
      } catch {
        if (isMounted) {
          setStories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStories();

    return () => {
      isMounted = false;
    };
  }, []);
  if (pageLoading) return null;
  if (page?.content) return <SitePageOverride page={page} />;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Heart className="h-3.5 w-3.5 mr-1" />
              Success Stories
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Love Stories That{" "}
              <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Inspire
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real couples who found their perfect match on Marriage Media. Their stories
              could be your story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Loading success stories from the database...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-linear-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {story.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{story.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {story.category}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently published"}
                          </div>
                        </div>
                      </div>

                      <div className="relative mb-4">
                        <Quote className="h-6 w-6 text-primary/20 absolute -top-1 -left-1" />
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                          {story.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Published from the live blog feed
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-linear-to-br from-rose-500 via-pink-500 to-purple-600 p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <Users className="h-12 w-12 text-white/80 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Love Story Starts Here
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join thousands of happy couples who found their perfect match on Marriage Media.
                Start your journey today.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
