"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  Eye,
  Shield,
  Crown,
  CreditCard,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  useNotificationStore,
  type AppNotification,
} from "@/stores/notification-store";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  interest: Heart,
  message: MessageCircle,
  profile_view: Eye,
  payment: CreditCard,
  verification: Shield,
  system: Bell,
  promotion: Crown,
};

const typeColors: Record<string, string> = {
  interest: "text-rose-500 bg-rose-500/10",
  message: "text-blue-500 bg-blue-500/10",
  profile_view: "text-purple-500 bg-purple-500/10",
  payment: "text-amber-500 bg-amber-500/10",
  verification: "text-emerald-500 bg-emerald-500/10",
  system: "text-gray-500 bg-gray-500/10",
  promotion: "text-pink-500 bg-pink-500/10",
};

const typeLabels: Record<string, string> = {
  interest: "Interests",
  message: "Messages",
  profile_view: "Profile Views",
  payment: "Payments",
  verification: "Verification",
  system: "System",
  promotion: "Promotions",
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = React.useState("all");

  // Fetch on mount
  React.useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length, unread: 0 };
    notifications.forEach((n) => {
      if (!n.isRead) counts.unread = (counts.unread || 0) + 1;
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-linear-to-br from-primary/10 via-background to-rose-500/5 p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
              <Bell className="h-3.5 w-3.5" /> Your activity center
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Notifications</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Keep track of the moments, messages, and updates that matter to you.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="bg-background/80">
                <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={clearAll}>
                <Trash2 className="mr-1 h-4 w-4" /> Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="border-primary/15 bg-primary/5 p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tabCounts.interest || 0}</p>
              <p className="text-xs text-muted-foreground">Interests</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tabCounts.message || 0}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tabCounts.profile_view || 0}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notification List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-card p-1 sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All ({tabCounts.all || 0})
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Unread ({tabCounts.unread || 0})
          </TabsTrigger>
          {Object.entries(typeLabels).map(([key, label]) =>
            (tabCounts[key] || 0) > 0 ? (
              <TabsTrigger key={key} value={key} className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {label} ({tabCounts[key]})
              </TabsTrigger>
            ) : null
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/15 to-rose-500/10">
                  <div className="absolute inset-2 rounded-2xl border border-primary/15" />
                  <Bell className="relative h-9 w-9 text-primary/60" />
                </div>
                <p className="text-base font-semibold">You’re all caught up</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {activeTab === "unread" ? "All caught up!" : "Nothing here yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">New activity will appear here when something needs your attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredNotifications.map((notification) => (
                  <NotificationPageItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}

                {hasMore && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNotifications(false)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationPageItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || "text-gray-500 bg-gray-500/10";

  return (
    <div
      className={cn(
        "group flex cursor-pointer gap-4 border-l-2 border-transparent p-5 transition-colors hover:bg-accent/40",
        !notification.isRead && "border-l-primary bg-primary/5"
      )}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
        if (notification.link) {
          window.location.href = notification.link;
        }
      }}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          colorClass
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-5", !notification.isRead && "font-semibold")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <Badge variant="secondary" className="h-5 shrink-0 text-[10px]">
              New
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </p>
          {notification.delivery && notification.delivery.length > 0 && (
            <div className="flex items-center gap-1">
              {notification.delivery.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded",
                    d.status === "sent"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : d.status === "failed"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-gray-500/10 text-gray-600"
                  )}
                >
                  {d.channel}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start gap-2 shrink-0 pt-1">
        {!notification.isRead && (
          <button
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            title="Mark as read"
          >
            <Check className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button
          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}