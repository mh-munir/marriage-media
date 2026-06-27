import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Crown,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  LocalBusinessSchema,
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebPageSchema,
  WebsiteSchema,
} from "@/components/seo/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomeData, type HomeData, type HomeProfile, type HomeSuccessStory } from "@/lib/home-data";
import { PAGE_SEO, SITE_CONFIG } from "@/lib/seo-constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const page = PAGE_SEO.home;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { stats } = await getHomeData();
    const activeProfiles = formatCount(stats.activeProfiles);
    const verifiedProfiles = formatCount(stats.verifiedProfiles);

    return {
      title: {
        absolute: page.title,
      },
      description: `${page.description} Browse ${activeProfiles} active profiles and ${verifiedProfiles} verified members.`,
      keywords: page.keywords,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        type: "website",
        url: "/",
        siteName: SITE_CONFIG.name,
        title: page.title,
        description: page.description,
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: `${SITE_CONFIG.name} matrimony platform`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: page.title,
        description: page.description,
        images: ["/twitter-image"],
      },
    };
  } catch {
    return {
      title: {
        absolute: page.title,
      },
      description: page.description,
      keywords: page.keywords,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        type: "website",
        url: "/",
        siteName: SITE_CONFIG.name,
        title: page.title,
        description: page.description,
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: `${SITE_CONFIG.name} matrimony platform`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: page.title,
        description: page.description,
        images: ["/twitter-image"],
      },
    };
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />
      <SoftwareApplicationSchema />
      <WebPageSchema
        title={page.title}
        description={page.description}
        url={SITE_CONFIG.url}
        breadcrumbs={[{ name: "Home", url: SITE_CONFIG.url }]}
      />
      <Header />
      <main id="main-content">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function HomeContent() {
  const result = await getSafeHomeData();

  if (!result.ok) {
    return <HomeErrorState error={result.error} />;
  }

  const data = result.data;

  return (
    <>
      <HeroSection data={data} />
      <StatsSection stats={data.stats} />
      <ProfileSection
        badge="Featured Profiles"
        title="Profiles Getting the Most Attention"
        description="Boosted members are selected directly from live visible profiles."
        profiles={data.featuredProfiles}
        emptyMessage="No featured profiles are available right now."
        icon={Sparkles}
      />
      <ProfileSection
        badge="Premium Members"
        title="Premium Members Ready to Connect"
        description="Active premium members with current subscriptions from the database."
        profiles={data.premiumMembers}
        emptyMessage="No premium members are available right now."
        icon={Crown}
        muted
      />
      <SuccessStoriesSection stories={data.successStories} />
      <ProfileSection
        badge="Recent Members"
        title="Recently Joined Members"
        description="Fresh visible profiles, sorted by newest registration."
        profiles={data.recentMembers}
        emptyMessage="No recent members are available right now."
        icon={Users}
      />
      <FinalCta stats={data.stats} />
    </>
  );
}

async function getSafeHomeData(): Promise<
  { ok: true; data: HomeData } | { ok: false; error: unknown }
> {
  try {
    const data = await getHomeData();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

function HeroSection({ data }: { data: HomeData }) {
  const activeProfiles = formatCount(data.stats.activeProfiles);
  const verifiedProfiles = formatCount(data.stats.verifiedProfiles);

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div className="max-w-3xl text-center lg:text-left">
          <Badge variant="premium" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {activeProfiles} Active Profiles
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Perfect{" "}
            <span className="bg-linear-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Life Partner
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
            Bangladesh&apos;s trusted matrimony platform with {verifiedProfiles} verified
            members, live premium profiles, and real success stories from the database.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Button variant="gradient" size="xl" asChild className="w-full sm:w-auto">
              <Link href="/register">
                Join {activeProfiles} Members
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <Link href="/dashboard/search">Browse Profiles</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6 lg:justify-start">
            <TrustIndicator label={`${verifiedProfiles} verified profiles`} />
            <TrustIndicator label={`${formatCount(data.stats.premiumMembers)} premium members`} />
            <TrustIndicator label={`${formatCount(data.stats.acceptedMatches)} accepted matches`} />
          </div>
        </div>

        <HeroProfilePreview profiles={data.featuredProfiles} />
      </div>
    </section>
  );
}

function TrustIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle className="h-4 w-4 text-emerald-500" />
      {label}
    </div>
  );
}

function HeroProfilePreview({ profiles }: { profiles: HomeProfile[] }) {
  const previewProfiles = profiles.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Featured now</p>
            <p className="text-xs text-muted-foreground">Live boosted profiles</p>
          </div>
          <Badge variant="secondary">{previewProfiles.length} shown</Badge>
        </div>
        <div className="space-y-3">
          {previewProfiles.length > 0 ? (
            previewProfiles.map((profile) => <CompactProfileCard key={profile.id} profile={profile} />)
          ) : (
            <EmptyState message="Featured profiles will appear here once members boost their profile." />
          )}
        </div>
      </div>
    </div>
  );
}

