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
  Check,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useNotificationStore, type AppNotification } from "@/stores/notification-store";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  interest: Heart,
  message: MessageCircle,
  match: Heart,
  view: Eye,
  verification: Shield,
  system: Bell,
  premium: Crown,
};

const typeColors: Record<string, string> = {
  interest: "text-rose-500 bg-rose-500/10",
  message: "text-blue-500 bg-blue-500/10",
  match: "text-pink-500 bg-pink-500/10",
  view: "text-purple-500 bg-purple-500/10",
  verification: "text-emerald-500 bg-emerald-500/10",
  system: "text-gray-500 bg-gray-500/10",
  premium: "text-amber-500 bg-amber-500/10",
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

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
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 glass border-l border-border/50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Notifications</h2>
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
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all notifications
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
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || "text-gray-500 bg-gray-500/10";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
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
      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </motion.div>
  );
}