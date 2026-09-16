"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronRight, Eye, MapPin, MessageCircle, Star, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { useAuthStore } from "@/stores/auth-store";

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

function formatLocation(profile: ProfileCardData, translateText: (text: string) => string): string {
  const locationParts = [profile.area, profile.district, profile.division].filter(Boolean).map((value) => translateText(value ?? ""));
  return locationParts.length ? locationParts.join(", ") : translateText("Location not added");
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function ProfileCard({ profile, index = 0, onFavorite, onMessage, onView, currentUserIsPremium = false }: {
  profile: ProfileCardData;
  index?: number;
  onFavorite: (profileUserId: string) => void;
  onMessage?: (profileUserId: string) => void;
  onView: (profileUserId: string) => void;
  currentUserIsPremium?: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const { translateText } = useLanguage();
  const isPremiumUser = Boolean(user?.isPremium);
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || translateText("Marriage Media Member");
  const displayName = currentUserIsPremium ? name : (profile.publicId || translateText("ID pending"));
  const shouldShowProfileImage = Boolean(profile.imageUrl);
  const translatedProfession = profile.profession ? translateText(profile.profession) : translateText("Profile shared");
  const translatedLocation = formatLocation(profile, translateText);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }}
      role="link" tabIndex={0}
      onClick={() => { if (profile.userId) onView(profile.userId); }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (profile.userId) onView(profile.userId); } }}
      className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden rounded-lg border border-[#e9d6d1] bg-white shadow-[0_18px_35px_rgba(88,111,109,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(88,111,109,0.16)] dark:border-border dark:bg-card">
        <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-t-lg bg-linear-to-br from-[#f8e9e7] via-[#fdf7f5] to-[#e5f2ef]">
          {shouldShowProfileImage ? (
            <Image
              src={profile.imageUrl ?? "/images/placeholder-profile.jpg"}
              alt={`${name} profile photo`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-center text-[#587875]">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-sm"><UserRound className="h-7 w-7 text-[#df7890]" /></span>
              <span className="mt-3 text-sm font-semibold">{translateText("Profile photo private")}</span>
              <span className="mt-1 px-5 text-xs leading-4 text-[#78908c]">{translateText("Photos are hidden for privacy.")}</span>
            </div>
          )}
          {profile.isVerified ? <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#dff8ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#235945] shadow-sm"><BadgeCheck className="h-3.5 w-3.5" />{translateText("Verified")}</span> : null}
          {profile.isPremium ? <Badge variant="premium" title="Premium subscriber" className="absolute right-3 top-3 z-20 gap-1 px-2 py-1 text-[10px]"><BadgeCheck className="h-3.5 w-3.5" />{translateText("Premium")}</Badge> : null}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-[#355350] dark:text-foreground">{displayName}</h2><p className="mt-1 text-sm text-[#6f8580]">{profile.age ? `${profile.age} ${translateText("yrs")} · ${translatedProfession}` : translatedProfession}</p></div>
            {profile.isOnline ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-label="Online" /> : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6f8580]"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#e8897f]" /><span className="truncate">{translatedLocation}</span></div>
          <div className="flex items-center justify-between gap-3 border-t border-[#f0d6d1] pt-3">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6f8580]"><Eye className="h-3.5 w-3.5 text-[#61b69e]" />{formatCount(profile.profileViews ?? 0)} {translateText("views")}</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label={profile.isFavorite ? "Remove from favorites" : "Add to favorites"} onClick={(event) => { event.stopPropagation(); if (profile.userId) onFavorite(profile.userId); }} className="flex h-8 w-8 items-center justify-center rounded-full text-[#df7890] transition hover:bg-[#fef0ef]"><Star className={profile.isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} /></button>
              {isPremiumUser ? <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#587875] hover:bg-[#eff8f7]" onClick={(event) => { event.stopPropagation(); if (profile.userId) onMessage?.(profile.userId); }} aria-label={`Message ${name}`}><MessageCircle className="h-4 w-4" /></Button> : null}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#355350] hover:bg-[#eff8f7]" onClick={(event) => { event.stopPropagation(); if (profile.userId) onView(profile.userId); }} aria-label={`View ${name}`}><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
