"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  Search,
  Heart,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const blogPosts = [
  {
    id: "1",
    title: "10 Tips for Creating the Perfect Matrimony Profile",
    excerpt:
      "Your profile is your first impression. Learn how to create a compelling profile that attracts the right matches and stands out from the crowd.",
    category: "Tips & Advice",
    date: "2026-06-20",
    readTime: "5 min read",
    tags: ["profile", "tips", "dating"],
    featured: true,
  },
  {
    id: "2",
    title: "How AI Matching is Revolutionizing Bangladeshi Matrimony",
    excerpt:
      "Discover how artificial intelligence is helping thousands of Bangladeshis find their perfect life partner with unprecedented accuracy.",
    category: "Technology",
    date: "2026-06-18",
    readTime: "7 min read",
    tags: ["AI", "technology", "matching"],
    featured: false,
  },
  {
    id: "3",
    title: "Success Story: From Online Match to Happy Marriage",
    excerpt:
      "Read the inspiring story of Farhana and Imran who found each other on Marriage Media and built a beautiful life together.",
    category: "Success Stories",
    date: "2026-06-15",
    readTime: "4 min read",
    tags: ["success story", "marriage", "love"],
    featured: false,
  },
  {
    id: "4",
    title: "Understanding Family Values in Bangladeshi Matrimony",
    excerpt:
      "Why family values matter in the matchmaking process and how to find a partner who shares your cultural and family traditions.",
    category: "Culture",
    date: "2026-06-12",
    readTime: "6 min read",
    tags: ["family", "culture", "values"],
    featured: false,
  },
  {
    id: "5",
    title: "Safety Tips for Online Matrimony: A Complete Guide",
    excerpt:
      "Stay safe while searching for your perfect match. Essential safety tips and best practices for online matrimony platforms.",
    category: "Safety",
    date: "2026-06-10",
    readTime: "8 min read",
    tags: ["safety", "tips", "guide"],
    featured: false,
  },
  {
    id: "6",
    title: "Premium vs Free: Which Matrimony Plan is Right for You?",
    excerpt:
      "A detailed comparison of free and premium features to help you choose the best plan for your matchmaking journey.",
    category: "Tips & Advice",
    date: "2026-06-08",
    readTime: "5 min read",
    tags: ["premium", "pricing", "comparison"],
    featured: false,
  },
];

const categories = ["All", "Tips & Advice", "Technology", "Success Stories", "Culture", "Safety"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured || selectedCategory !== "All");

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
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Blog
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Marriage Media{" "}
              <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tips, stories, and insights to help you on your journey to finding the perfect life partner.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {selectedCategory === "All" && featuredPost && !searchQuery && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" className="mb-4">
                Featured Article
              </Badge>
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline">{featuredPost.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(featuredPost.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-2 mb-6">
                        {featuredPost.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/blog/${featuredPost.id}`}>
                          Read Article
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="h-64 rounded-2xl bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                    <div className="h-48 bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 rounded-t-2xl flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <Link
                          href={`/blog/${post.id}`}
                          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          Read more
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Get the latest tips, success stories, and updates from Marriage Media delivered to your inbox.
            </p>
            <div className="flex items-center gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" type="email" className="flex-1" />
              <Button variant="gradient">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}