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
  X,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";
import { defaultManagedSections, sectionValue, useManagedPage } from "@/components/seo/managed-page-content";

interface StoryCard {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string | null;
}

export default function SuccessStoriesPage() {
  const { page, loading: pageLoading } = useSitePage("success-stories");
  const { sections, loading: managedLoading } = useManagedPage("success-stories");
  const [stories, setStories] = React.useState<StoryCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<{ url: string; alt: string; title: string; text: string } | null>(null);

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
  React.useEffect(() => {
    if (!selectedImage) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedImage(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedImage]);
  if (pageLoading || managedLoading) return null;
  if (page?.content) return <SitePageOverride page={page} />;

  const defaults = defaultManagedSections("success-stories");
  const hero = sectionValue(sections.length ? sections : defaults, "hero", defaults[0]);
  const gallery = sectionValue(sections.length ? sections : defaults, "gallery", defaults[1]);
  const cta = sectionValue(sections.length ? sections : defaults, "cta", defaults[2]);

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
              {hero.eyebrow}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              {hero.title}{" "}
              <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Inspire
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.visible ? <section className="border-y border-border bg-card/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">{gallery.eyebrow}</Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{gallery.title}</h2>
            <p className="text-muted-foreground">{gallery.description}</p>
          </motion.div>
          <div className="grid auto-rows-[14rem] grid-cols-2 gap-4 md:auto-rows-[18rem] md:grid-cols-4">
            {gallery.items.filter((item) => item.imageUrl).map((item, index) => (
              <motion.figure key={`${item.imageUrl}-${index}`} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className={`group relative overflow-hidden rounded-2xl ${index === 0 ? "col-span-2 row-span-2" : index === 3 ? "col-span-2" : ""}`}>
                <button type="button" className="absolute inset-0 z-10 cursor-zoom-in" aria-label={`Open ${item.title || "success story image"} fullscreen`} onClick={() => setSelectedImage({ url: item.imageUrl || "", alt: item.imageAlt || item.title || "Success story", title: item.title, text: item.text })} />
                <img src={item.imageUrl} alt={item.imageAlt || item.title || "Success story"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                {item.title || item.text ? <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-5 pb-5 pt-12 text-white"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-white/80">{item.text}</p></figcaption> : null}
              </motion.figure>
            ))}
          </div>
        </div>
      </section> : null}

      {selectedImage ? <div role="dialog" aria-modal="true" aria-label="Fullscreen success story image" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
        <button type="button" aria-label="Close fullscreen image" className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={() => setSelectedImage(null)}><X className="h-6 w-6" /></button>
        <div className="relative max-h-[90vh] max-w-6xl" onClick={(event) => event.stopPropagation()}>
          <img src={selectedImage.url} alt={selectedImage.alt} className="max-h-[82vh] max-w-full rounded-xl object-contain" />
          {selectedImage.title || selectedImage.text ? <div className="mt-3 text-center text-white"><p className="font-semibold">{selectedImage.title}</p><p className="text-sm text-white/70">{selectedImage.text}</p></div> : null}
        </div>
      </div> : null}

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
                {cta.title}
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                {cta.description}
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">
                  {cta.buttonText || "Create Free Account"}
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
