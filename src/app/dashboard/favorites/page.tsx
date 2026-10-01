"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { useAuthStore } from "@/stores/auth-store";

interface FavoriteProfile extends ProfileCardData {
  id: string;
  profileUserId: string;
  height: string;
  religion: string;
  education: string;
  compatibility: number;
  addedAt: string;
}

export default function DashboardFavoritesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  const openProfile = (profileUserId: string) => router.push(`/dashboard/profile/${profileUserId}`);
  const openMessages = (profileUserId: string) => router.push(`/dashboard/messages?participantId=${encodeURIComponent(profileUserId)}`);

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((profile, index) => (
                <ProfileCard key={profile.id} profile={profile} index={index} currentUserIsPremium={Boolean(user?.isPremium)} onFavorite={removeFavorite} onMessage={openMessages} onView={openProfile} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}