"use client";

import { useEffect, useState } from "react";
import { Crown, UserRound, UsersRound } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

type CommunityStatsData = {
  activeUsers: number;
  maleUsers: number;
  femaleUsers: number;
  premiumUsers: number;
};

const statItems: Array<{
  label: string;
  key: keyof CommunityStatsData;
  icon: typeof UsersRound;
  color: string;
  number: string;
  background: string;
  border: string;
  glow: string;
}> = [
  { label: "Active Users", key: "activeUsers", icon: UsersRound, color: "text-emerald-700 dark:text-emerald-300", number: "text-[#075b53] dark:text-emerald-300", background: "from-[#e7fff5] to-[#d4f5f2]", border: "border-[#c4f2e7]", glow: "bg-[#b8f1df]/50" },
  { label: "Men", key: "maleUsers", icon: UserRound, color: "text-blue-600 dark:text-blue-300", number: "text-[#1c5cce] dark:text-blue-300", background: "from-[#f0f6ff] to-[#e1edff]", border: "border-[#d5e5ff]", glow: "bg-[#c6dcff]/45" },
  { label: "Women", key: "femaleUsers", icon: UserRound, color: "text-pink-600 dark:text-pink-300", number: "text-[#db1458] dark:text-pink-300", background: "from-[#fff1f6] to-[#ffe2ed]", border: "border-[#fbd7e5]", glow: "bg-[#ffc8dc]/45" },
  { label: "Premium Users", key: "premiumUsers", icon: Crown, color: "text-amber-600 dark:text-amber-300", number: "text-[#a66500] dark:text-amber-300", background: "from-[#fff9e8] to-[#fff0c6]", border: "border-[#f7e9c8]", glow: "bg-[#ffe6a0]/50" },
];

function FemaleProfileIcon() {
  return (
    <svg viewBox="5 3 14 19" fill="none" aria-hidden="true" className="h-7 w-7">
      <path d="M7.2 10.3V8.8a4.8 4.8 0 0 1 9.6 0v1.5" />
      <path d="M7.2 8.7c.4 1.2 1.2 1.8 2.5 1.8.8 0 1.6-.4 2.3-1.1.7.7 1.5 1.1 2.3 1.1 1.3 0 2.1-.6 2.5-1.8" />
      <path d="M7.2 10.2v2.1a4.8 4.8 0 0 0 9.6 0v-2.1M7.2 10.5l-1.1 4a2 2 0 0 0 2 2.5M16.8 10.5l1.1 4a2 2 0 0 1-2 2.5M8.7 21v-1.1a3.3 3.3 0 0 1 3.3-3.3 3.3 3.3 0 0 1 3.3 3.3V21" />
    </svg>
  );
}

export function CommunityStats() {
  const { language, translateText } = useLanguage();
  const [stats, setStats] = useState<CommunityStatsData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/about/stats", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Community statistics request failed: ${response.status}`);
        }

        const data = (await response.json()) as { stats?: CommunityStatsData };
        if (active && data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Unable to load community statistics.", error);
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  const formatCount = (value: number | undefined) => (
    typeof value === "number"
      ? new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en").format(value)
      : "..."
  );

  return (
    <section aria-label={translateText("Community statistics")} className="community-stats-section relative isolate overflow-hidden border-y border-white/80 bg-[linear-gradient(110deg,#f8fcff_0%,#ffffff_48%,#fbf9ff_100%)] px-5 py-9 sm:px-8 lg:py-12">
      <div className="pointer-events-none absolute -left-16 top-1/2 -z-10 h-48 w-72 -translate-y-1/2 rounded-full bg-[#c8f4f3]/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-72 rounded-full bg-[#f0e4ff]/45 blur-3xl" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {statItems.map(({ label, key, icon: Icon, color, number, background, border, glow }) => (
          <div key={key} className={`community-stats-card relative flex min-h-30 items-center gap-4 overflow-hidden rounded-2xl border bg-linear-to-br ${background} ${border} px-5 py-4 shadow-[0_12px_30px_rgba(56,93,126,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(56,93,126,0.12)] sm:gap-5 sm:px-6`}>
            <span className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full ${glow} blur-2xl`} />
            <span className={`community-stats-icon relative inline-flex h-18 w-18 shrink-0 items-center justify-center rounded-full border-4 border-white/80 bg-white/55 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75),0_5px_14px_rgba(80,110,130,0.08)] ${color}`}>
              {key === "femaleUsers" ? (
                <span className="[&_svg]:stroke-current [&_svg]:stroke-[1.7]"><FemaleProfileIcon /></span>
              ) : (
                <Icon className="h-7 w-7 stroke-[1.8]" aria-hidden="true" />
              )}
            </span>
            <div className="relative min-w-0">
              <div className={`text-3xl font-bold leading-none tracking-tight sm:text-4xl ${number}`}>
                {stats ? formatCount(stats[key]) : "..."}
              </div>
              <div className="mt-2 text-sm font-medium leading-snug text-slate-600 dark:text-slate-300 sm:text-base">{translateText(label)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