function StatsSection({ stats }: { stats: HomeData["stats"] }) {
  const statCards: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "Active Profiles", value: stats.activeProfiles, icon: Users },
    { label: "Accepted Matches", value: stats.acceptedMatches, icon: Heart },
    { label: "Verified Profiles", value: stats.verifiedProfiles, icon: Shield },
    { label: "Success Stories", value: stats.successStories, icon: Star },
  ];

  return (
    <section className="border-y border-border bg-card/50 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold sm:text-3xl">{formatCount(stat.value)}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileSection({
  badge,
  title,
  description,
  profiles,
  emptyMessage,
  icon: Icon,
  muted = false,
}: {
  badge: string;
  title: string;
  description: string;
  profiles: HomeProfile[];
  emptyMessage: string;
  icon: LucideIcon;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "border-y border-border bg-card/50 py-20" : "py-20"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader badge={badge} title={title} description={description} icon={Icon} />
        {profiles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  badge,
  title,
  description,
  icon: Icon,
}: {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <Badge variant="secondary" className="mb-4">
        <Icon className="mr-1 h-3.5 w-3.5" />
        {badge}
      </Badge>
      <h2 className="mb-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ProfileCard({ profile }: { profile: HomeProfile }) {
  return (
    <Card className="h-full overflow-hidden rounded-xl hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/30">
        {profile.imageUrl ? (
          <Image
            src={profile.imageUrl}
            alt={profile.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary/30">
            {profile.name.charAt(0)}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {profile.isVerified ? <Badge variant="verified">Verified</Badge> : null}
          {profile.isPremium ? <Badge variant="premium">Premium</Badge> : null}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold">
              {profile.name}
              {profile.age ? `, ${profile.age}` : ""}
            </h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{profile.profession}</p>
          </div>
          {profile.isProfileBoosted ? <Sparkles className="h-5 w-5 shrink-0 text-amber-500" /> : null}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <ProfileMeta icon={MapPin} text={profile.location} />
          <ProfileMeta icon={Shield} text={profile.religion} />
          <ProfileMeta icon={Calendar} text={profile.maritalStatus} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>{profile.education}</span>
          <span>{formatCount(profile.profileViews)} views</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactProfileCard({ profile }: { profile: HomeProfile }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/80 p-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10">
        {profile.imageUrl ? (
          <Image
            src={profile.imageUrl}
            alt={profile.name}
            width={48}
            height={48}
            sizes="48px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-semibold text-primary">
            {profile.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {profile.name}
          {profile.age ? `, ${profile.age}` : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">{profile.profession}</p>
      </div>
      {profile.isVerified ? <Shield className="h-4 w-4 shrink-0 text-blue-500" /> : null}
    </div>
  );
}

function ProfileMeta({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="line-clamp-1">{text}</span>
    </div>
  );
}

function SuccessStoriesSection({ stories }: { stories: HomeSuccessStory[] }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Success Stories"
          title="Real Stories From Published Updates"
          description="Published success-story posts are pulled directly from the content database."
          icon={Heart}
        />
        {stories.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {stories.map((story) => (
              <SuccessStoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <EmptyState message="No published success stories are available right now." />
        )}
      </div>
    </section>
  );
}

function SuccessStoryCard({ story }: { story: HomeSuccessStory }) {
  const href = story.slug ? `/blog/${story.slug}` : "/success-stories";

  return (
    <Card className="h-full overflow-hidden rounded-xl hover:shadow-lg">
      <div className="aspect-[16/9] bg-linear-to-br from-rose-100 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/30">
        {story.imageUrl ? (
          <Image
            src={story.imageUrl}
            alt={story.title}
            width={640}
            height={360}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Heart className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <Badge variant="secondary" className="mb-3">
          {story.category}
        </Badge>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{story.title}</h3>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{story.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{story.publishedAt ? formatMonthYear(story.publishedAt) : "Recently published"}</span>
          <Link href={href} className="font-medium text-primary hover:underline">
            Read story
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FinalCta({ stats }: { stats: HomeData["stats"] }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-500 via-pink-500 to-purple-600 p-8 text-center sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Join {formatCount(stats.activeProfiles)} Active Profiles
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/85">
              Start with a free account and meet members from {formatCount(stats.recentMembers)}
              recent profiles, {formatCount(stats.premiumMembers)} premium members, and real verified connections.
            </p>
            <Button variant="secondary" size="xl" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <>
      <section className="pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="space-y-6">
            <Skeleton className="h-8 w-52 rounded-full" />
            <Skeleton className="h-14 w-full max-w-2xl" />
            <Skeleton className="h-14 w-5/6" />
            <Skeleton className="h-24 w-full max-w-xl" />
            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-14 w-full sm:w-52" />
              <Skeleton className="h-14 w-full sm:w-44" />
            </div>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <Skeleton className="mb-4 h-8 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-card/50 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mx-auto mb-10 h-24 w-full max-w-2xl" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileCardSkeleton />
            <ProfileCardSkeleton />
            <ProfileCardSkeleton />
          </div>
        </div>
      </section>
    </>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

function HomeErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "The home page data could not be loaded.";

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="mb-3 text-2xl font-bold">Home content is unavailable</h1>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMonthYear(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
