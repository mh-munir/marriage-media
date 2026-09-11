"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  MessageCircle,
  Eye,
  Shield,
  Crown,
  CreditCard,
  Settings,
  Check,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useNotificationStore, type AppNotification } from "@/stores/notification-store";

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

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
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

  // Fetch notifications on open
  React.useEffect(() => {
    if (open) {
      fetchNotifications(true);
    }
  }, [open, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  React.useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [open, fetchNotifications]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-y-3 right-3 z-50 flex h-[calc(100%-1.5rem)] w-[min( calc(100%-1.5rem), 27rem)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-br from-primary/10 via-background to-rose-500/5 p-5">
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Bell className="h-5 w-5" /></div>
                <div><h2 className="text-lg font-semibold">Notifications</h2><p className="text-xs text-muted-foreground">Your latest activity</p></div>
                {unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 text-[10px] px-1">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/notifications" onClick={onClose}>
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
                    <Bell className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="text-sm font-semibold">You’re all caught up</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">New activity will appear here when something needs your attention.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}

                  {/* Load more */}
                  {hasMore && (
                    <div className="p-3 text-center">
                      <Button
                        variant="ghost"
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
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex gap-2 border-t border-border/60 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <Link href="/dashboard/notifications" onClick={onClose}>
                    View all notifications
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "group flex cursor-pointer gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-border/70 hover:bg-accent/50",
        !notification.isRead && "border-primary/10 bg-primary/5"
      )}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0">
        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </motion.div>
  );
}