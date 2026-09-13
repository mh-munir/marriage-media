"use client";

import * as React from "react";
import { motion, type MotionProps } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GlassCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-card p-6 transition-all duration-300",
        hover && "hover:shadow-elevated cursor-pointer",
        glow && "shadow-glow hover:shadow-glow",
        gradient &&
"bg-linear-to-br from-white/80 to-white/40 dark:from-white/5 dark:to-white/2",
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

interface PremiumBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "gold" | "silver" | "platinum" | "verified";
}

export function PremiumBadge({
  children,
  className,
  variant = "gold",
}: PremiumBadgeProps) {
  const variants = {
    gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
    silver: "bg-gradient-to-r from-gray-300 to-gray-500 text-white",
    platinum: "bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white",
    verified: "bg-gradient-to-r from-blue-400 to-cyan-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const directionMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ProfileCardProps {
  name: string;
  age: number;
  location: string;
  profession: string;
  education: string;
  imageUrl?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  compatibility?: number;
  onClick?: () => void;
}

export function ProfileCard({
  name,
  age,
  location,
  profession,
  education,
  imageUrl,
  isVerified = false,
  isPremium = false,
  compatibility,
  onClick,
}: ProfileCardProps) {
  return (
    <GlassCard
      onClick={onClick}
      className="overflow-hidden group"
    >
      {/* Photo */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="100vw"
          />
        ) : (
<div className="h-full w-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary/30">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlays */}
<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isVerified && (
            <PremiumBadge variant="verified">
              ✓ Verified
            </PremiumBadge>
          )}
          {isPremium && (
            <PremiumBadge variant="gold">
              ⭐ Premium
            </PremiumBadge>
          )}
        </div>

        {/* Compatibility */}
        {compatibility !== undefined && (
          <div className="absolute top-3 right-3">
            <div className="glass-strong rounded-full px-3 py-1 text-sm font-bold text-white">
              {compatibility}% Match
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold line-clamp-1">
          {name}, {age}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {profession} · {location}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {education}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-px bg-border self-center" />
        <span className="text-xs text-primary font-medium uppercase tracking-wider">
          View Profile
        </span>
        <div className="flex-1 h-px bg-border self-center" />
      </div>
    </GlassCard>
  );
}