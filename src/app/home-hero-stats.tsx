"use client";

import { Crown, Users } from "lucide-react";

interface HomeHeroStatsProps {
  stats?: {
    activeProfiles?: number;
    premiumMembers?: number;
  };
}

function formatCount(value: number | undefined): string {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function HomeHeroStats({ stats }: HomeHeroStatsProps) {
  return (
    <div className="mt-6 grid max-w-md grid-cols-2 gap-3" aria-label="Community statistics">
      <div className="group relative overflow-hidden rounded-2xl border border-[#b9dcd5] bg-white/80 p-3.5 shadow-[0_10px_28px_rgba(54,92,86,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(54,92,86,0.14)] dark:border-[#2f504b] dark:bg-[#211e1c]/85">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#61b69e] to-transparent" />
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e4f5f0] text-[#329b82] dark:bg-[#173d35] dark:text-[#74d4bc]">
            <Users className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <strong className="block text-xl leading-none tracking-tight text-[#263b3a] dark:text-[#f8f3ef]">{formatCount(stats?.activeProfiles)}</strong>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#607572] dark:text-[#bcb4ae]">active users</span>
          </div>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-2xl border border-[#efc5bf] bg-white/80 p-3.5 shadow-[0_10px_28px_rgba(112,71,63,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(112,71,63,0.14)] dark:border-[#5b3834] dark:bg-[#211e1c]/85">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#e8897f] to-transparent" />
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0ed] text-[#d96f65] dark:bg-[#482724] dark:text-[#f4a097]">
            <Crown className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <strong className="block text-xl leading-none tracking-tight text-[#263b3a] dark:text-[#f8f3ef]">{formatCount(stats?.premiumMembers)}</strong>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#607572] dark:text-[#bcb4ae]">premium users</span>
          </div>
        </div>
      </div>
    </div>
  );
}
