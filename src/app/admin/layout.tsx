"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  FileCheck2,
  CreditCard,
  ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Mail,
  Search,
  Globe2,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useNotificationStore, type AppNotification } from "@/stores/notification-store";
import { LanguageProvider } from "@/providers/language-provider";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/public-users", label: "Public users", icon: Users },
  { href: "/admin/admin-users", label: "Admin users", icon: UserCog },
  { href: "/admin/verification", label: "Verifications", icon: FileCheck2 },
  { href: "/admin/payments", label: "Manual payments", icon: CreditCard },
  { href: "/admin/photos", label: "Photo moderation", icon: ImageIcon },
  { href: "/admin/media", label: "Media library", icon: Images },
  { href: "/admin/contact-messages", label: "Contact messages", icon: Mail },
  { href: "/admin/security", label: "Security center", icon: ShieldCheck },
];

const insightItems = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/cms", label: "Content & CMS", icon: Settings2 },
  { href: "/admin/seo", label: "SEO settings", icon: Globe2 },
  { href: "/admin/audit", label: "Audit trail", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [greeting, setGreeting] = React.useState("Good morning");
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const user = useAdminAuthStore((state) => state.user);
  const isLoading = useAdminAuthStore((state) => state.isLoading);
  const logoutAdmin = useAdminAuthStore((state) => state.logout);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  async function logout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      useNotificationStore.getState().reset();
      logoutAdmin();
      window.location.replace("/admin/login");
    }
  }

  React.useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
    };

    updateGreeting();
    const interval = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    const restorePublicTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      root.classList.toggle("dark", shouldUseDark);
      root.classList.toggle("light", !shouldUseDark);
    };

    root.classList.remove("dark");
    root.classList.add("light");
    return restorePublicTheme;
  }, []);

  React.useEffect(() => {
    if (!isLoading && pathname !== "/admin/login" && (!user || (user.role !== "admin" && user.role !== "superadmin"))) {
      window.location.replace("/admin/login");
    }
  }, [isLoading, pathname, user]);

  React.useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    const refresh = window.setInterval(() => void fetchNotifications(true), 15000);
    void fetchNotifications(true);
    return () => window.clearInterval(refresh);
  }, [fetchNotifications, user]);

  React.useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notificationsOpen]);

  if (pathname === "/admin/login") return <LanguageProvider forcedLanguage="en"><div className="admin-login-shell">{children}</div></LanguageProvider>;
  if (isLoading || !user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-sm text-slate-500">Checking admin session...</div>;
  }

  return (
    <LanguageProvider forcedLanguage="en">
      <div className="admin-shell min-h-screen bg-[#f6f8fb] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-72 max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-r border-slate-200 bg-[#0d1b2a] px-5 py-6 text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-[#0d1b2a]">M</span>
            <span><strong className="block text-sm tracking-wide">MARRIAGE MEDIA</strong><small className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Admin console</small></span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-10 min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgb(148_163_184/0.35)_transparent] scrollbar-thin">
          <AdminNav title="Workspace" items={navItems} pathname={pathname} close={() => setOpen(false)} />
          <AdminNav title="Insights & tools" items={insightItems} pathname={pathname} close={() => setOpen(false)} />
        </div>

        <div className="mt-6 shrink-0">
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
          <div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-6 w-6" /></button><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Control room</p><h1 className="text-lg font-bold">{greeting}, Admin</h1></div></div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Search"><Search className="h-5 w-5" /></Button>
            <div ref={notificationRef} className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen((current) => !current)}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
              </Button>
              {notificationsOpen ? (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl">
                  <div className="flex items-center justify-between border-b pb-2">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 ? <button className="text-xs text-emerald-600" onClick={() => void markAllAsRead()}>Mark all read</button> : null}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length ? notifications.slice(0, 8).map((notification) => (
                      <Link
                        key={notification.id}
                        href={getAdminNotificationHref(notification)}
                        onClick={() => {
                          if (!notification.isRead) void markAsRead(notification.id);
                          setNotificationsOpen(false);
                        }}
                        className={`block border-b py-3 last:border-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${notification.isRead ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{notification.body}</p>
                          </div>
                          <ChevronRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </Link>
                    )) : <p className="py-8 text-center text-xs text-slate-500">No notifications</p>}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="ml-2 hidden text-right sm:block"><p className="text-xs font-semibold">{user.email}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">{user.role}</p></div>
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-700" title="Admin profile image">{user.avatar ? <Image src={user.avatar} alt="Admin profile" fill sizes="36px" className="object-cover" /> : user.email.slice(0, 2).toUpperCase()}</div>
          </div>
        </header>
        <main className="admin-main min-h-[calc(100vh-4.5rem)] px-3 py-5 sm:px-5 sm:py-6 xl:px-6">{children}</main>
      </div>
      </div>
    </LanguageProvider>
  );
}

function AdminNav({ title, items, pathname, close }: { title?: string; items: typeof navItems; pathname: string; close: () => void }) {
  return <section>{title ? <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p> : null}<nav className="space-y-1">{items.map(({ href, label, icon: Icon }) => { const baseHref = href.split("?")[0]; const active = baseHref === "/admin" ? pathname === baseHref : pathname === baseHref || pathname.startsWith(`${baseHref}/`); return <Link key={`${href}-${label}`} href={href} onClick={close} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-emerald-400 font-semibold text-[#0d1b2a]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="h-4 w-4" /><span className="flex-1">{label}</span>{active ? <ChevronRight className="h-4 w-4" /> : null}</Link>; })}</nav></section>;
}

function getAdminNotificationHref(notification: AppNotification) {
  const link = notification.link?.trim();
  if (link?.startsWith("/") && !link.startsWith("//")) return link;

  switch (notification.type) {
    case "payment":
      return "/admin/payments";
    case "verification":
      return "/admin/verification";
    case "promotion":
      return "/admin/cms";
    default:
      return "/admin/users";
  }
}
