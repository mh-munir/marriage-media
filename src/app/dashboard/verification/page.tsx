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

type ActiveModal =
  | null
  | "phone"
  | "email"
  | "nid"
  | "passport"
  | "face"
  | "selfie";

export default function VerificationPage() {
  const [data, setData] = React.useState<VerificationData | null>(null);
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedVerification, setSelectedVerification] = React.useState<Verification | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [phoneOTP, setPhoneOTP] = React.useState("");
  const [phoneStep, setPhoneStep] = React.useState<"input" | "verify">("input");

  const [emailAddress, setEmailAddress] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [emailStep, setEmailStep] = React.useState<"input" | "verify">("input");

  const [nidNumber, setNidNumber] = React.useState("");
  const [passportNumber, setPassportNumber] = React.useState("");
  const [nidFile, setNidFile] = React.useState<File | null>(null);
  const [passportFile, setPassportFile] = React.useState<File | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);

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
    setEmailAddress("");
    setEmailCode("");
    setEmailStep("input");
    setNidNumber("");
    setPassportNumber("");
    setNidFile(null);
    setPassportFile(null);
    setSelfieFile(null);
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
        // In development, auto-fill OTP
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

  async function handleSendEmailVerification() {
    if (!emailAddress) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verification/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });
      const result = await res.json();
      if (res.ok) {
        setEmailStep("verify");
        setSuccess("Verification code sent to your email!");
      } else {
        setError(result.error || "Failed to send verification email");
      }
    } catch {
      setError("Failed to send verification email");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyEmail() {
    if (!emailCode) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verification/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: emailCode }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Email verified successfully!");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 1500);
      } else {
        setError(result.error || "Failed to verify email");
      }
    } catch {
      setError("Failed to verify email");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNIDSubmit() {
    if (!nidNumber || !nidFile) return;
    setSubmitting(true);
    setError("");
    try {
      // In production, upload file to Cloudinary first
      const documentUrl = URL.createObjectURL(nidFile);
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "nid",
          documentUrl,
          documentNumber: nidNumber,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("NID verification submitted! We'll review it within 1-2 business days.");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 2000);
      } else {
        setError(result.error || "Failed to submit NID verification");
      }
    } catch {
      setError("Failed to submit NID verification");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePassportSubmit() {
    if (!passportNumber || !passportFile) return;
    setSubmitting(true);
    setError("");
    try {
      const documentUrl = URL.createObjectURL(passportFile);
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "passport",
          documentUrl,
          documentNumber: passportNumber,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Passport verification submitted! We'll review it within 1-2 business days.");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 2000);
      } else {
        setError(result.error || "Failed to submit passport verification");
      }
    } catch {
      setError("Failed to submit passport verification");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFaceSubmit() {
    if (!selfieFile) return;
    setSubmitting(true);
    setError("");
    try {
      const selfieUrl = URL.createObjectURL(selfieFile);
      const res = await fetch("/api/verification/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieUrl, type: "face" }),
      });
      const result = await res.json();
      if (res.ok) {
        const score = result.verification?.faceMatchScore;
        setSuccess(
          score
            ? `Face verified! Match confidence: ${score}%`
            : "Face verification submitted for review."
        );
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 2000);
      } else {
        setError(result.error || "Failed to submit face verification");
      }
    } catch {
      setError("Failed to submit face verification");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelfieSubmit() {
    if (!selfieFile) return;
    setSubmitting(true);
    setError("");
    try {
      const selfieUrl = URL.createObjectURL(selfieFile);
      const res = await fetch("/api/verification/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieUrl, type: "selfie" }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Selfie submitted for review!");
        await fetchVerificationData();
        setTimeout(() => resetModalState(), 2000);
      } else {
        setError(result.error || "Failed to submit selfie");
      }
    } catch {
      setError("Failed to submit selfie");
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
  const totalSteps = data?.totalSteps || 6;
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
              Complete verification steps to earn your verified badge and build trust
            </p>
          </motion.div>

          {/* Verified Badge / Status Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      badge?.isVerified
                        ? "bg-blue-500/10"
                        : progress > 0
                          ? "bg-yellow-500/10"
                          : "bg-muted"
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
                        : `Complete ${MIN_VERIFIED_TYPES} verification types to earn the blue verified badge. You've completed ${completedSteps.length} of ${totalSteps} steps.`}
                    </p>

                    {/* Progress bar */}
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

                    {badge?.isVerified && (
                      <TrustScoreBar score={badge.trustScore} className="mt-3" />
                    )}
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

          {/* Verification Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Verification Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VerificationSteps
                  verifications={verifications}
                  onStepAction={handleStepAction}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification History & Timeline */}
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
                            onClick={() =>
                              setSelectedVerification(isExpanded ? null : v)
                            }
                          >
                            <div className={`p-2 rounded-lg ${vs.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${vs.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm capitalize">
                                  {v.type} Verification
                                </span>
                                <Badge
                                  variant={
                                    v.status === "approved"
                                      ? "default"
                                      : v.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {vs.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Submitted {new Date(v.createdAt).toLocaleDateString()}
                                {v.faceMatchScore && ` • Match: ${v.faceMatchScore}%`}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
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
                                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        Rejection Reason
                                      </p>
                                      <p className="text-sm text-red-500 dark:text-red-300">
                                        {v.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                  {v.documentNumber && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Document: <span className="font-mono">{v.documentNumber}</span>
                                    </p>
                                  )}
                                  {v.value && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Value: <span className="font-mono">{v.value}</span>
                                    </p>
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

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Benefits of Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: "Blue Verified Badge", desc: "Show a verified badge on your profile for instant credibility", icon: ShieldCheck },
                    { title: "3x More Views", desc: "Verified profiles get significantly more profile views", icon: Sparkles },
                    { title: "Higher Trust", desc: "Other members are more likely to respond to verified profiles", icon: CheckCircle },
                  ].map((benefit) => (
                    <div key={benefit.title} className="text-center p-4 rounded-xl bg-accent/50">
                      <benefit.icon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Verification Modals */}
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
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold capitalize">
                  {activeModal === "face"
                    ? "Face Verification"
                    : activeModal === "selfie"
                      ? "Selfie Match"
                      : `${activeModal} Verification`}
                </h3>
                <button
                  onClick={resetModalState}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error/Success Messages */}
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

              {/* Phone Verification Modal */}
              {activeModal === "phone" && (
                <div className="space-y-4">
                  {phoneStep === "input" ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Enter your phone number to receive a 6-digit verification code.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="01XXXXXXXXX"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(sanitizePhoneNumberInput(e.target.value))}
                          />
                          <Button
                            onClick={handleSendPhoneOTP}
                            disabled={!phoneNumber || submitting}
                          >
                            {submitting ? "Sending..." : "Send OTP"}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to {phoneNumber}
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input
                          placeholder="000000"
                          value={phoneOTP}
                          onChange={(e) => setPhoneOTP(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPhoneStep("input");
                            setPhoneOTP("");
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleVerifyPhoneOTP}
                          disabled={!phoneOTP || phoneOTP.length !== 6 || submitting}
                          className="flex-1"
                        >
                          {submitting ? "Verifying..." : "Verify Code"}
                        </Button>
                      </div>
                      <button
                        onClick={handleSendPhoneOTP}
                        className="text-sm text-blue-500 hover:underline"
                        disabled={submitting}
                      >
                        Resend OTP
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Email Verification Modal */}
              {activeModal === "email" && (
                <div className="space-y-4">
                  {emailStep === "input" ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Enter your email address to receive a verification code.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                          />
                          <Button
                            onClick={handleSendEmailVerification}
                            disabled={!emailAddress || submitting}
                          >
                            {submitting ? "Sending..." : "Send Code"}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to {emailAddress}
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input
                          placeholder="000000"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEmailStep("input");
                            setEmailCode("");
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleVerifyEmail}
                          disabled={!emailCode || emailCode.length !== 6 || submitting}
                          className="flex-1"
                        >
                          {submitting ? "Verifying..." : "Verify Code"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* NID Verification Modal */}
              {activeModal === "nid" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a clear photo of your National ID card (NID). Both front and back should be visible.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">NID Number</label>
                    <Input
                      placeholder="Enter your NID number"
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload NID Photo</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="nid-upload"
                        onChange={(e) => setNidFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="nid-upload" className="cursor-pointer">
                        {nidFile ? (
                          <div className="flex items-center gap-2 justify-center">
                            <FileCheck className="h-6 w-6 text-emerald-500" />
                            <span className="text-sm">{nidFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={handleNIDSubmit}
                    disabled={!nidNumber || !nidFile || submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit NID Verification"}
                  </Button>
                </div>
              )}

              {/* Passport Verification Modal */}
              {activeModal === "passport" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a clear photo of your passport information page.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Passport Number</label>
                    <Input
                      placeholder="Enter your passport number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Passport Photo</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="passport-upload"
                        onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="passport-upload" className="cursor-pointer">
                        {passportFile ? (
                          <div className="flex items-center gap-2 justify-center">
                            <FileCheck className="h-6 w-6 text-emerald-500" />
                            <span className="text-sm">{passportFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={handlePassportSubmit}
                    disabled={!passportNumber || !passportFile || submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Passport Verification"}
                  </Button>
                </div>
              )}

              {/* Face Verification Modal */}
              {activeModal === "face" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our AI will match your selfie against your profile photos to verify your identity. Make sure your face is clearly visible.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Selfie</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="face-upload"
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="face-upload" className="cursor-pointer">
                        {selfieFile ? (
                          <div className="flex items-center gap-2 justify-center">
                            <ScanFace className="h-6 w-6 text-emerald-500" />
                            <span className="text-sm">{selfieFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Take or upload a clear selfie
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Face must be clearly visible, no sunglasses
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={handleFaceSubmit}
                    disabled={!selfieFile || submitting}
                    className="w-full"
                  >
                    {submitting ? "Processing..." : "Start Face Verification"}
                  </Button>
                </div>
              )}

              {/* Selfie Match Modal */}
              {activeModal === "selfie" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a recent selfie for manual review. This helps us confirm you&apos;re the person in your profile photos.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Selfie</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="selfie-upload"
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="selfie-upload" className="cursor-pointer">
                        {selfieFile ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Camera className="h-6 w-6 text-emerald-500" />
                            <span className="text-sm">{selfieFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload a selfie
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Natural lighting, face clearly visible
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={handleSelfieSubmit}
                    disabled={!selfieFile || submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Selfie"}
                  </Button>
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