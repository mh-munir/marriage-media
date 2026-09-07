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
  Settings,
  Crown,
  ChevronDown,
  Search,
  MessageCircle,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

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
  const [mounted, setMounted] = React.useState(false);
  const { user: authUser, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const links = isDashboard || isAdmin ? dashboardLinks : publicLinks;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Marriage Media home">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 via-pink-500 to-purple-600 shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-all duration-300 group-hover:scale-105">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Marriage<span className="text-primary">Media</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  pathname === link.href
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
              aria-label="Toggle theme"
            >
              {mounted && (
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
              )}
            </Button>

            {isAuthenticated && authUser ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-xl relative" aria-label="Open notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Profile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-xl gap-2 px-2" aria-label="Open profile menu">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage src={authUser.avatar} alt="" />
                        <AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-xs font-semibold">
                          {authUser.firstName
                            ? getInitials(`${authUser.firstName} ${authUser.lastName || ""}`)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium">{authUser.firstName || "User"}</p>
                      <p className="text-xs text-muted-foreground">{authUser.email}</p>
                      {authUser.isPremium && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {authUser.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        {authUser.isPremium ? "Manage Premium" : "Upgrade to Premium"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex rounded-xl"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-xl">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="gradient" asChild className="rounded-xl">
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
