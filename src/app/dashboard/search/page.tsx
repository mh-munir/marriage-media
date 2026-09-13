"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/profile-card";
import { useAuthStore } from "@/stores/auth-store";

type BrowseProfile = {
  _id: string;
  userId: string;
  publicId?: string;
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
  matchPercentage: number;
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

type BasicSearchFilters = {
  education: string;
  location: string;
  ageMin: string;
  ageMax: string;
  premiumOnly: boolean;
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

function buildSearchUrl(page: number, sortBy: string, filters: BasicSearchFilters) {
  const params = new URLSearchParams();

  if (filters.education) params.set("education", filters.education);
  if (filters.location) params.set("location", filters.location);
  if (filters.ageMin) params.set("ageMin", filters.ageMin);
  if (filters.ageMax) params.set("ageMax", filters.ageMax);
  if (filters.premiumOnly) params.set("premiumOnly", "true");
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
  const router = useRouter();
  const { user } = useAuthStore();
  const [view, setView] = React.useState<"browse" | "recent">("browse");
  const [sortBy, setSortBy] = React.useState("relevance");
  const [filters, setFilters] = React.useState<BasicSearchFilters>({
    education: "",
    location: "",
    ageMin: "",
    ageMax: "",
    premiumOnly: false,
  });
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
        const data = await fetchJson(buildSearchUrl(page, sortBy, filters));
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
    if (view === "recent") {
      queueMicrotask(() => void loadRecentProfiles(1));
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

  const handleSortChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextSort = event.target.value;
      setSortBy(nextSort);
    },
    []
  );

  React.useEffect(() => {
    if (view === "browse") {
      queueMicrotask(() => void loadBrowseProfiles(1));
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
        router.push(`/dashboard/profile/${profileUserId}`);
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : "Unable to record profile view.");
    }
    }, [router]);

  const openProfileMessages = React.useCallback(async (profileUserId: string) => {
    if (!profileUserId) return;

    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: profileUserId }),
      });
      const result = await response.json() as { conversationId?: string; error?: string };
      if (!response.ok || !result.conversationId) throw new Error(result.error || "Unable to open messages.");
      router.push(`/dashboard/messages?conversationId=${encodeURIComponent(result.conversationId)}`);
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Unable to open messages.");
    }
  }, [router]);

  const currentProfiles = view === "browse" ? profiles : recentProfiles;
  const currentPagination = view === "browse" ? pagination : recentPagination;
  const currentEmptyTitle = view === "browse" ? "No profiles found" : "No recently viewed profiles";
  const currentEmptyDescription =
    view === "browse"
      ? "There are no profiles available right now."
      : "Profiles you view from Browse Profiles will appear here.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-30 pb-12">
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
                Browse live profiles from the database and view your recent profile history.
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

          <div className="mb-6 grid gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={filters.education}
              onChange={(event) => setFilters((current) => ({ ...current, education: event.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              aria-label="Filter by education"
            >
              <option value="">All Education</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Higher Secondary">Higher Secondary</option>
              <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
              <option value="Master's Degree">Master&apos;s Degree</option>
              <option value="PhD">PhD</option>
            </select>
            <input
              value={filters.location}
              onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              aria-label="Filter by location"
            />
            <input
              value={filters.ageMin}
              onChange={(event) => setFilters((current) => ({ ...current, ageMin: event.target.value }))}
              type="number"
              min="18"
              max="80"
              placeholder="Min age"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              aria-label="Minimum age"
            />
            <input
              value={filters.ageMax}
              onChange={(event) => setFilters((current) => ({ ...current, ageMax: event.target.value }))}
              type="number"
              min="18"
              max="80"
              placeholder="Max age"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              aria-label="Maximum age"
            />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm">
              <input
                type="checkbox"
                checked={filters.premiumOnly}
                onChange={(event) => setFilters((current) => ({ ...current, premiumOnly: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Premium only
            </label>
          </div>

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
                currentUserIsPremium={Boolean(user?.isPremium)}
                onFavorite={toggleFavorite}
                onMessage={openProfileMessages}
                onView={recordProfileView}
              />
            ) : (
              <EmptyState title={currentEmptyTitle} description={currentEmptyDescription} />
            )}

            {isAppending ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  onMessage,
  onView,
  currentUserIsPremium = false,
}: {
  profiles: BrowseProfile[];
  onFavorite: (profileUserId: string) => void;
  onMessage: (profileUserId: string) => void;
  onView: (profileUserId: string) => void;
  currentUserIsPremium?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {profiles.map((profile, index) => (
        <ProfileCard
          key={profile.userId}
          profile={profile}
          index={index}
          currentUserIsPremium={currentUserIsPremium}
          onFavorite={onFavorite}
          onMessage={onMessage}
          onView={onView}
        />
      ))}
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
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
