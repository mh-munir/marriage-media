"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wifi,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SearchFiltersPanel,
  type SearchFilters,
} from "@/components/search/search-filters";

type BrowseProfile = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number | null;
  height: string;
  religion: string;
  caste: string;
  division: string;
  district: string;
  area: string;
  highestEducation: string;
  profession: string;
  aboutMe: string;
  imageUrl: string | null;
  isPremium: boolean;
  isVerified: boolean;
  isProfileBoosted: boolean;
  isFavorite: boolean;
  isOnline: boolean;
  lastActiveAt: string | null;
  profileViews?: number;
  maritalStatus: string;
  createdAt: string | null;
  viewCount?: number;
  lastViewedAt?: string;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ProfileResponse = {
  profiles?: BrowseProfile[];
  pagination?: Partial<PaginationState>;
  error?: string;
};

const PAGE_SIZE = 12;

const emptyPagination: PaginationState = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  pages: 0,
};

const sortOptions = [
  { value: "relevance", label: "Best Match" },
  { value: "recently-active", label: "Recently Active" },
  { value: "newest", label: "Newest Members" },
  { value: "age-asc", label: "Age: Low to High" },
  { value: "age-desc", label: "Age: High to Low" },
  { value: "premium", label: "Premium First" },
  { value: "verified", label: "Verified First" },
  { value: "views-desc", label: "Most Viewed" },
];

function buildSearchUrl(filters: Partial<SearchFilters>, page: number, sortBy: string) {
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
  if (filters.hobbies?.length) params.set("hobbies", filters.hobbies.join(","));
  if (filters.activeWithinDays) params.set("activeWithinDays", filters.activeWithinDays);
  if (filters.caste) params.set("caste", filters.caste);

  params.set("sortBy", sortBy);
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  return `/api/profile/search?${params.toString()}`;
}

function normalizePagination(pagination?: Partial<PaginationState>): PaginationState {
  return {
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? PAGE_SIZE,
    total: pagination?.total ?? 0,
    pages: pagination?.pages ?? 0,
  };
}

function profileName(profile: BrowseProfile): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Marriage Media Member";
}

function initials(profile: BrowseProfile): string {
  return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "MM";
}

