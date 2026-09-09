"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function HomeDashboardAction() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Link
        href="/register"
        className="inline-flex items-center gap-3 rounded-xl bg-[#e8897f] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e8897f]/25 transition-transform hover:-translate-y-0.5"
      >
        Create your profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-xl border border-[#9fcfc7] bg-background/80 px-5 py-3 text-sm font-semibold text-[#486866] shadow-sm transition hover:-translate-y-0.5 hover:bg-background"
    >
      <LayoutDashboard className="h-4 w-4" />
      Dashboard
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
