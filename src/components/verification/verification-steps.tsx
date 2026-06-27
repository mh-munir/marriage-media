"use client";

import * as React from "react";
import {
  Phone,
  Mail,
  CreditCard,
  FileCheck,
  ScanFace,
  Camera,
  Check,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type VerificationStepType = "phone" | "email" | "nid" | "passport" | "face" | "selfie";

interface VerificationStep {
  type: VerificationStepType;
  status: "not_started" | "pending" | "under_review" | "approved" | "rejected" | "expired";
  label: string;
  description: string;
  icon: React.ElementType;
  trustWeight: number;
}

interface VerificationStepsProps {
  completedSteps: string[];
  verifications: any[];
  onStepAction: (type: VerificationStepType) => void;
  className?: string;
}

const STEPS_CONFIG: Omit<VerificationStep, "status">[] = [
  {
    type: "phone",
    label: "Phone Verification",
    description: "Verify your phone number via OTP",
    icon: Phone,
    trustWeight: 10,
  },
  {
    type: "email",
    label: "Email Verification",
    description: "Confirm your email address",
    icon: Mail,
    trustWeight: 5,
  },
  {
    type: "nid",
    label: "NID Verification",
    description: "Upload your National ID card",
    icon: CreditCard,
    trustWeight: 30,
  },
  {
    type: "passport",
    label: "Passport Verification",
    description: "Upload your passport",
    icon: FileCheck,
    trustWeight: 25,
  },
  {
    type: "face",
    label: "Face Verification",
    description: "AI face match between your photo and selfie",
    icon: ScanFace,
    trustWeight: 15,
  },
  {
    type: "selfie",
    label: "Selfie Match",
    description: "Upload a live selfie for identity confirmation",
    icon: Camera,
    trustWeight: 10,
  },
];

function getStepStatus(
  type: VerificationStepType,
  verifications: any[]
): VerificationStep["status"] {
  // Find the latest verification for this type
  const relevant = verifications
    .filter((v) => v.type === type)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (relevant.length === 0) return "not_started";

  const latest = relevant[0];

  switch (latest.status) {
    case "approved":
      return "approved";
    case "pending":
      return "pending";
    case "under_review":
      return "under_review";
    case "rejected":
      return "rejected";
    case "expired":
      return "expired";
    default:
      return "not_started";
  }
}

const statusDisplay: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; badgeVariant: "default" | "secondary" | "destructive" | "outline"; label: string }
> = {
  not_started: {
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    badgeVariant: "outline",
    label: "Not Started",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    badgeVariant: "secondary",
    label: "Pending",
  },
  under_review: {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    badgeVariant: "secondary",
    label: "Under Review",
  },
  approved: {
    icon: Check,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    badgeVariant: "default",
    label: "Verified",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    badgeVariant: "destructive",
    label: "Rejected",
  },
  expired: {
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    badgeVariant: "destructive",
    label: "Expired",
  },
};

export function VerificationSteps({
  completedSteps,
  verifications,
  onStepAction,
  className,
}: VerificationStepsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {STEPS_CONFIG.map((stepConfig) => {
        const status = getStepStatus(stepConfig.type, verifications);
        const display = statusDisplay[status];
        const Icon = stepConfig.icon;
        const StatusIcon = display.icon;
        const isCompleted = status === "approved";
        const isActive = status === "pending" || status === "under_review";
        const canAct = status === "not_started" || status === "rejected" || status === "expired";

        return (
          <div
            key={stepConfig.type}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 transition-all",
              isCompleted && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
              isActive && "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20",
              !isCompleted && !isActive && "hover:border-accent"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isCompleted ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{stepConfig.label}</span>
                <Badge variant={display.badgeVariant} className="text-xs">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {display.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stepConfig.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trust weight: <span className="font-medium">+{stepConfig.trustWeight}%</span>
              </p>
            </div>

            {/* Action */}
            <div className="shrink-0">
              {canAct ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStepAction(stepConfig.type)}
                >
                  {status === "not_started" ? "Start" : "Retry"}
                </Button>
              ) : isCompleted ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <span className="text-xs text-muted-foreground">In Progress</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}