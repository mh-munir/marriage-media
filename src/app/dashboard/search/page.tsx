"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  Star,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Shield,
  Crown,
  X,
  TrendingUp,
  Clock,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPinned,
  Flame,
  Eye,
  User,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SearchFiltersPanel,
  type SearchFilters,
} from "@/components/search/search-filters";

/* ──────── Helpers ──────── */

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function buildSearchUrl(filters: SearchFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.searchQuery) params.set("q", filters.searchQuery);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.ageMin) params.set("ageMin", filters.ageMin);
  if (filters.ageMax) params.set("ageMax", filters.ageMax);
  if (filters.heightMin) params.set("heightMin", filters.heightMin);
  if (filters.heightMax) params.set("heightMax", filters.heightMax);
  if (filters.religion) params.set("religion", filters.religion);
  if (filters.motherTongue) params.set("motherTongue", filters.motherTongue);
  if (filters.maritalStatus) params.set("maritalStatus", filters.maritalStatus);
  if (filters.education) params.set("education", filters.education);
  if (filters.institution) params.set("institution", filters.institution);
  if (filters.profession) params.set("profession", filters.profession);
  if (filters.workingWith) params.set("workingWith", filters.workingWith);
  if (filters.incomeRange) params.set("incomeRange", filters.incomeRange);
  if (filters.country) params.set("country", filters.country);
  if (filters.division) params.set("division", filters.division);
  if (filters.nationality) params.set("nationality", filters.nationality);
  if (filters.familyType) params.set("familyType", filters.familyType);
  if (filters.familyStatus) params.set("familyStatus", filters.familyStatus);
  if (filters.familyValues) params.set("familyValues", filters.familyValues);
  if (filters.diet) params.set("diet", filters.diet);
  if (filters.smoke) params.set("smoke", filters.smoke);
  if (filters.drink) params.set("drink", filters.drink);
  if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
  if (filters.profileCreatedBy) params.set("profileCreatedBy", filters.profileCreatedBy);
  if (filters.hasPhoto) params.set("hasPhoto", "true");
  if (filters.isVerified) params.set("isVerified", "true");
  if (filters.isPremium) params.set("isPremium", "true");
  if (filters.hobbies.length > 0) params.set("hobbies", filters.hobbies.join(","));
  if (filters.activeWithinDays) params.set("activeWithinDays", filters.activeWithinDays);
  if (filters.sortBy && filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
  if (filters.caste) params.set("caste", filters.caste);
  params.set("page", String(page));
  params.set("limit", "12");
  return `/api/profile/search?${params.toString()}`;
}

/* ──────── Profile Card ──────── */

interface ProfileCardProps {
  profile: Record<string, unknown>;
  index: number;
  compatibility?: number;
  proximity?: string;
  trendingScore?: number;
  rank?: number;
  viewCount?: number;
  lastViewedAt?: string;
  showViewCount?: boolean;
}

