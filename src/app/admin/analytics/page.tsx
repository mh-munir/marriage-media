"use client";

import * as React from "react";
import { BarChart3, Users, BadgeDollarSign, ShieldCheck, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Analytics { overview?: Record<string, number>; reports?: { daily?: Array<{ date: string; registrations: number; revenue: number }> }; }
export default function AdminAnalyticsPage() {
  const [data, setData] = React.useState<Analytics | null>(null);
  const [error, setError] = React.useState("");
  React.useEffect(() => { fetch("/api/admin/analytics?period=30", { credentials: "include" }).then(async (response) => { const result = await response.json(); setData(result); setError(response.ok ? "" : result.error || "Could not load analytics"); }); }, []);
  const overview = data?.overview;
  const cards = [{ label: "Total members", value: overview?.totalUsers, icon: Users }, { label: "30-day revenue", value: overview?.totalRevenue === undefined ? undefined : `৳${overview.totalRevenue.toLocaleString()}`, icon: BadgeDollarSign }, { label: "Verified profiles", value: overview?.verifiedUsers, icon: ShieldCheck }, { label: "Messages · 30 days", value: overview?.sentMessages, icon: MessageCircle }];
  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Insights & tools</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Platform analytics</h2><p className="mt-2 text-sm text-slate-500">A 30-day view of growth, trust, conversations, and revenue.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center gap-4 p-5"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><Icon className="h-5 w-5" /></span><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value ?? "--"}</p></div></CardContent></Card>)}</section><Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-600" />Daily registrations</CardTitle></CardHeader><CardContent><div className="flex h-56 items-end gap-1">{(data?.reports?.daily || []).map((item) => { const max = Math.max(...(data?.reports?.daily || []).map((entry) => entry.registrations), 1); return <div key={item.date} className="flex-1 rounded-t bg-emerald-400" style={{ height: `${Math.max((item.registrations / max) * 100, 4)}%` }} title={`${item.date}: ${item.registrations}`} />; })}</div>{!data?.reports?.daily?.length ? <p className="py-16 text-center text-sm text-slate-500">Analytics data will appear after member activity.</p> : null}</CardContent></Card></div>;
}
