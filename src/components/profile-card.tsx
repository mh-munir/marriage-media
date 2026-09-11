"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, Eye, GraduationCap, MessageCircle, Star, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ProfileCardData = {
  userId: string;
  publicId?: string;
  firstName: string;
  lastName: string;
  age: number | null;
  profession: string;
  division: string;
  district: string;
  area: string;
  imageUrl: string | null;
  isPremium: boolean;
  isVerified: boolean;
  isFavorite: boolean;
  isOnline: boolean;
  profileViews?: number;
  createdAt?: string | null;
  matchPercentage: number;
};

function profileName(profile: ProfileCardData): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Marriage Media Member";
}

function initials(profile: ProfileCardData): string {
  return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "MM";
}

function formatLocation(profile: ProfileCardData): string {
  return [profile.area, profile.district, profile.division].filter(Boolean).join(", ") || "Location not added";
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ProfileCard({
  profile,
  index = 0,
  onFavorite,
  onMessage,
  onView,
}: {
  profile: ProfileCardData;
  index?: number;
  onFavorite: (profileUserId: string) => void;
  onMessage?: (profileUserId: string) => void;
  onView: (profileUserId: string) => void;
}) {
  const name = profileName(profile);
  const displayName = profile.publicId || "ID pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2) }}
      role="link"
      tabIndex={0}
      onClick={() => {
        if (profile.userId) onView(profile.userId);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (profile.userId) onView(profile.userId);
        }
      }}
      className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:border-border dark:bg-card">
        <div className="relative flex min-h-36 items-center gap-3 overflow-hidden p-3 sm:gap-5 sm:p-5">
          <div className="pointer-events-none absolute -left-10 -top-14 h-36 w-36 rounded-full bg-blue-100/60 blur-2xl dark:bg-blue-950/30" />
          <div className="relative z-10 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-blue-100 to-sky-100 ring-4 ring-blue-100 shadow-sm dark:from-blue-950/40 dark:to-sky-950/30 dark:ring-blue-950/60 sm:h-24 sm:w-24">
            {profile.imageUrl ? (
              <Image src={profile.imageUrl} alt={name} fill sizes="96px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary/40">
                {initials(profile)}
              </div>
            )}
            {profile.isOnline ? <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-3 border-white bg-emerald-500 dark:border-card" aria-label="Online" /> : null}
          </div>
          <div className="relative z-10 min-w-0 flex-1 self-stretch py-1 sm:py-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-2xl">{displayName}</h2>
              {profile.age ? <Badge variant="secondary" className="shrink-0 gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><CalendarDays className="h-3.5 w-3.5" />{profile.age} yrs</Badge> : null}
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500 dark:text-muted-foreground sm:items-center sm:truncate sm:text-base">
              <GraduationCap className="h-4 w-4 shrink-0 text-slate-500 sm:h-5 sm:w-5" />
              {profile.profession || "Profile shared"} · {formatLocation(profile)}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-muted-foreground sm:text-sm">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{formatCount(profile.profileViews ?? 0)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100 dark:text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  if (profile.userId) onMessage?.(profile.userId);
                }}
                aria-label={`Message ${name}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3 dark:border-border sm:gap-4 sm:pl-5">
            <div className="flex flex-col items-center rounded-xl bg-emerald-50 px-2.5 py-1.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 sm:rounded-2xl sm:px-4 sm:py-2">
              <div className="flex items-center gap-1 text-lg font-bold sm:text-2xl"><Target className="h-5 w-5 sm:h-6 sm:w-6" />{profile.matchPercentage}%</div>
              <div className="text-[10px] sm:text-xs">match</div>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-3">
              <button
                type="button"
                aria-label={profile.isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={(event) => {
                  event.stopPropagation();
                  if (profile.userId) onFavorite(profile.userId);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 sm:h-10 sm:w-10"
              >
                <Star className={profile.isFavorite ? "h-5 w-5 fill-blue-500 text-blue-500 sm:h-6 sm:w-6" : "h-5 w-5 sm:h-6 sm:w-6"} />
              </button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 sm:h-10 sm:w-10" onClick={(event) => { event.stopPropagation(); if (profile.userId) onView(profile.userId); }} aria-label={`View ${name}`}><ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" /></Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
