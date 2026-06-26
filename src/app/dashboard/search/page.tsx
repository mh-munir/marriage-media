"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  Star,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Shield,
  Crown,
  X,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BANGLADESH_DIVISIONS,
  RELIGIONS,
  EDUCATION_LEVELS,
  PROFESSIONS,
} from "@/lib/utils";

const mockProfiles = [
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
    isOnline: true,
    about: "Passionate about technology and family values.",
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
    isOnline: false,
    about: "Dedicated medical professional seeking a caring partner.",
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
    isOnline: true,
    about: "Love teaching and exploring new cultures.",
  },
  {
    id: "4",
    name: "Samira H.",
    age: 25,
    height: "5'2\"",
    location: "Rajshahi",
    religion: "Islam",
    profession: "Lawyer",
    education: "Professional Degree",
    compatibility: 81,
    isPremium: false,
    isVerified: true,
    isOnline: false,
    about: "Justice-oriented professional with a love for books.",
  },
  {
    id: "5",
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
    isOnline: true,
    about: "Tech enthusiast who values family traditions.",
  },
  {
    id: "6",
    name: "Maliha B.",
    age: 22,
    height: "5'1\"",
    location: "Khulna",
    religion: "Islam",
    profession: "Student",
    education: "Higher Secondary",
    compatibility: 75,
    isPremium: false,
    isVerified: false,
    isOnline: false,
    about: "Recent graduate looking for a life partner.",
  },
];

export default function DashboardSearchPage() {
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState({
    ageMin: "",
    ageMax: "",
    religion: "",
    profession: "",
    education: "",
    division: "",
  });

  const filteredProfiles = mockProfiles.filter((profile) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !profile.name.toLowerCase().includes(q) &&
        !profile.profession.toLowerCase().includes(q) &&
        !profile.location.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Search Profiles</h1>
            <p className="text-muted-foreground">
              Find your perfect match with advanced filters and AI recommendations.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, profession, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-12"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </motion.div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Age Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.ageMin}
                          onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                          className="h-10"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.ageMax}
                          onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Religion</label>
                      <select
                        value={filters.religion}
                        onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Any</option>
                        {RELIGIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Profession</label>
                      <select
                        value={filters.profession}
                        onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Any</option>
                        {PROFESSIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Education</label>
                      <select
                        value={filters.education}
                        onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Any</option>
                        {EDUCATION_LEVELS.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Division</label>
                      <select
                        value={filters.division}
                        onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Any</option>
                        {BANGLADESH_DIVISIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setFilters({ ageMin: "", ageMax: "", religion: "", profession: "", education: "", division: "" })
                        }
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Recommendation Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">AI-Powered Recommendations</p>
                  <p className="text-xs text-muted-foreground">
                    Results are sorted by compatibility score based on your preferences.
                  </p>
                </div>
                <Badge variant="premium">Premium</Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProfiles.length} profiles
            </p>
          </div>

          {/* Profile Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
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
                        {profile.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                        )}
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
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-500">
                            {profile.compatibility}%
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">match</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 mb-4">
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

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="gradient" size="sm" className="flex-1">
                        <Heart className="h-3.5 w-3.5" />
                        Send Interest
                      </Button>
                      <Button variant="outline" size="sm">
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Profiles
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}