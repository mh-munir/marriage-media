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
  CheckCheck,
  Trash2,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

const typeColors: Record<string, { icon: string; bg: string; border: string }> = {
  interest: { icon: "text-red-500", bg: "bg-linear-to-br from-red-500/20 to-red-400/10", border: "border-red-500/30" },
  message: { icon: "text-blue-500", bg: "bg-linear-to-br from-blue-500/20 to-blue-400/10", border: "border-blue-500/30" },
  profile_view: { icon: "text-purple-500", bg: "bg-linear-to-br from-purple-500/20 to-purple-400/10", border: "border-purple-500/30" },
  payment: { icon: "text-amber-500", bg: "bg-linear-to-br from-amber-500/20 to-amber-400/10", border: "border-amber-500/30" },
  verification: { icon: "text-emerald-500", bg: "bg-linear-to-br from-emerald-500/20 to-emerald-400/10", border: "border-emerald-500/30" },
  system: { icon: "text-sky-500", bg: "bg-linear-to-br from-sky-500/20 to-sky-400/10", border: "border-sky-500/30" },
  promotion: { icon: "text-pink-500", bg: "bg-linear-to-br from-pink-500/20 to-pink-400/10", border: "border-pink-500/30" },
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

  React.useEffect(() => {
    if (open) {
      fetchNotifications(true);
    }
  }, [open, fetchNotifications]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed inset-x-3 top-20 z-50 flex max-h-[min(680px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:w-104"
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-br from-primary/10 via-background to-rose-50/60 p-5 dark:to-primary/5">
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute -left-12 -bottom-16 h-28 w-28 rounded-full bg-rose-300/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-rose-500 shadow-lg shadow-primary/25"
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Notifications</h2>
                    <p className="text-xs text-muted-foreground">Your latest updates, all in one place</p>
                  </div>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 shadow-sm shadow-primary/30"
                    >
                      <span className="text-xs font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/70 transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </div>

              <motion.div
                  className="relative mt-4 flex items-center justify-between gap-3"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"}
                </span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Link href="/dashboard/notifications" onClick={onClose}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Notification settings</span>
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 space-y-2 overflow-y-auto bg-muted/20 p-3">
              {isLoading && notifications.length === 0 ? (
                <motion.div
                  className="flex items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-10 w-10 text-primary" />
                    </motion.div>
                    <p className="text-xs font-medium text-muted-foreground">Loading notifications...</p>
                  </div>
                </motion.div>
              ) : notifications.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center px-6 py-24 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/30 to-primary/10 ring-2 ring-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Sparkles className="h-10 w-10 text-primary" />
                  </motion.div>
                  <p className="text-base font-bold text-foreground">You&apos;re all caught up</p>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">New activity will appear here when something needs your attention.</p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, delayChildren: 0.05 }}
                >
                  {notifications.map((notification, idx) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      index={idx}
                    />
                  ))}

                  {hasMore && (
                    <motion.div
                      className="flex justify-center pt-3 pb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        onClick={() => fetchNotifications(false)}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-primary/20 bg-background text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Load more
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <motion.div
                className="flex gap-2 border-t border-border/60 bg-background/90 p-3 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl border-primary/20 bg-primary/5 font-semibold text-primary hover:bg-primary/10"
                >
                  <Link href="/dashboard/notifications" onClick={onClose}>
                    View all
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button
                  onClick={clearAll}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-destructive/20 bg-destructive/5 font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
              </motion.div>
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
  index,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  index?: number;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colors = typeColors[notification.type] || { icon: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
      className={cn(
        "group flex cursor-pointer gap-3 rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5",
        !notification.isRead
          ? `border-primary/25 bg-linear-to-r from-primary/10 via-background to-rose-50/60 hover:border-primary/40 dark:to-primary/5`
          : `border-border/60 bg-background hover:border-border hover:bg-muted/30`
      )}
      onClick={() => !notification.isRead && onRead(notification.id)}
      whileHover={{ x: 4 }}
    >
      {/* Icon Container */}
      <motion.div
        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", colors.bg, colors.border, "border")}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className={cn("h-5 w-5", colors.icon)} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-tight", !notification.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/85")}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-2.5 w-2.5 rounded-full bg-linear-to-r from-primary to-primary/70 shrink-0 shadow-lg shadow-primary/50"
            />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {notification.body}
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/80">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Delete Button */}
      <motion.button
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
      </motion.button>
    </motion.div>
  );
}