function ProfileCard({
  profile,
  index,
  compatibility,
  proximity,
  trendingScore,
  rank,
  viewCount,
  lastViewedAt,
  showViewCount,
}: ProfileCardProps) {
  const p = profile;
  const firstName = (p.firstName as string) || "";
  const lastName = (p.lastName as string) || "";
  const name = `${firstName} ${lastName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-5">
          {/* Profile Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
              {p.lastActiveAt && new Date(p.lastActiveAt as string).getTime() > Date.now() - 15 * 60 * 1000 && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{name}</h3>
                {(p.isVerified as boolean) && <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                {(p.isPremium as boolean) && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {String(p.age)} yrs · {String(p.height)}
              </p>
            </div>
            <div className="text-right shrink-0">
              {compatibility !== undefined ? (
                <>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-500">{compatibility}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">match</span>
                </>
              ) : trendingScore !== undefined ? (
                <>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-sm font-bold text-orange-500">{trendingScore}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">trending</span>
                </>
              ) : null}
              {rank !== undefined && (
                <Badge variant="outline" className="mt-1 text-[10px] px-1.5">
                  #{rank}
                </Badge>
              )}
            </div>
          </div>

          {/* Proximity badge */}
          {proximity && (
            <div className="mb-2">
              <Badge variant="secondary" className="text-[10px]">
                <MapPinned className="h-2.5 w-2.5 mr-1" />
                {proximity}
              </Badge>
            </div>
          )}

          {/* View count */}
          {showViewCount && viewCount !== undefined && (
            <div className="mb-2">
              <Badge variant="outline" className="text-[10px]">
                <Eye className="h-2.5 w-2.5 mr-1" />
                Viewed {viewCount}x
              </Badge>
            </div>
          )}

          {/* Details */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {(p.district as string) || (p.division as string) || "N/A"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3 w-3 shrink-0" />
              {p.profession as string}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-3 w-3 shrink-0" />
              {p.highestEducation as string}
            </div>
          </div>

          {(p.aboutMe as string) && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{p.aboutMe as string}</p>
          )}

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
  );
}

/* ──────── Empty State ──────── */

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

/* ──────── Skeleton ──────── */

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-3 bg-muted rounded animate-pulse w-2/5" />
        </div>
        <div className="h-8 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

/* ──────── Pagination ──────── */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-3">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ──────── Main Page ──────── */

export default function DashboardSearchPage() {
  const [activeTab, setActiveTab] = React.useState("search");
  const [filters, setFilters] = React.useState<SearchFilters | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Search results
  const [searchProfiles, setSearchProfiles] = React.useState<Record<string, unknown>[]>([]);
  const [searchTotal, setSearchTotal] = React.useState(0);
  const [searchPage, setSearchPage] = React.useState(1);
  const [searchTotalPages, setSearchTotalPages] = React.useState(0);

  // Recommendations
  const [recProfiles, setRecProfiles] = React.useState<Record<string, unknown>[]>([]);
  const [recTotal, setRecTotal] = React.useState(0);
  const [recPage, setRecPage] = React.useState(1);
  const [recTotalPages, setRecTotalPages] = React.useState(0);

  // Nearby
  const [nearbyProfiles, setNearbyProfiles] = React.useState<Record<string, unknown>[]>([]);
  const [nearbyTotal, setNearbyTotal] = React.useState(0);
  const [nearbyPage, setNearbyPage] = React.useState(1);
  const [nearbyTotalPages, setNearbyTotalPages] = React.useState(0);

  // Trending
  const [trendingProfiles, setTrendingProfiles] = React.useState<Record<string, unknown>[]>([]);
  const [trendingTotal, setTrendingTotal] = React.useState(0);
  const [trendingPage, setTrendingPage] = React.useState(1);
  const [trendingTotalPages, setTrendingTotalPages] = React.useState(0);

  // Recently Viewed
  const [recentProfiles, setRecentProfiles] = React.useState<Record<string, unknown>[]>([]);
  const [recentTotal, setRecentTotal] = React.useState(0);
  const [recentPage, setRecentPage] = React.useState(1);
  const [recentTotalPages, setRecentTotalPages] = React.useState(0);

  // Saved Searches
  const [savedSearches, setSavedSearches] = React.useState<Record<string, unknown>[]>([]);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [saveSearchName, setSaveSearchName] = React.useState("");

  const currentFiltersRef = React.useRef<SearchFilters | null>(null);

  /* ─── Fetch helpers ─── */

  const fetchJSON = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  // Search profiles
  const doSearch = React.useCallback(async (f: SearchFilters, page: number = 1) => {
    setIsLoading(true);
    try {
      const url = buildSearchUrl(f, page);
      const data = await fetchJSON(url);
      setSearchProfiles(data.profiles || []);
      setSearchTotal(data.pagination?.total || 0);
      setSearchPage(data.pagination?.page || 1);
      setSearchTotalPages(data.pagination?.pages || 0);
    } catch {
      setSearchProfiles([]);
      setSearchTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recommendations
  const fetchRecommendations = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchJSON(`/api/search/recommendations?page=${page}&limit=12`);
      setRecProfiles(data.profiles || []);
      setRecTotal(data.pagination?.total || 0);
      setRecPage(data.pagination?.page || 1);
      setRecTotalPages(data.pagination?.pages || 0);
    } catch {
      setRecProfiles([]);
      setRecTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch nearby
  const fetchNearby = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchJSON(`/api/search/nearby?page=${page}&limit=12&radius=50`);
      setNearbyProfiles(data.profiles || []);
      setNearbyTotal(data.pagination?.total || 0);
      setNearbyPage(data.pagination?.page || 1);
      setNearbyTotalPages(data.pagination?.pages || 0);
    } catch {
      setNearbyProfiles([]);
      setNearbyTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trending
  const fetchTrending = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchJSON(`/api/search/trending?page=${page}&limit=12&timeframe=7`);
      setTrendingProfiles(data.profiles || []);
      setTrendingTotal(data.pagination?.total || 0);
      setTrendingPage(data.pagination?.page || 1);
      setTrendingTotalPages(data.pagination?.pages || 0);
    } catch {
      setTrendingProfiles([]);
      setTrendingTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recently viewed
  const fetchRecent = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchJSON(`/api/search/recently-viewed?page=${page}&limit=12`);
      setRecentProfiles(data.profiles || []);
      setRecentTotal(data.pagination?.total || 0);
      setRecentPage(data.pagination?.page || 1);
      setRecentTotalPages(data.pagination?.pages || 0);
    } catch {
      setRecentProfiles([]);
      setRecentTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch saved searches
  const fetchSavedSearches = React.useCallback(async () => {
    try {
      const data = await fetchJSON("/api/search/saved");
      setSavedSearches(data.savedSearches || []);
    } catch {
      setSavedSearches([]);
    }
  }, []);

  /* ─── Tab change ─── */
  const handleTabChange = React.useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === "recommendations" && recProfiles.length === 0) fetchRecommendations();
    if (tab === "nearby" && nearbyProfiles.length === 0) fetchNearby();
    if (tab === "trending" && trendingProfiles.length === 0) fetchTrending();
    if (tab === "recent" && recentProfiles.length === 0) fetchRecent();
    if (tab === "saved" && savedSearches.length === 0) fetchSavedSearches();
  }, [recProfiles.length, nearbyProfiles.length, trendingProfiles.length, recentProfiles.length, savedSearches.length, fetchRecommendations, fetchNearby, fetchTrending, fetchRecent, fetchSavedSearches]);

  /* ─── Filter & Search ─── */
  const handleFilterChange = React.useCallback((f: SearchFilters) => {
    currentFiltersRef.current = f;
    setFilters(f);
  }, []);

  const handleSearch = React.useCallback(() => {
    if (currentFiltersRef.current) {
      doSearch(currentFiltersRef.current, 1);
    }
  }, [doSearch]);

  /* ─── Save Search ─── */
  const handleSaveSearch = React.useCallback(async () => {
    if (!saveSearchName.trim() || !currentFiltersRef.current) return;
    try {
      await fetch("/api/search/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveSearchName.trim(),
          filters: currentFiltersRef.current,
          searchQuery: currentFiltersRef.current.searchQuery,
          resultCount: searchTotal,
        }),
      });
      setSaveSearchName("");
      setShowSaveModal(false);
      fetchSavedSearches();
    } catch {
      // silent
    }
  }, [saveSearchName, searchTotal, fetchSavedSearches]);

  const handleDeleteSavedSearch = React.useCallback(async (id: string) => {
    try {
      await fetch(`/api/search/saved?id=${id}`, { method: "DELETE" });
      fetchSavedSearches();
    } catch {
      // silent
    }
  }, [fetchSavedSearches]);

  const handleLoadSavedSearch = React.useCallback((saved: Record<string, unknown>) => {
    const f = saved.filters as SearchFilters;
    if (f) {
      currentFiltersRef.current = f;
      setFilters(f);
      doSearch(f, 1);
      setActiveTab("search");
    }
  }, [doSearch]);

  /* ─── Load initial data ─── */
  React.useEffect(() => {
    // Do an initial search with no filters to show all profiles
    const initialFetch = async () => {
      setIsLoading(true);
      try {
        const data = await fetchJSON("/api/profile/search?page=1&limit=12");
        setSearchProfiles(data.profiles || []);
        setSearchTotal(data.pagination?.total || 0);
        setSearchPage(1);
        setSearchTotalPages(data.pagination?.pages || 0);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Render profile grid ─── */
  const renderProfileGrid = (
    profiles: Record<string, unknown>[],
    opts?: { compatibility?: boolean; proximity?: boolean; trending?: boolean; rank?: boolean; viewCount?: boolean }
  ) => {
    if (isLoading) {
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (profiles.length === 0) {
      return (
        <EmptyState
          icon={Search}
          title="No profiles found"
          description="Try adjusting your filters or search criteria to find more matches."
        />
      );
    }
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, index) => (
          <ProfileCard
            key={(profile._id as string) || index}
            profile={profile}
            index={index}
            compatibility={opts?.compatibility ? profile.compatibility as number : undefined}
            proximity={opts?.proximity ? profile.proximity as string : undefined}
            trendingScore={opts?.trending ? profile.trendingScore as number : undefined}
            rank={opts?.rank ? profile.rank as number : undefined}
            viewCount={opts?.viewCount ? profile.viewCount as number : undefined}
            showViewCount={opts?.viewCount}
          />
        ))}
      </div>
    );
  };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Discover Matches</h1>
            <p className="text-muted-foreground">
              Find your perfect match with 30+ advanced filters and AI-powered recommendations.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1 mb-6">
                <TabsTrigger value="search" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart Picks
                </TabsTrigger>
                <TabsTrigger value="nearby" className="gap-1.5">
                  <MapPinned className="h-3.5 w-3.5" />
                  Nearby
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Recently Viewed
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-1.5">
                  <Bookmark className="h-3.5 w-3.5" />
                  Saved Searches
                  {savedSearches.length > 0 && (
                    <Badge className="ml-1 h-4 min-w-4 text-[10px] px-1">{savedSearches.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ═══════ Search Tab ═══════ */}
              <TabsContent value="search" className="mt-0">
                <SearchFiltersPanel
                  onFilterChange={handleFilterChange}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  resultCount={searchTotal}
                  initialFilters={filters || undefined}
                  onSaveSearch={() => setShowSaveModal(true)}
                  savedSearchCount={savedSearches.length}
                />
                <div className="mt-6">
                  {renderProfileGrid(searchProfiles)}
                  <Pagination page={searchPage} totalPages={searchTotalPages} onPageChange={(p) => doSearch(currentFiltersRef.current || ({} as SearchFilters), p)} />
                </div>
              </TabsContent>

              {/* ═══════ Recommendations Tab ═══════ */}
              <TabsContent value="recommendations" className="mt-0">
                <Card className="border-primary/20 bg-primary/5 mb-6">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI-Powered Smart Recommendations</p>
                      <p className="text-xs text-muted-foreground">
                        Profiles are scored by compatibility based on religion, age, education, location, family values, hobbies, and lifestyle.
                      </p>
                    </div>
                    <Badge variant="premium">AI</Badge>
                  </CardContent>
                </Card>
                {renderProfileGrid(recProfiles, { compatibility: true })}
                <Pagination page={recPage} totalPages={recTotalPages} onPageChange={fetchRecommendations} />
              </TabsContent>

              {/* ═══════ Nearby Tab ═══════ */}
              <TabsContent value="nearby" className="mt-0">
                <Card className="border-emerald-500/20 bg-emerald-500/5 mb-6">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <MapPinned className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nearby Matches</p>
                      <p className="text-xs text-muted-foreground">
                        Discover profiles in your area. Sorted by proximity — same district first, then same division.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-emerald-500">
                      {nearbyTotal} nearby
                    </Badge>
                  </CardContent>
                </Card>
                {renderProfileGrid(nearbyProfiles, { proximity: true })}
                <Pagination page={nearbyPage} totalPages={nearbyTotalPages} onPageChange={fetchNearby} />
              </TabsContent>

              {/* ═══════ Trending Tab ═══════ */}
              <TabsContent value="trending" className="mt-0">
                <Card className="border-orange-500/20 bg-orange-500/5 mb-6">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Trending Profiles</p>
                      <p className="text-xs text-muted-foreground">
                        Most popular profiles this week — boosted, premium, and highly viewed.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-500">
                      {trendingTotal} trending
                    </Badge>
                  </CardContent>
                </Card>
                {renderProfileGrid(trendingProfiles, { trending: true, rank: true })}
                <Pagination page={trendingPage} totalPages={trendingTotalPages} onPageChange={fetchTrending} />
              </TabsContent>

              {/* ═══════ Recently Viewed Tab ═══════ */}
              <TabsContent value="recent" className="mt-0">
                <Card className="border-blue-500/20 bg-blue-500/5 mb-6">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Recently Viewed Profiles</p>
                      <p className="text-xs text-muted-foreground">
                        Quickly revisit profiles you have browsed before.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-500">
                      {recentTotal} viewed
                    </Badge>
                  </CardContent>
                </Card>
                {renderProfileGrid(recentProfiles, { viewCount: true })}
                <Pagination page={recentPage} totalPages={recentTotalPages} onPageChange={fetchRecent} />
              </TabsContent>

              {/* ═══════ Saved Searches Tab ═══════ */}
              <TabsContent value="saved" className="mt-0">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Your Saved Searches</h3>
                        <p className="text-sm text-muted-foreground">
                          Access your saved filter combinations quickly. {savedSearches.length}/20 slots used.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("search")}>
                        <Search className="h-4 w-4 mr-1" />
                        New Search
                      </Button>
                    </div>

                    {savedSearches.length === 0 ? (
                      <EmptyState
                        icon={Bookmark}
                        title="No saved searches"
                        description="Save a search from the Search tab to quickly access it later."
                      />
                    ) : (
                      <div className="space-y-3">
                        {savedSearches.map((saved) => (
                          <div
                            key={saved._id as string}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <BookmarkCheck className="h-5 w-5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{saved.name as string}</p>
                              <p className="text-xs text-muted-foreground">
                                {(saved.resultCount as number) || 0} results · Created {new Date(saved.createdAt as string).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleLoadSavedSearch(saved)}>
                                <Search className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSavedSearch(saved._id as string)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Save Search Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Save Search</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSaveModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Search Name</label>
                  <Input
                    placeholder="e.g., Doctors in Dhaka, Age 25-30"
                    value={saveSearchName}
                    onChange={(e) => setSaveSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="gradient" onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}