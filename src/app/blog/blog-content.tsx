"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string | null;
}

const categories = ["All", "Tips & Advice", "Technology", "Success Stories", "Culture", "Safety"];

export default function BlogContent() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/blog?limit=12");
        const data = (await response.json()) as { posts?: BlogPost[] };
        if (isMounted) {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
        }
      } catch {
        if (isMounted) {
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const searchText = `${post.title} ${post.excerpt}`.toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4"><BookOpen className="h-3.5 w-3.5 mr-1" />Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Marriage Media <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Blog</span></h1>
            <p className="text-lg text-muted-foreground">Tips, stories, and insights to help you on your journey.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-8 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{category}</button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Loading articles from the database...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No articles match your current filters.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                    <div className="h-48 bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 rounded-t-2xl flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{post.slug ? "Article" : "Story"}</div>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently published"}</div>
                        <span className="text-sm text-primary hover:underline font-medium flex items-center gap-1">Read more<ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}