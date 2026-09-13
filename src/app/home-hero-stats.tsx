"use client";

import * as React from "react";
import { Crown, Users } from "lucide-react";

interface HomeStatsResponse {
  stats?: {
    activeUsers?: number;
    premiumProfiles?: number;
  };
}

function formatCount(value: number | undefined): string {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function HomeHeroStats() {
  const [stats, setStats] = React.useState<HomeStatsResponse["stats"]>();

  React.useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const response = await fetch("/api/about/stats", { cache: "no-store" });
        if (!response.ok) return;
        const result = (await response.json()) as HomeStatsResponse;
        if (active) setStats(result.stats);
      } catch {
      }
    };

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mt-5 grid max-w-md grid-cols-2 gap-3" aria-label="Community statistics">
      <div className="flex items-center gap-3 rounded-xl border border-[#d6e8e4] bg-white/65 px-3 py-2.5">
        <Users className="h-4 w-4 shrink-0 text-[#61b69e]" />
        <div>
          <strong className="block text-lg leading-none text-[#263b3a]">{formatCount(stats?.activeUsers)}</strong>
          <span className="text-xs text-[#607572]">active users</span>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-[#efc5bf] bg-white/65 px-3 py-2.5">
        <Crown className="h-4 w-4 shrink-0 text-[#e8897f]" />
        <div>
          <strong className="block text-lg leading-none text-[#263b3a]">{formatCount(stats?.premiumProfiles)}</strong>
          <span className="text-xs text-[#607572]">premium users</span>
        </div>
      </div>
    </div>
  );
}
