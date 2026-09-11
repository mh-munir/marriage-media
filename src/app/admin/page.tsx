"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, CheckCircle2, DollarSign, FileCheck2, ImageIcon, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Overview = {
  totalUsers: number;
  newUsers: number;
  registrationGrowthRate: number;
  totalProfiles: number;
  premiumUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  totalRevenue: number;
  revenueGrowthRate: number;
  pendingVerifications: number;
  fraudAlerts: number;
  activeConversations: number;
};
type DashboardData = { overview?: Overview; reports?: { daily?: Array<{ date: string; registrations: number; revenue: number }> } };
type PendingPhotos = { pendingPhotos?: Array<{ userId: string; username: string; photo: { url: string; publicId: string } }> };
type VerificationData = { verifications?: unknown[] };
const fetcher = (url: string) => fetch(url).then((response) => response.json());

export default function AdminDashboardPage() {
  const { data, error } = useSWR<DashboardData>("/api/admin/analytics?period=30", fetcher);
  const { data: photos } = useSWR<PendingPhotos>("/api/admin/photos/pending", fetcher);
  const { data: verifications } = useSWR<VerificationData>("/api/admin/verifications?status=pending&limit=1", fetcher);
  const overview = data?.overview;
  const pendingPhotos = photos?.pendingPhotos?.length ?? 0;
  const pendingVerifications = overview?.pendingVerifications ?? verifications?.verifications?.length ?? 0;
  const stats = [
    { label: "Total users", value: overview?.totalUsers, detail: `+${overview?.newUsers ?? 0} this month`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active profiles", value: overview?.activeUsers, detail: `${overview?.totalProfiles ?? 0} profiles total`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Revenue · 30 days", value: overview ? `৳${overview.totalRevenue.toLocaleString()}` : undefined, detail: `${overview?.revenueGrowthRate ?? 0}% vs previous period`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Trust & safety", value: overview?.verifiedUsers, detail: `${overview?.fraudAlerts ?? 0} fraud alerts`, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
  ];
  return (
    <div className="mx-auto max-w-375 space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-sm font-semibold text-emerald-600">Tuesday, September 10, 2026</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Operations overview</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">A live pulse on members, trust, revenue and the queues that need your attention.</p></div><div className="flex gap-3"><Button variant="outline" asChild><Link href="/admin/security"><ShieldAlert className="mr-2 h-4 w-4" />Security center</Link></Button><Button asChild className="bg-[#0d1b2a] hover:bg-slate-800"><Link href="/admin/users"><Users className="mr-2 h-4 w-4" />Manage users</Link></Button></div></section>
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Analytics could not be loaded. Check admin access and try again.</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, detail, icon: Icon, color, bg }) => <Card key={label} className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold">{value === undefined ? "--" : value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div><span className={`rounded-xl p-3 ${bg} ${color}`}><Icon className="h-5 w-5" /></span></div></CardContent></Card>)}</section>
      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Attention queue</CardTitle><p className="mt-1 text-sm text-slate-500">Small actions that keep the community healthy.</p></div><Badge variant="secondary">Live</Badge></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><QueueCard href="/admin/photos" label="Photos to review" value={pendingPhotos} icon={ImageIcon} tone="blue" /><QueueCard href="/admin/verification" label="Verifications" value={pendingVerifications} icon={FileCheck2} tone="violet" /><QueueCard href="/admin/security" label="Fraud alerts" value={overview?.fraudAlerts ?? 0} icon={ShieldAlert} tone="amber" /></CardContent></Card><Card className="rounded-2xl border-slate-200/80 bg-[#0d1b2a] text-white shadow-sm"><CardHeader><CardTitle className="text-white">Platform health</CardTitle><p className="text-sm text-slate-400">Last 30 days</p></CardHeader><CardContent className="space-y-5"><HealthRow label="Verified members" value={overview?.verifiedUsers ?? 0} total={overview?.totalProfiles ?? 1} /><HealthRow label="Premium members" value={overview?.premiumUsers ?? 0} total={overview?.totalUsers ?? 1} /><HealthRow label="Active conversations" value={overview?.activeConversations ?? 0} total={Math.max(overview?.totalUsers ?? 1, 1)} /><div className="flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" />Core services are responding normally</div></CardContent></Card></section>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Registration activity</CardTitle><p className="mt-1 text-sm text-slate-500">New member activity across the last 30 days</p></div><span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{overview?.registrationGrowthRate ?? 0}% growth</span></CardHeader><CardContent><div className="flex h-48 items-end gap-1.5 sm:gap-2">{(data?.reports?.daily ?? []).slice(-30).map((item) => { const max = Math.max(...(data?.reports?.daily ?? []).map((entry) => entry.registrations), 1); const height = Math.max((item.registrations / max) * 100, 5); return <div key={item.date} className="group flex flex-1 flex-col items-center justify-end gap-2"><div className="relative w-full rounded-t-md bg-emerald-400/80 transition group-hover:bg-emerald-500" style={{ height: `${height}%` }} title={`${item.registrations} registrations`} /></div>; })}</div>{!data?.reports?.daily?.length ? <div className="flex h-48 items-center justify-center text-sm text-slate-500">Activity data will appear here.</div> : null}</CardContent></Card><Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle>Quick actions</CardTitle><p className="mt-1 text-sm text-slate-500">Jump into daily operations.</p></CardHeader><CardContent className="space-y-2"><QuickAction href="/admin/users" icon={Users} label="Search members" /><QuickAction href="/admin/verification" icon={FileCheck2} label="Review verification" /><QuickAction href="/admin/security" icon={ShieldAlert} label="Investigate security" /><QuickAction href="/admin/photos" icon={ImageIcon} label="Moderate photos" /></CardContent></Card></section>
    </div>
  );
}
function QueueCard({ href, label, value, icon: Icon, tone }: { href: string; label: string; value: number; icon: typeof ImageIcon; tone: "blue" | "violet" | "amber" }) { const tones = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600" }; return <Link href={href} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><span className={`inline-flex rounded-xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></span><p className="mt-5 text-2xl font-bold">{value}</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500">{label}<ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></p></Link>; }
function HealthRow({ label, value, total }: { label: string; value: number; total: number }) { const percentage = Math.min(Math.round((value / Math.max(total, 1)) * 100), 100); return <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-semibold">{value.toLocaleString()}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${percentage}%` }} /></div></div>; }
function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Users; label: string }) { return <Link href={href} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium transition hover:bg-slate-50"><Icon className="h-4 w-4 text-emerald-600" />{label}<ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" /></Link>; }
