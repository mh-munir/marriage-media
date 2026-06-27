"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Heart,
  MessageCircle,
  Eye,
  Crown,
  Search,
  TrendingUp,
  Star,
  ArrowRight,
  UserPlus,
  Loader2,
  Bell,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { getInitials } from "@/lib/utils";

interface ProfileSummary {
  profileViews?: number;
  profileCompleted?: number;
  firstName?: string;
  lastName?: string;
  age?: number;
  profession?: string;
  division?: string;
  district?: string;
  area?: string;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
}

interface RecommendedMatch {
  userId: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  profession?: string;
  division?: string;
  district?: string;
  area?: string;
  compatibility?: number;
  photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function getPrimaryPhoto(photos?: Array<{ url?: string; isPrimary?: boolean; isApproved?: boolean }>): string | undefined {
  const approved = photos?.filter((photo) => photo.isApproved && photo.url) ?? [];
  return approved.find((photo) => photo.isPrimary)?.url ?? approved[0]?.url ?? undefined;
}

function getLocation(profile: Pick<ProfileSummary, "division" | "district" | "area">): string {
  return [profile.area, profile.district, profile.division].filter(Boolean).join(", ") || "Location not added";
}

export default function DashboardPage() {
  const { user } = useAuthStore();
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

        const conversations = Array.isArray(conversationsData.conversations) ? conversationsData.conversations : [];
        const unread = conversations.reduce((sum, conversation) => sum + (conversation?.unreadCount || 0), 0);
        setConversationStats({ total: conversations.length, unread });
        setRecommendations(Array.isArray(recommendationsData.profiles) ? recommendationsData.profiles : []);
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
  }, []);

  const profileCompletion = profile?.profileCompleted ?? user?.profileCompleted ?? 0;
  const displayName = user?.firstName || user?.email?.split("@")[0] || "there";

  const stats = React.useMemo(
    () => [
      {
        label: "Profile Views",
        value: isLoading ? "—" : formatCount(profile?.profileViews ?? 0),
        icon: Eye,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: "Interests Received",
        value: isLoading ? "—" : formatCount(interestCount),
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      },
      {
        label: "Unread Alerts",
        value: isLoading ? "—" : formatCount(unreadCount),
        icon: Bell,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Unread Messages",
        value: isLoading ? "—" : formatCount(conversationStats.unread),
        icon: MessageCircle,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
    ],
    [conversationStats.unread, interestCount, isLoading, profile?.profileViews, unreadCount]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {displayName}! 👋</h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your profile today.
            </p>
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
                      <h3 className="font-semibold mb-1">Complete your profile</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Profiles with 100% completion get more visibility and better match suggestions.
                      </p>
                      <div className="flex items-center gap-3">
                        <Progress value={profileCompletion} className="flex-1 max-w-xs" />
                        <span className="text-sm font-medium">{profileCompletion}%</span>
                      </div>
                    </div>
                    <Button variant="gradient" asChild>
                      <Link href="/dashboard/profile">
                        Complete Profile
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
                  <CardTitle className="text-lg">AI Recommended Matches</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/search">
                      View All
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
                      Complete your profile and start exploring to unlock match recommendations.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((match) => {
                        const name = [match.firstName, match.lastName].filter(Boolean).join(" ") || "Match";
                        const location = getLocation(match);
                        return (
                          <div
                            key={match.userId}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={getPrimaryPhoto(match.photos)} alt={name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{name}</h4>
                                {typeof match.age === "number" ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {match.age} yrs
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {match.profession || "Profile shared"} · {location}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-sm font-semibold text-emerald-500">
                                  {match.compatibility ?? 0}%
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">match</span>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/dashboard/search">
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
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
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/search">
                      <Search className="h-4 w-4 mr-2" />
                      Search Profiles
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/interests">
                      <Heart className="h-4 w-4 mr-2" />
                      View Interests
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/messages">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/favorites">
                      <Star className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Go Premium</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unlock unlimited interests, chat, and AI matching to find your partner faster.
                  </p>
                  <Button variant="gradient" className="w-full" asChild>
                    <Link href="/pricing">
                      Upgrade Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}