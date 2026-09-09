"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  GraduationCap,
  Briefcase,
  Trash2,
  MessageCircle,
  Shield,
  Crown,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FavoriteProfile {
  id: string;
  profileUserId: string;
  name: string;
  age: number | null;
  height: string;
  location: string;
  religion: string;
  profession: string;
  education: string;
  compatibility: number;
  isPremium: boolean;
  isVerified: boolean;
  about: string;
  addedAt: string;
}

export default function DashboardFavoritesPage() {
  const [favorites, setFavorites] = React.useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      setLoading(true);
      try {
        const response = await fetch("/api/profile/favorites");
        const data = (await response.json()) as { favorites?: FavoriteProfile[] };
        if (isMounted) {
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        }
      } catch {
        if (isMounted) {
          setFavorites([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const removeFavorite = async (profileUserId: string) => {
    const previous = favorites;
    setFavorites((current) => current.filter((favorite) => favorite.profileUserId !== profileUserId));

    try {
      await fetch(`/api/profile/favorites?profileUserId=${encodeURIComponent(profileUserId)}`, {
        method: "DELETE",
      });
    } catch {
      setFavorites(previous);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Favorites</h1>
              <Badge variant="secondary">{favorites.length}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Profiles you&apos;ve saved for later.</p>
          </motion.div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading your saved profiles…</div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">Browse profiles and save your favorites to view them here.</p>
              <Button variant="gradient" asChild>
                <Link href="/dashboard/search">Search Profiles</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((profile, index) => (
                <motion.div key={profile.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} layout>
                  <Card className="hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{profile.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{profile.name}</h3>
                            {profile.isVerified && <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                            {profile.isPremium && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{profile.age ? `${profile.age} yrs` : "Age not shared"} · {profile.height || "Height hidden"}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-500">{profile.compatibility}%</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">match</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {profile.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          {profile.profession}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          {profile.education}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{profile.about}</p>
                      <div className="text-xs text-muted-foreground mb-3">Saved {profile.addedAt}</div>

                      <div className="flex items-center gap-2">
                        <Button variant="gradient" size="sm" className="flex-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => void removeFavorite(profile.profileUserId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}