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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated on interests, messages, and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
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
        <Card className="p-4">
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
        <Card className="p-4">
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
        <Card className="p-4">
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
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All ({tabCounts.all || 0})
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Unread ({tabCounts.unread || 0})
          </TabsTrigger>
          {Object.entries(typeLabels).map(([key, label]) =>
            (tabCounts[key] || 0) > 0 ? (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {label} ({tabCounts[key]})
              </TabsTrigger>
            ) : null
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="overflow-hidden">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === "unread" ? "All caught up!" : "Nothing here yet"}
                </p>
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
        "flex gap-4 p-4 transition-colors hover:bg-accent/50 group cursor-pointer",
        !notification.isRead && "bg-primary/5"
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
          "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
          colorClass
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", !notification.isRead && "font-semibold")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <Badge variant="secondary" className="h-5 text-[10px] shrink-0">
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