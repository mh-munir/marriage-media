"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  trustScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({
  isVerified,
  trustScore,
  size = "md",
  showLabel = false,
  className,
}: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const sizeConfig = {
    sm: { icon: "h-3.5 w-3.5", text: "text-xs" },
    md: { icon: "h-4 w-4", text: "text-sm" },
    lg: { icon: "h-5 w-5", text: "text-base" },
  };

  const config = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-blue-500",
        config.text,
        className
      )}
      title={
        trustScore !== undefined
          ? `Verified — Trust Score: ${trustScore}%`
          : "Verified Profile"
      }
    >
      <ShieldCheck className={cn(config.icon, "fill-blue-500 text-white")} />
      {showLabel && <span className="font-medium">Verified</span>}
    </span>
  );
}

interface TrustScoreBarProps {
  score: number;
  className?: string;
}

export function TrustScoreBar({ score, className }: TrustScoreBarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Trust";
    if (score >= 50) return "Medium Trust";
    return "Building Trust";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Trust Score</span>
        <span className="font-medium">
          {score}% — {getScoreLabel(score)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getScoreColor(score))}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}