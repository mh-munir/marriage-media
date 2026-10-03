"use client";

import * as React from "react";
import { Check, FileCheck2, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingFormSummary } from "@/components/admin/onboarding-form-summary";

interface Verification {
  _id: string;
  type: string;
  status: string;
  createdAt: string;
  userId?: {
    _id?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    onboardingData?: Record<string, unknown>;
    onboardingStep?: number;
    onboardingCompleted?: boolean;
    isActive?: boolean;
    isBlocked?: boolean;
    createdAt?: string;
  } | string;
  profile?: Record<string, unknown> & {
    firstName?: string;
    lastName?: string;
    profileCompleted?: number;
    photos?: Array<{ url: string; isPrimary?: boolean }>;
  } | null;
}

function ProfileReviewModal({ item, onClose, onReview }: { item: Verification; onClose: () => void; onReview: (status: "approved" | "rejected") => void }) {
  const member = typeof item.userId === "object" ? item.userId : null;
  const onboardingData = member?.onboardingData || {};
  const photos = Array.isArray(onboardingData.photos)
    ? (onboardingData.photos as Array<{ url?: string }>).filter(
        (photo): photo is { url: string } => typeof photo.url === "string" && photo.url.length > 0
      )
    : [];
  const firstName = typeof onboardingData.firstName === "string" ? onboardingData.firstName : member?.firstName || "Member";
  const lastName = typeof onboardingData.lastName === "string" ? onboardingData.lastName : member?.lastName || "";
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Profile review">
      <div className="mx-auto flex min-h-full max-w-5xl items-center py-2">
        <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-xl border border-white/70 bg-slate-50 shadow-2xl">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">{displayName.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Onboarding review</p><h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{displayName}</h2></div>
            </div>
            <button type="button" onClick={onClose} className="ml-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close review"><X className="h-5 w-5" /></button>
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {photos.length ? (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Submitted photos</h3></div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">{photos.map((photo, index) => <div key={photo.url || index} className="relative aspect-square overflow-hidden rounded-md bg-slate-100"><Image src={photo.url} alt={`Profile photo ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" /></div>)}</div>
              </section>
            ) : null}
            <OnboardingFormSummary onboardingData={onboardingData} />
          </div>
          <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="outline" className="text-red-600" onClick={() => onReview("rejected")}><X className="mr-1 h-4 w-4" />Reject</Button>
            <Button onClick={() => onReview("approved")}><Check className="mr-1 h-4 w-4" />Approve</Button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerificationPage() {
  const [items, setItems] = React.useState<Verification[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<Verification | null>(null);
  const [error, setError] = React.useState("");

  async function load() {
    const response = await adminFetch("/api/admin/verifications?status=pending&limit=50", { cache: "no-store" });
    const data = await response.json();
    setItems(data.verifications || []);
    setError(response.ok ? "" : data.error || "Could not load verifications");
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load verifications");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    const response = await adminFetch("/api/admin/verifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationId: id, status }) });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Could not update review status");
      return;
    }
    setItems((current) => current.filter((item) => item._id !== id));
    setSelectedItem(null);
  }

  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Trust & safety</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Public profile review</h2><p className="mt-2 text-sm text-slate-500">Click a pending profile to inspect all submitted information before approval.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-emerald-600" /> {items.length} pending public profiles</CardTitle></CardHeader><CardContent className="space-y-3">{items.length ? items.map((item) => { const member = typeof item.userId === "object" ? item.userId : null; return <button type="button" key={item._id} onClick={() => setSelectedItem(item)} className="flex w-full flex-col gap-3 rounded-xl border bg-white p-4 text-left transition hover:border-emerald-400 hover:shadow-md sm:flex-row sm:items-center">{item.profile?.photos?.[0]?.url ? <Image src={item.profile.photos[0].url} alt={`${item.profile.firstName || "Member"} profile`} width={80} height={80} className="rounded-xl object-cover" /> : <div className="h-20 w-20 rounded-xl bg-slate-100" />}<div className="flex-1"><p className="font-semibold">{item.profile ? `${item.profile.firstName || ""} ${item.profile.lastName || ""}`.trim() : member?.email || "Unknown member"}</p><p className="mt-1 text-sm text-slate-500">{member?.phone || "No phone"} · {member?.email || "No email"}</p><p className="mt-1 text-xs text-slate-500">{item.profile?.profileCompleted || 100}% complete · {new Date(item.createdAt).toLocaleString()}</p></div><Badge variant="secondary">View review</Badge></button>; }) : <p className="py-10 text-center text-sm text-slate-500">No public profiles are waiting for approval.</p>}</CardContent></Card>{selectedItem ? <ProfileReviewModal item={selectedItem} onClose={() => setSelectedItem(null)} onReview={(status) => void review(selectedItem._id, status)} /> : null}</div>;
}
