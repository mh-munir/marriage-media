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

const favoriteProfiles = [
  {
    id: "1",
    name: "Fatima K.",
    age: 24,
    height: "5'4\"",
    location: "Dhaka",
    religion: "Islam",
    profession: "Engineer",
    education: "Bachelor's Degree",
    compatibility: 92,
    isPremium: true,
    isVerified: true,
    about: "Passionate about technology and family values.",
    addedAt: "2 days ago",
  },
  {
    id: "2",
    name: "Ayesha R.",
    age: 26,
    height: "5'3\"",
    location: "Chittagong",
    religion: "Islam",
    profession: "Doctor",
    education: "Master's Degree",
    compatibility: 87,
    isPremium: false,
    isVerified: true,
    about: "Dedicated medical professional seeking a caring partner.",
    addedAt: "3 days ago",
  },
  {
    id: "3",
    name: "Nadia S.",
    age: 23,
    height: "5'5\"",
    location: "Sylhet",
    religion: "Islam",
    profession: "Teacher",
    education: "Bachelor's Degree",
    compatibility: 84,
    isPremium: true,
    isVerified: false,
    about: "Love teaching and exploring new cultures.",
    addedAt: "1 week ago",
  },
  {
    id: "4",
    name: "Tasnia M.",
    age: 27,
    height: "5'6\"",
    location: "Dhaka",
    religion: "Islam",
    profession: "IT Professional",
    education: "Bachelor's Degree",
    compatibility: 79,
    isPremium: true,
    isVerified: true,
    about: "Tech enthusiast who values family traditions.",
    addedAt: "1 week ago",
  },
];

export default function DashboardFavoritesPage() {
  const [favorites, setFavorites] = React.useState(favoriteProfiles);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Favorites</h1>
              <Badge variant="secondary">{favorites.length}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Profiles you've saved for later.
            </p>
          </motion.div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Browse profiles and save your favorites to view them here.
              </p>
              <Button variant="gradient" asChild>
                <Link href="/dashboard/search">
                  Search Profiles
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-5">
                      {/* Profile Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                              {profile.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{profile.name}</h3>
                            {profile.isVerified && (
                              <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            )}
                            {profile.isPremium && (
                              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile.age} yrs · {profile.height}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-500">
                              {profile.compatibility}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">match</span>
                        </div>
                      </div>

                      {/* Details */}
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

                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {profile.about}
                      </p>

                      <div className="text-xs text-muted-foreground mb-3">
                        Saved {profile.addedAt}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="gradient" size="sm" className="flex-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Profile
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFavorite(profile.id)}
                        >
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