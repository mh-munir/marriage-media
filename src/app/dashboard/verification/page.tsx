"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldX, Upload, Clock, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Verification {
  _id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function VerificationPage() {
  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchVerifications();
  }, []);

  async function fetchVerifications() {
    try {
      const res = await fetch("/api/verification");
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch {
      console.error("Failed to fetch verifications");
    } finally {
      setLoading(false);
    }
  }

  async function submitVerification(type: string) {
    setSubmitting(true);
    try {
      // In production, upload document first to Cloudinary, then submit
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          documentUrl: "pending-upload",
          documentType: type,
        }),
      });

      if (res.ok) {
        await fetchVerifications();
      }
    } catch {
      console.error("Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  }

  const latestVerification = verifications[0];
  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending Review" },
    approved: { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Approved" },
    rejected: { icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" },
  };

  const currentStatus = latestVerification?.status || null;
  const StatusIcon = currentStatus ? statusConfig[currentStatus].icon : Shield;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-2">Profile Verification</h1>
            <p className="text-muted-foreground mb-8">Get verified to increase trust and visibility</p>
          </motion.div>

          {/* Current Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${currentStatus ? statusConfig[currentStatus].bg : "bg-muted"}`}>
                    <StatusIcon className={`h-6 w-6 ${currentStatus ? statusConfig[currentStatus].color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {currentStatus ? statusConfig[currentStatus].label : "Not Verified"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentStatus === "approved"
                        ? "Your profile is verified! You have a verified badge."
                        : currentStatus === "pending"
                          ? "Your verification is being reviewed. This usually takes 1-2 business days."
                          : currentStatus === "rejected"
                            ? `Reason: ${latestVerification?.rejectionReason || "Please resubmit with valid documents."}`
                            : "Verify your identity to get a verified badge and 3x more profile views."}
                    </p>
                  </div>
                  {currentStatus && (
                    <Badge variant={currentStatus === "approved" ? "default" : currentStatus === "pending" ? "secondary" : "destructive"}>
                      {statusConfig[currentStatus].label}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification Options */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { type: "photo", title: "Photo Verification", desc: "Upload a selfie to verify your identity", icon: "📸" },
              { type: "identity", title: "ID Verification", desc: "Upload a government-issued ID", icon: "🪪" },
              { type: "phone", title: "Phone Verification", desc: "Verify your phone number via OTP", icon: "📱" },
              { type: "email", title: "Email Verification", desc: "Confirm your email address", icon: "✉️" },
            ].map((option) => (
              <motion.div
                key={option.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{option.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{option.desc}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitVerification(option.type)}
                          disabled={submitting || currentStatus === "pending" || currentStatus === "approved"}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {currentStatus === "approved" ? "Verified" : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Benefits of Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: "3x More Views", desc: "Verified profiles get significantly more profile views" },
                    { title: "Higher Trust", desc: "Other members are more likely to respond to verified profiles" },
                    { title: "Verified Badge", desc: "Show a verified badge on your profile for credibility" },
                  ].map((benefit) => (
                    <div key={benefit.title} className="text-center p-4 rounded-xl bg-accent/50">
                      <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
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
      <Footer />
    </div>
  );
}