function formatLocation(profile: BrowseProfile): string {
  return [profile.area, profile.district, profile.division].filter(Boolean).join(", ") || "Location not added";
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

async function fetchJson(url: string, init?: RequestInit): Promise<ProfileResponse> {
  const response = await fetch(url, init);
  const data = (await response.json()) as ProfileResponse;

  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`);
  }

  return data;
}

export default function DashboardSearchPage() {
  const [view, setView] = React.useState<"browse" | "recent">("browse");
  const [filters, setFilters] = React.useState<Partial<SearchFilters>>({});
  const [sortBy, setSortBy] = React.useState("relevance");
  const [profiles, setProfiles] = React.useState<BrowseProfile[]>([]);
  const [pagination, setPagination] = React.useState<PaginationState>(emptyPagination);
  const [recentProfiles, setRecentProfiles] = React.useState<BrowseProfile[]>([]);
  const [recentPagination, setRecentPagination] = React.useState<PaginationState>(emptyPagination);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAppending, setIsAppending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [infiniteScroll, setInfiniteScroll] = React.useState(true);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const requestIdRef = React.useRef(0);

  const hasNextPage =
    view === "browse"
      ? pagination.page < pagination.pages
      : recentPagination.page < recentPagination.pages;

  const loadBrowseProfiles = React.useCallback(
    async (page: number, mode: "replace" | "append" = "replace") => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setError("");

      if (mode === "append") {
        setIsAppending(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await fetchJson(buildSearchUrl(filters, page, sortBy));
        if (requestId !== requestIdRef.current) return;

        const nextProfiles = data.profiles ?? [];
        setProfiles((prev) => (mode === "append" ? mergeProfiles(prev, nextProfiles) : nextProfiles));
        setPagination(normalizePagination(data.pagination));
      } catch (loadError) {
        if (requestId !== requestIdRef.current) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load profiles.");
        if (mode === "replace") {
          setProfiles([]);
          setPagination(emptyPagination);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsAppending(false);
        }
      }
    },
    [filters, sortBy]
  );

  const loadRecentProfiles = React.useCallback(
    async (page: number, mode: "replace" | "append" = "replace") => {
      setError("");

      if (mode === "append") {
        setIsAppending(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await fetchJson(`/api/search/recently-viewed?page=${page}&limit=${PAGE_SIZE}`);
        const nextProfiles = data.profiles ?? [];
        setRecentProfiles((prev) => (mode === "append" ? mergeProfiles(prev, nextProfiles) : nextProfiles));
        setRecentPagination(normalizePagination(data.pagination));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load recently viewed profiles.");
        if (mode === "replace") {
          setRecentProfiles([]);
          setRecentPagination(emptyPagination);
        }
      } finally {
        setIsLoading(false);
        setIsAppending(false);
      }
    },
    []
  );

  React.useEffect(() => {
    void loadBrowseProfiles(1);
  }, [loadBrowseProfiles]);

  React.useEffect(() => {
    if (view === "recent") {
      void loadRecentProfiles(1);
    }
  }, [loadRecentProfiles, view]);

  React.useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !infiniteScroll || !hasNextPage || isLoading || isAppending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (view === "browse") {
          void loadBrowseProfiles(pagination.page + 1, "append");
        } else {
          void loadRecentProfiles(recentPagination.page + 1, "append");
        }
      },
      { rootMargin: "480px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    hasNextPage,
    infiniteScroll,
    isAppending,
    isLoading,
    loadBrowseProfiles,
    loadRecentProfiles,
    pagination.page,
    recentPagination.page,
    view,
  ]);

  const handleFilterChange = React.useCallback((nextFilters: SearchFilters) => {
    setFilters(nextFilters);
    if (nextFilters.sortBy) {
      setSortBy(nextFilters.sortBy);
    }
  }, []);

  const handleSearch = React.useCallback(() => {
    setView("browse");
    void loadBrowseProfiles(1);
  }, [loadBrowseProfiles]);

  const handleSortChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextSort = event.target.value;
      setSortBy(nextSort);
      setFilters((prev) => ({ ...prev, sortBy: nextSort }));
    },
    []
  );

  React.useEffect(() => {
    if (view === "browse") {
      void loadBrowseProfiles(1);
    }
  }, [loadBrowseProfiles, sortBy, view]);

  const toggleFavorite = React.useCallback(async (profileUserId: string) => {
    const update = (list: BrowseProfile[]) =>
      list.map((profile) =>
        profile.userId === profileUserId
          ? { ...profile, isFavorite: !profile.isFavorite }
          : profile
      );

    setProfiles(update);
    setRecentProfiles(update);

    try {
      const data = await fetchJson("/api/profile/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUserId }),
      });

      const confirmed = Boolean((data as { isFavorite?: boolean }).isFavorite);
      const confirmUpdate = (list: BrowseProfile[]) =>
        list.map((profile) =>
          profile.userId === profileUserId ? { ...profile, isFavorite: confirmed } : profile
        );
      setProfiles(confirmUpdate);
      setRecentProfiles(confirmUpdate);
    } catch (favoriteError) {
      setProfiles(update);
      setRecentProfiles(update);
      setError(favoriteError instanceof Error ? favoriteError.message : "Unable to update favorite.");
    }
  }, []);

  const recordProfileView = React.useCallback(async (profileUserId: string) => {
    try {
      await fetchJson("/api/search/recently-viewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUserId }),
      });
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.userId === profileUserId
            ? { ...profile, profileViews: (profile.profileViews ?? 0) + 1 }
            : profile
        )
      );
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : "Unable to record profile view.");
    }
  }, []);

  const currentProfiles = view === "browse" ? profiles : recentProfiles;
  const currentPagination = view === "browse" ? pagination : recentPagination;
  const currentEmptyTitle = view === "browse" ? "No profiles found" : "No recently viewed profiles";
  const currentEmptyDescription =
    view === "browse"
      ? "Try adjusting your filters, broadening your age range, or changing the sort order."
      : "Profiles you view from Browse Profiles will appear here.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Browse Profiles
              </Badge>
              <h1 className="text-2xl font-bold sm:text-3xl">Discover Matches</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Search live profiles from the database with filters, sorting, favorites, and recent view history.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 rounded-xl border border-border bg-card p-1">
                <Button
                  type="button"
                  variant={view === "browse" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("browse")}
                >
                  <Search className="h-4 w-4" />
                  Browse
                </Button>
                <Button
                  type="button"
                  variant={view === "recent" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("recent")}
                >
                  <Eye className="h-4 w-4" />
                  Recent
                </Button>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                <span className="text-muted-foreground">Infinite scroll</span>
                <input
                  type="checkbox"
                  checked={infiniteScroll}
                  onChange={(event) => setInfiniteScroll(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>
          </div>

          {view === "browse" ? (
            <SearchFiltersPanel
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              isLoading={isLoading}
              resultCount={pagination.total}
              initialFilters={{ ...filters, sortBy }}
            />
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading profiles..."
              ) : (
                <>
                  Showing <span className="font-medium text-foreground">{currentProfiles.length}</span> of{" "}
                  <span className="font-medium text-foreground">{formatCount(currentPagination.total)}</span> profiles
                </>
              )}
            </div>

            {view === "browse" ? (
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Sort profiles"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => void loadRecentProfiles(1)}>
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <section className="mt-6">
            {isLoading ? (
              <ProfileGridSkeleton />
            ) : currentProfiles.length > 0 ? (
              <ProfileGrid
                profiles={currentProfiles}
                onFavorite={toggleFavorite}
                onView={recordProfileView}
              />
            ) : (
              <EmptyState title={currentEmptyTitle} description={currentEmptyDescription} />
            )}

            {isAppending ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileSkeleton />
                <ProfileSkeleton />
                <ProfileSkeleton />
              </div>
            ) : null}

            <div ref={loadMoreRef} className="h-8" />

            <Pagination
              pagination={currentPagination}
              isLoading={isLoading || isAppending}
              onPageChange={(page) => {
                if (view === "browse") {
                  void loadBrowseProfiles(page);
                } else {
                  void loadRecentProfiles(page);
                }
              }}
              onLoadMore={() => {
                if (!hasNextPage) return;
                if (view === "browse") {
                  void loadBrowseProfiles(pagination.page + 1, "append");
                } else {
                  void loadRecentProfiles(recentPagination.page + 1, "append");
                }
              }}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function mergeProfiles(current: BrowseProfile[], next: BrowseProfile[]) {
  const seen = new Set(current.map((profile) => profile.userId));
  return [...current, ...next.filter((profile) => !seen.has(profile.userId))];
}

function ProfileGrid({
  profiles,
  onFavorite,
  onView,
}: {
  profiles: BrowseProfile[];
  onFavorite: (profileUserId: string) => void;
  onView: (profileUserId: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile, index) => (
        <ProfileCard
          key={profile.userId}
          profile={profile}
          index={index}
          onFavorite={onFavorite}
          onView={onView}
        />
      ))}
    </div>
  );
}

function ProfileCard({
  profile,
  index,
  onFavorite,
  onView,
}: {
  profile: BrowseProfile;
  index: number;
  onFavorite: (profileUserId: string) => void;
  onView: (profileUserId: string) => void;
}) {
  const name = profileName(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2) }}
    >
      <Card className="h-full overflow-hidden rounded-xl hover:shadow-lg">
        <div className="relative aspect-4/3 bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/30">
          {profile.imageUrl ? (
            <Image
              src={profile.imageUrl}
              alt={name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary/30">
              {initials(profile)}
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {profile.isPremium ? (
              <Badge variant="premium">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            ) : null}
            {profile.isVerified ? (
              <Badge variant="verified">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={profile.isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(profile.userId)}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
          >
            <Star
              className={
                profile.isFavorite
                  ? "h-5 w-5 fill-amber-400 text-amber-500"
                  : "h-5 w-5 text-muted-foreground"
              }
            />
          </button>
        </div>

        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold">
                  {name}
                  {profile.age ? `, ${profile.age}` : ""}
                </h2>
                {profile.isOnline ? (
                  <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-label="Online" />
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {profile.height || "Height not added"} · {profile.maritalStatus || "Status not added"}
              </p>
            </div>
            {profile.isOnline ? (
              <Badge variant="success" className="shrink-0">
                <Wifi className="mr-1 h-3 w-3" />
                Online
              </Badge>
            ) : null}
          </div>

          <div className="mb-4 space-y-2 text-sm text-muted-foreground">
            <ProfileMeta icon={MapPin} text={formatLocation(profile)} />
            <ProfileMeta icon={Briefcase} text={profile.profession || "Profession not added"} />
            <ProfileMeta icon={GraduationCap} text={profile.highestEducation || "Education not added"} />
          </div>

          {profile.aboutMe ? (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{profile.aboutMe}</p>
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2">
            {profile.religion ? <Badge variant="secondary">{profile.religion}</Badge> : null}
            {profile.caste ? <Badge variant="outline">{profile.caste}</Badge> : null}
            {profile.viewCount ? (
              <Badge variant="outline">
                <Eye className="mr-1 h-3 w-3" />
                Viewed {profile.viewCount}x
              </Badge>
            ) : profile.profileViews ? (
              <Badge variant="outline">
                <Eye className="mr-1 h-3 w-3" />
                {formatCount(profile.profileViews)} views
              </Badge>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button variant="gradient" size="sm" className="flex-1" onClick={() => onView(profile.userId)}>
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
            <Button
              variant={profile.isFavorite ? "premium" : "outline"}
              size="sm"
              onClick={() => onFavorite(profile.userId)}
            >
              <Heart className={profile.isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProfileMeta({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="line-clamp-1">{text}</span>
    </div>
  );
}

function Pagination({
  pagination,
  isLoading,
  onPageChange,
  onLoadMore,
}: {
  pagination: PaginationState;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
}) {
  if (pagination.pages <= 1) return null;

  const canGoBack = pagination.page > 1;
  const canGoNext = pagination.page < pagination.pages;

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
        <span className="font-medium text-foreground">{pagination.pages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!canGoBack || isLoading} onClick={() => onPageChange(pagination.page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!canGoNext || isLoading} onClick={() => onPageChange(pagination.page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" disabled={!canGoNext || isLoading} onClick={onLoadMore}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Load More
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ProfileGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProfileSkeleton key={index} />
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}
