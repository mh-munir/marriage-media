"use client";

import * as React from "react";
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
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const { unreadCount, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) void fetchNotifications(true);
  }, [fetchNotifications, isAuthenticated]);

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const links = isDashboard || isAdmin ? dashboardLinks : publicLinks;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "px-3 pt-3 sm:px-5"
          : "px-3 pt-3 sm:px-5"
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-white/60 bg-background/85 px-3 shadow-lg shadow-rose-950/5 backdrop-blur-xl sm:px-5 dark:border-white/10">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Marriage Media home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-orange-400 shadow-md shadow-rose-500/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Heart className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              Marriage<span className="text-primary">Media</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 rounded-xl bg-muted/60 p-1 md:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
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

            {isAuthenticated && authUser ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Open notifications"
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold text-white flex items-center justify-center">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
                </Button>

                <Button
                  variant="outline"
                  className="hidden rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 md:inline-flex"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-xl text-muted-foreground">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="gradient" asChild className="rounded-xl shadow-md shadow-primary/20">
                  <Link href="/register">Register Free</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
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
            className="md:hidden border-t border-border/50 glass"
          >
            <nav
              id="mobile-navigation"
              className="mx-auto max-w-7xl px-4 py-4 space-y-1"
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
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Button variant="outline" asChild className="w-full rounded-xl">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="gradient" asChild className="w-full rounded-xl">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Register Free
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
                    Logout
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
