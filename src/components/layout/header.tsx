"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Search,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/providers/auth-provider";
import { useNotificationStore } from "@/stores/notification-store";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { useSiteBranding } from "@/hooks/use-site-branding";

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/contact", label: "Contact" },
];

const dashboardLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: User },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/interests", label: "Interests", icon: Heart },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isPageReady, setIsPageReady] = React.useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [messageUnreadCount, setMessageUnreadCount] = React.useState(0);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const { headerLogoUrl } = useSiteBranding();
  const hasHeaderLogo = typeof headerLogoUrl === "string" && headerLogoUrl.trim().length > 0;

  React.useEffect(() => {
    const markPageReady = () => setIsPageReady(true);

    if (document.readyState === "complete") {
      markPageReady();
      return;
    }

    window.addEventListener("load", markPageReady, { once: true });
    return () => window.removeEventListener("load", markPageReady);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) void fetchNotifications(true);
  }, [fetchNotifications, isAuthenticated]);

  const isMessagesRoute = pathname === "/dashboard/messages" || pathname.startsWith("/dashboard/messages?");

  React.useEffect(() => {
    if (!isAuthenticated || !isMessagesRoute) {
      return;
    }

    let active = true;
    const loadUnreadMessages = async () => {
      try {
        const response = await fetch("/api/chat/conversations", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { conversations?: Array<{ unreadCount?: number }> };
        if (active) {
          setMessageUnreadCount((result.conversations || []).reduce((total, conversation) => total + (conversation.unreadCount || 0), 0));
        }
      } catch {
        // Keep the last known count while the next refresh retries.
      }
    };

    void loadUnreadMessages();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isMessagesRoute]);

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const visibleMessageUnreadCount = isAuthenticated && isMessagesRoute ? messageUnreadCount : 0;
  const links = isDashboard || isAdmin ? dashboardLinks : publicLinks;

  if (!isPageReady) {
    return <div className="h-18 w-full sm:h-21" aria-hidden="true" />;
  }

  const translatedLabel = (href: string, fallback: string) => {
    const keyByHref = {
      "/": "home",
      "/about": "about",
      "/pricing": "pricing",
      "/blog": "blog",
      "/success-stories": "successStories",
      "/contact": "contact",
      "/dashboard": "dashboard",
      "/dashboard/search": "search",
      "/dashboard/interests": "interests",
      "/dashboard/messages": "messages",
      "/dashboard/favorites": "favorites",
    } as const;
    const key = keyByHref[href as keyof typeof keyByHref];
    return key ? t(key) : fallback;
  };

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 px-0 pt-3 transition-all duration-300 sm:px-6 sm:pt-4"
    >
      <div className="mx-auto w-full max-w-none sm:max-w-7xl">
        <div
          className={cn(
            "grid grid-cols-[1fr_auto] items-center rounded-full px-3 transition-all duration-300 sm:px-5 md:grid-cols-[1fr_auto_1fr]",
            isScrolled
              ? "h-14 border border-border/70 bg-background/98 shadow-xl shadow-rose-950/10 backdrop-blur-2xl sm:h-16"
              : "h-18 border border-white/80 bg-white/95 shadow-lg shadow-rose-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-background/95"
          )}
        >
          {/* Logo */}
          {hasHeaderLogo ? (
            <Link href="/" className="group flex items-center gap-2 sm:gap-3" aria-label="Halal Biye Bangladesh home">
              <Image
                src={headerLogoUrl}
                alt="Halal Biye Bangladesh"
                width={176}
                height={40}
                priority
                loading="eager"
                fetchPriority="high"
                className="h-9 w-auto max-w-30 shrink-0 rounded-md object-contain object-left sm:h-12 sm:max-w-45 md:h-16 md:max-w-55"
                sizes="(max-width: 640px) 120px, (max-width: 1024px) 180px, 220px"
                unoptimized
              />
            </Link>
          ) : (
            <div
              className="flex items-center justify-start"
              aria-label="Loading logo"
              aria-busy="true"
            >
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted/80 sm:h-12 sm:w-44 md:h-16 md:w-56" />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-border/50 bg-muted/70 p-1.5 shadow-sm backdrop-blur md:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <span className="relative inline-flex items-center gap-1.5">
                  {translatedLabel(link.href, link.label)}
                  {link.href === "/dashboard/messages" && visibleMessageUnreadCount > 0 ? <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">{visibleMessageUnreadCount > 99 ? "99+" : visibleMessageUnreadCount}</span> : null}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-1 rounded-full border border-border/50 bg-muted/60 p-1 sm:gap-1.5">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full text-muted-foreground hover:bg-background hover:text-primary"
              aria-label={t("toggleTheme")}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full text-muted-foreground hover:bg-background hover:text-primary"
              aria-label={t("toggleLanguage")}
              title={t("toggleLanguage")}
            >
              <span className="text-xs font-bold tracking-wide" aria-hidden="true">
                {language === "bn" ? "EN" : "BN"}
              </span>
              <span className="sr-only">{language === "bn" ? "বাংলা" : "English"}</span>
            </Button>

            {isAuthenticated && authUser ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-muted-foreground hover:bg-background hover:text-primary"
                  aria-label={t("openNotifications")}
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold text-white flex items-center justify-center">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
                </Button>

                <Button
                  variant="outline"
                  className="hidden rounded-full border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 md:inline-flex"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="gradient" asChild className="rounded-full px-5 shadow-md shadow-primary/20">
                  <Link href="/login">{t("login")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("toggleMenu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-2xl md:hidden"
          >
            <nav
              id="mobile-navigation"
              className="mx-auto max-w-7xl space-y-1 px-4 py-4"
              aria-label="Mobile navigation"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span className="flex items-center gap-2">
                    {translatedLabel(link.href, link.label)}
                    {link.href === "/dashboard/messages" && visibleMessageUnreadCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-5 text-primary-foreground">{visibleMessageUnreadCount > 99 ? "99+" : visibleMessageUnreadCount}</span> : null}
                  </span>
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Button variant="gradient" asChild className="w-full rounded-xl">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        {t("login")}
                    </Link>
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-destructive"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
