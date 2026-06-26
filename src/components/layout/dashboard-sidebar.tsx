"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Heart,
  MessageCircle,
  Star,
  User,
  Settings,
  Crown,
  Shield,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Eye,
  UserX,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/providers/auth-provider";
import { useNotificationStore } from "@/stores/notification-store";
import { getInitials } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  premium?: boolean;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/interests", label: "Interests", icon: Heart },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/who-viewed", label: "Who Viewed Me", icon: Eye, premium: true },
  { href: "/dashboard/blocked", label: "Blocked Users", icon: UserX },
  { href: "/dashboard/verification", label: "Verification", icon: FileCheck },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, premium: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminLink: SidebarLink = {
  href: "/admin",
  label: "Admin Panel",
  icon: Shield,
};

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount } = useNotificationStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 border-r border-border/50 glass",
collapsed ? "w-18" : "w-65"
        )}
      >
        {/* User Info */}
        <div className={cn("p-4 border-b border-border/50", collapsed && "px-3")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className={cn("ring-2 ring-primary/20", collapsed ? "h-9 w-9" : "h-10 w-10")}>
              <AvatarImage src={user?.avatar} alt="" />
<AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-sm font-semibold">
                {user?.firstName ? getInitials(`${user.firstName} ${user.lastName || ""}`) : "U"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.isPremium && (
                  <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    Premium
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <Badge className="h-5 min-w-5 text-[10px] px-1">{link.badge}</Badge>
                    )}
                    {link.premium && (
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </>
                )}
                {link.label === "Notifications" && unreadCount > 0 && !collapsed && (
                  <Badge className="h-5 min-w-5 text-[10px] px-1">{unreadCount}</Badge>
                )}
              </Link>
            );
          })}

          {/* Admin Link */}
          {user?.role === "admin" && (
            <>
              <div className={cn("my-2 border-t border-border/50", collapsed && "mx-2")} />
              <Link
                href={adminLink.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  pathname === adminLink.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                )}
                title={collapsed ? adminLink.label : undefined}
              >
                <Shield className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{adminLink.label}</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-border/50 space-y-1">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", collapsed && "justify-center px-2")}
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="w-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {sidebarLinks.slice(0, 5).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
"flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-15",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}