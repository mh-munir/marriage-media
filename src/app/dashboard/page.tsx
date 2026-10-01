"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Eye,
  Crown,
  Search,
  Star,
  ArrowRight,
  Loader2,
  Bell,
  Pencil,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileCard } from "@/components/profile-card";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useLanguage } from "@/providers/language-provider";

interface ProfileSummary {
  profileViews?: number;
  createdAt?: string;
  profileCompleted?: number;
  firstName?: string;
  lastName?: string;
  age?: number;
  profession?: string;
  division?: string;
  district?: string;
  area?: string;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
  isFavorite?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

interface RecommendedMatch {
  userId?: string;
  _id?: string;
  publicId?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  profession?: string;
  division?: string;
  district?: string;
  area?: string;
  compatibility?: number;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
  profileViews?: number;
  createdAt?: string;
  isFavorite?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
}

function normalizeProfileId(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "$oid" in value) {
    const objectId = (value as { $oid?: unknown }).$oid;
    return typeof objectId === "string" ? objectId.trim() : "";
  }
  return "";
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { translateText: text, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [profile, setProfile] = React.useState<ProfileSummary | null>(null);
  const [recommendations, setRecommendations] = React.useState<RecommendedMatch[]>([]);
  const [interestCount, setInterestCount] = React.useState(0);
  const [conversationStats, setConversationStats] = React.useState({ total: 0, unread: 0 });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void fetchNotifications(true);
  }, [fetchNotifications]);

  React.useEffect(() => {
    if (pathname !== "/dashboard") return;

    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        const [profileRes, interestsRes, conversationsRes, recommendationsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/interests?type=received"),
          fetch("/api/chat/conversations"),
          fetch("/api/search/recommendations?limit=4"),
        ]);

        const profileData = profileRes.ok ? await profileRes.json() : null;
        const interestsData = interestsRes.ok ? await interestsRes.json() : { interests: [] };
        const conversationsData = conversationsRes.ok ? await conversationsRes.json() : { conversations: [] };
        const recommendationsData = recommendationsRes.ok ? await recommendationsRes.json() : { profiles: [] };

        if (!isMounted) return;

        const nextProfile = profileData?.profile as ProfileSummary | undefined;
        setProfile(nextProfile ?? null);
        setInterestCount(Array.isArray(interestsData.interests) ? interestsData.interests.length : 0);

        const conversations: Array<{ unreadCount?: number }> = Array.isArray(conversationsData.conversations)
          ? conversationsData.conversations
          : [];
        const unread = conversations.reduce((sum: number, conversation) => sum + (conversation?.unreadCount || 0), 0);
        setConversationStats({ total: conversations.length, unread });
        setRecommendations(
          Array.isArray(recommendationsData.profiles)
            ? recommendationsData.profiles
                .filter((match: RecommendedMatch) => (match.compatibility ?? 0) > 50)
                .sort((first: RecommendedMatch, second: RecommendedMatch) =>
                  (second.compatibility ?? 0) - (first.compatibility ?? 0)
                )
            : []
        );
      } catch {
        if (isMounted) {
          setProfile(null);
          setInterestCount(0);
          setConversationStats({ total: 0, unread: 0 });
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const profileCompletion = profile?.profileCompleted ?? user?.profileCompleted ?? 0;
  const displayName = user?.firstName || user?.email?.split("@")[0] || text("there");

  const toggleRecommendationFavorite = React.useCallback(async (profileUserId: string) => {
    const update = (list: RecommendedMatch[]) => list.map((match) =>
      String(match.userId || match._id) === String(profileUserId)
        ? { ...match, isFavorite: !match.isFavorite }
        : match
    );

    setRecommendations(update);
    try {
      const response = await fetch("/api/profile/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUserId }),
      });
      if (!response.ok) throw new Error("Unable to update favorite.");
      const result = (await response.json()) as { isFavorite?: boolean };
      setRecommendations((current) => current.map((match) =>
        String(match.userId || match._id) === String(profileUserId)
          ? { ...match, isFavorite: Boolean(result.isFavorite) }
          : match
      ));
    } catch {
      setRecommendations(update);
    }
  }, []);

  const viewRecommendation = React.useCallback(async (profileUserId: string) => {
    if (!profileUserId) return;

    router.push(`/dashboard/profile/${profileUserId}`);
    void fetch("/api/search/recently-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUserId }),
    }).catch(() => undefined);
  }, [router]);

  const openProfileMessages = React.useCallback(async (profileUserId: string) => {
    if (!profileUserId) return;

    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: profileUserId }),
    });
    const result = await response.json() as { conversationId?: string };
    if (response.ok && result.conversationId) {
      router.push(`/dashboard/messages?conversationId=${encodeURIComponent(result.conversationId)}`);
    }
  }, [router]);

  const stats = React.useMemo(
    () => [
      {
        label: text("Profile Views"),
        value: isLoading ? "—" : new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(profile?.profileViews ?? 0),
        icon: Eye,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: text("Interests Received"),
        value: isLoading ? "—" : new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(interestCount),
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      },
      {
        label: text("Unread Alerts"),
        value: isLoading ? "—" : new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(unreadCount),
        icon: Bell,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: text("Unread Messages"),
        value: isLoading ? "—" : new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(conversationStats.unread),
        icon: MessageCircle,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
    ],
    [conversationStats.unread, interestCount, isLoading, language, profile?.profileViews, text, unreadCount]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{text("Welcome back")}, {displayName}! 👋</h1>
              <p className="text-muted-foreground">
                {text("Here's what's happening with your profile today.")}
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-xl border-primary/25 text-primary hover:bg-primary/5">
              <Link href="/dashboard/profile">
                <Pencil className="h-4 w-4" />
                {text("Edit Profile")}
              </Link>
            </Button>
          </motion.div>

          {profileCompletion < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{text("Complete your profile")}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {text("Profiles with 100% completion get more visibility and better match suggestions.")}
                      </p>
                      <div className="flex items-center gap-3">
                        <Progress value={profileCompletion} className="flex-1 max-w-xs" />
                        <span className="text-sm font-medium">{profileCompletion}%</span>
                      </div>
                    </div>
                    <Button variant="gradient" asChild>
                      <Link href="/dashboard/profile">
                        {text("Complete Profile")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{text("AI Recommended Matches")}</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/search">
                      {text("View All")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      {text("Add your Expected partner preferences to see profiles with more than 50% matches.")}
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {recommendations.map((match, index) => {
                        const matchIdentifier = normalizeProfileId(match.userId) || normalizeProfileId(match._id);
                        if (!matchIdentifier) return null;

                        return (
                          <ProfileCard
                            key={`${matchIdentifier}-${index}`}
                            profile={{
                              userId: matchIdentifier,
                              publicId: match.publicId,
                              firstName: match.firstName || "",
                              lastName: match.lastName || "",
                              age: typeof match.age === "number" ? match.age : null,
                              gender: match.gender,
                              profession: match.profession || "",
                              division: match.division || "",
                              district: match.district || "",
                              area: match.area || "",
                              imageUrl: match.photos?.find((photo) => photo.isPrimary && photo.url)?.url
                                || match.photos?.find((photo) => photo.isApproved && photo.url)?.url
                                || null,
                              isPremium: Boolean(match.isPremium),
                              isVerified: Boolean(match.isVerified),
                              isFavorite: Boolean(match.isFavorite),
                              isOnline: Boolean(match.isOnline),
                              profileViews: match.profileViews,
                              createdAt: match.createdAt,
                              matchPercentage: match.compatibility ?? 0,
                            }}
                            index={index}
                            currentUserIsPremium={Boolean(user?.isPremium)}
                            onFavoriteAction={(profileUserId) => void toggleRecommendationFavorite(profileUserId)}
                            onMessageAction={(profileUserId) => void openProfileMessages(profileUserId)}
                            onViewAction={(profileUserId) => void viewRecommendation(profileUserId)}
                          />
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{text("Quick Actions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/search">
                      <Search className="h-4 w-4 mr-2" />
                      {text("Search Profiles")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/interests">
                      <Heart className="h-4 w-4 mr-2" />
                      {text("View Interests")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/messages">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {text("Messages")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/favorites">
                      <Star className="h-4 w-4 mr-2" />
                      {text("Favorites")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {!profile?.isPremium ? (
                <Card className="border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <h3 className="font-semibold">{text("Go Premium")}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {text("Unlock unlimited interests, chat, and AI matching to find your partner faster.")}
                    </p>
                    <Button variant="gradient" className="w-full" asChild>
                      <Link href="/pricing">
                        {text("Upgrade Now")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
