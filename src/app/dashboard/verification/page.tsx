"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizePhoneNumberInput } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle,
  FileCheck,
  ScanFace,
  Camera,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge, TrustScoreBar } from "@/components/verification/verified-badge";
import { VerificationTimeline } from "@/components/verification/verification-timeline";
import { VerificationSteps } from "@/components/verification/verification-steps";

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface Verification {
  _id: string;
  type: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "expired" | "cancelled";
  rejectionReason?: string;
  documentUrl?: string;
  documentNumber?: string;
  selfieUrl?: string;
  faceMatchScore?: number;
  value?: string;
  contributesToBadge?: boolean;
  timeline?: TimelineEvent[];
  createdAt: string;
  reviewedAt?: string;
}

interface BadgeInfo {
  isVerified: boolean;
  verifiedTypes: string[];
  trustScore: number;
  verifiedAt?: string;
}

interface VerificationData {
  badge: BadgeInfo;
  verifications: Verification[];
  completedSteps: string[];
  totalSteps: number;
}

type ActiveModal = null | "phone" | "profile";

export default function VerificationPage() {
  const [data, setData] = React.useState<VerificationData | null>(null);
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedVerification, setSelectedVerification] = React.useState<Verification | null>(null);

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [phoneOTP, setPhoneOTP] = React.useState("");
  const [phoneStep, setPhoneStep] = React.useState<"input" | "verify">("input");

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  React.useEffect(() => {
    fetchVerificationData();
  }, []);

  async function fetchVerificationData() {
    try {
      const res = await fetch("/api/verification");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch {
      console.error("Failed to fetch verification data");
    }
  }

  function resetModalState() {
    setActiveModal(null);
    setPhoneNumber("");
    setPhoneOTP("");
    setPhoneStep("input");
    setError("");
    setSuccess("");
  }

  async function handleSendPhoneOTP() {
    if (!phoneNumber) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verification/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const result = await res.json();
      if (res.ok) {
        setPhoneStep("verify");
        setSuccess("OTP sent! Check your phone.");
        if (result.otp) setPhoneOTP(result.otp);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch {
      setError("Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyPhoneOTP() {
    if (!phoneOTP) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verification/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: phoneOTP }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Phone verified successfully!");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 1500);
      } else {
        setError(result.error || "Failed to verify OTP");
      }
    } catch {
      setError("Failed to verify OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitProfileVerification() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile" }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Profile verification submitted for admin review.");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 1500);
      } else {
        setError(result.error || "Failed to submit profile verification");
      }
    } catch {
      setError("Failed to submit profile verification");
    } finally {
      setSubmitting(false);
    }
  }

  function handleStepAction(type: string) {
    setActiveModal(type as ActiveModal);
  }

  const badge = data?.badge;
  const verifications = data?.verifications || [];
  const completedSteps = data?.completedSteps || [];
  const totalSteps = data?.totalSteps || 2;
  const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending Review" },
    under_review: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Under Review" },
    approved: { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Approved" },
    rejected: { icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" },
    expired: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", label: "Expired" },
    cancelled: { icon: ShieldX, color: "text-gray-500", bg: "bg-gray-500/10", label: "Cancelled" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-2">Profile Verification</h1>
            <p className="text-muted-foreground mb-8">
              Complete phone verification and submit your profile for review to unlock the blue verified badge.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      badge?.isVerified ? "bg-blue-500/10" : progress > 0 ? "bg-yellow-500/10" : "bg-muted"
                    }`}
                  >
                    {badge?.isVerified ? (
                      <ShieldCheck className="h-8 w-8 text-blue-500" />
                    ) : progress > 0 ? (
                      <Clock className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {badge?.isVerified ? (
                          <span className="flex items-center gap-2">
                            Verified Profile
                            <VerifiedBadge isVerified trustScore={badge.trustScore} size="lg" />
                          </span>
                        ) : (
                          "Get Verified"
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {badge?.isVerified
                        ? `Your profile is verified with a trust score of ${badge.trustScore}%. You have the blue verified badge.`
                        : `Complete both checks to earn the blue verified badge. You have completed ${completedSteps.length} of ${totalSteps} steps.`}
                    </p>

                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Verification Progress</span>
                        <span className="font-medium">{completedSteps.length}/{totalSteps} steps ({progress}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {badge?.isVerified && <TrustScoreBar score={badge.trustScore} className="mt-3" />}
                  </div>
                  {badge?.isVerified && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Verification Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VerificationSteps verifications={verifications} onStepAction={handleStepAction} />
              </CardContent>
            </Card>
          </motion.div>

          {verifications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verifications.map((v) => {
                      const vs = statusConfig[v.status] || statusConfig.pending;
                      const StatusIcon = vs.icon;
                      const isExpanded = selectedVerification?._id === v._id;

                      return (
                        <div key={v._id} className="border rounded-xl overflow-hidden">
                          <button
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                            onClick={() => setSelectedVerification(isExpanded ? null : v)}
                          >
                            <div className={`p-2 rounded-lg ${vs.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${vs.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm capitalize">{v.type} Verification</span>
                                <Badge
                                  variant={
                                    v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {vs.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Submitted {new Date(v.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="px-4 pb-4">
                                  <Separator className="mb-4" />
                                  {v.rejectionReason && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejection Reason</p>
                                      <p className="text-sm text-red-500 dark:text-red-300">{v.rejectionReason}</p>
                                    </div>
                                  )}
                                  {v.timeline && v.timeline.length > 0 && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-medium mb-3">Timeline</h4>
                                      <VerificationTimeline events={v.timeline} />
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Blue Verified Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200">
                  {badge?.isVerified
                    ? "You have completed the required checks and your blue verified badge is active."
                    : "Complete both Phone Verification and Profile Verification to unlock the blue badge."}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetModalState();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-background rounded-2xl shadow-2xl border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold capitalize">{activeModal === "profile" ? "Profile Verification" : "Phone Verification"}</h3>
                <button onClick={resetModalState} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
                </div>
              )}

              {activeModal === "phone" && (
                <div className="space-y-4">
                  {phoneStep === "input" ? (
                    <>
                      <p className="text-sm text-muted-foreground">Enter your phone number to receive a 6-digit verification code.</p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="01XXXXXXXXX"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(sanitizePhoneNumberInput(e.target.value))}
                          />
                          <Button onClick={handleSendPhoneOTP} disabled={!phoneNumber || submitting}>{submitting ? "Sending..." : "Send OTP"}</Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {phoneNumber}</p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input placeholder="000000" value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value)} maxLength={6} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setPhoneStep("input"); setPhoneOTP(""); }}>Back</Button>
                        <Button onClick={handleVerifyPhoneOTP} disabled={!phoneOTP || phoneOTP.length !== 6 || submitting} className="flex-1">{submitting ? "Verifying..." : "Verify Code"}</Button>
                      </div>
                      <button onClick={handleSendPhoneOTP} className="text-sm text-blue-500 hover:underline" disabled={submitting}>Resend OTP</button>
                    </>
                  )}
                </div>
              )}

              {activeModal === "profile" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Submit your profile for admin review. Once approved, your blue verified badge will be activated.</p>
                  <Button onClick={handleSubmitProfileVerification} disabled={submitting} className="w-full">{submitting ? "Submitting..." : "Submit profile for review"}</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

const MIN_VERIFIED_TYPES = 2;