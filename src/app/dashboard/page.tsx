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
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const stats = [
  { label: "Profile Views", value: "24", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Interests Received", value: "12", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { label: "Mutual Interests", value: "5", icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Messages", value: "3", icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const recentMatches = [
  { name: "Fatima K.", age: 24, location: "Dhaka", profession: "Engineer", compatibility: 92 },
  { name: "Ayesha R.", age: 26, location: "Chittagong", profession: "Doctor", compatibility: 87 },
  { name: "Nadia S.", age: 23, location: "Sylhet", profession: "Teacher", compatibility: 84 },
  { name: "Samira H.", age: 25, location: "Rajshahi", profession: "Lawyer", compatibility: 81 },
];

export default function DashboardPage() {
  const profileCompletion = 65;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your profile today.
            </p>
          </motion.div>

          {/* Profile Completion Banner */}
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
                        Profiles with 100% completion get 3x more views and interests.
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

          {/* Stats Grid */}
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
            {/* Recommended Matches */}
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
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div
                        key={match.name}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {match.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{match.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {match.age} yrs
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {match.profession} · {match.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-500">
                              {match.compatibility}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">match</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/profile/${match.name}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
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

              {/* Premium Upsell */}
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