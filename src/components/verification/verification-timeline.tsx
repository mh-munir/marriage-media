"use client";

import * as React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Ban,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface VerificationTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Pending",
  },
  under_review: {
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Under Review",
  },
  approved: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Rejected",
  },
  expired: {
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Expired",
  },
  cancelled: {
    icon: Ban,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Cancelled",
  },
};

function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VerificationTimeline({
  events,
  className,
}: VerificationTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={cn("text-center py-6 text-muted-foreground", className)}>
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn("space-y-0", className)}>
      {sortedEvents.map((event, index) => {
        const config = statusConfig[event.status] || statusConfig.pending;
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={index} className="flex gap-3">
            {/* Icon and line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  config.bgColor
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", config.color)}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimelineDate(event.timestamp)}
                </span>
              </div>
              {event.note && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}