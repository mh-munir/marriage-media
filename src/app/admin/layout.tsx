"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  FileCheck2,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Profiles", icon: Users },
  { href: "/admin/verification", label: "Verifications", icon: FileCheck2 },
  { href: "/admin/photos", label: "Photo moderation", icon: ImageIcon },
  { href: "/admin/security", label: "Security center", icon: ShieldCheck },
];

const insightItems = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/cms", label: "Content & CMS", icon: Settings2 },
  { href: "/admin/audit", label: "Audit trail", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { user, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && pathname !== "/admin/login" && (!user || (user.role !== "admin" && user.role !== "superadmin"))) {
      window.location.replace("/admin/login");
    }
  }, [isLoading, pathname, user]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (isLoading || !user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-sm text-slate-500">Checking admin session...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-background dark:text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-[#0d1b2a] px-5 py-6 text-white transition-transform dark:border-border lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-[#0d1b2a]">M</span>
            <span><strong className="block text-sm tracking-wide">MARRIAGE MEDIA</strong><small className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Admin console</small></span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-10 space-y-7">
          <AdminNav title="Workspace" items={navItems} pathname={pathname} close={() => setOpen(false)} />
          <AdminNav title="Insights & tools" items={insightItems} pathname={pathname} close={() => setOpen(false)} />
        </div>

        <div className="absolute bottom-6 left-5 right-5">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {open ? <button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-[#f6f8fb]/90 px-4 backdrop-blur-xl dark:border-border dark:bg-background/90 sm:px-8">
          <div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-6 w-6" /></button><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Control room</p><h1 className="text-lg font-bold">Good morning, Admin</h1></div></div>
          <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Search"><Search className="h-5 w-5" /></Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-5 w-5" /></Button><div className="ml-2 hidden text-right sm:block"><p className="text-xs font-semibold">{user.email}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">{user.role}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{user.email.slice(0, 2).toUpperCase()}</div></div>
        </header>
        <main className="min-h-[calc(100vh-4.5rem)] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNav({ title, items, pathname, close }: { title?: string; items: typeof navItems; pathname: string; close: () => void }) {
  return <section>{title ? <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p> : null}<nav className="space-y-1">{items.map(({ href, label, icon: Icon }) => { const baseHref = href.split("?")[0]; const active = baseHref === "/admin" ? pathname === baseHref : pathname === baseHref || pathname.startsWith(`${baseHref}/`); return <Link key={`${href}-${label}`} href={href} onClick={close} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-emerald-400 font-semibold text-[#0d1b2a]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="h-4 w-4" /><span className="flex-1">{label}</span>{active ? <ChevronRight className="h-4 w-4" /> : null}</Link>; })}</nav></section>;
}