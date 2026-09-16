"use client";

import * as React from "react";
import { Check, FileCheck2, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function Detail({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === "" || value === false) return null;
  const displayValue = Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return <div className="grid gap-1 border-b border-slate-100 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="min-w-0 wrap-break-word text-sm text-slate-800">{displayValue}</dd></div>;
}

function DataSection({ title, data, omit = [] }: { title: string; data: Record<string, unknown>; omit?: string[] }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3><dl>{Object.entries(data).filter(([key, value]) => !omit.includes(key) && value !== undefined && value !== null && value !== "" && value !== false).map(([key, value]) => <Detail key={key} label={key.replace(/([A-Z])/g, " $1")} value={value} />)}</dl></section>;
}

function ProfileReviewModal({ item, onClose, onReview }: { item: Verification; onClose: () => void; onReview: (status: "approved" | "rejected") => void }) {
  const member = typeof item.userId === "object" ? item.userId : null;
  const profile = item.profile || {};
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  const { partnerPreferences, educationDetails, permanentLocation, ...profileDetails } = profile;

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Profile review"><div className="mx-auto max-w-4xl rounded-2xl bg-slate-50 shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b bg-white px-5 py-4"><div><h2 className="text-xl font-bold text-slate-900">{profile.firstName || member?.firstName || "Member"} {profile.lastName || member?.lastName || ""}</h2><p className="text-sm text-slate-500">Full account and profile review</p></div><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close review"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-4 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{item.status}</Badge><Badge className="bg-amber-100 text-amber-800">{profile.profileCompleted || 100}% complete</Badge><span className="text-xs text-slate-500">Submitted {new Date(item.createdAt).toLocaleString()}</span></div>{photos.length ? <section className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="mb-3 text-sm font-bold text-slate-900">Profile Photos</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.map((photo, index) => <Image key={photo.url || index} src={photo.url} alt={`Profile photo ${index + 1}`} width={180} height={180} className="aspect-square w-full rounded-lg object-cover" />)}</div></section> : null}{member ? <DataSection title="Account" data={member as Record<string, unknown>} omit={["onboardingData"]} /> : null}<DataSection title="Personal Information" data={profileDetails} omit={["partnerPreference"]} />{permanentLocation && typeof permanentLocation === "object" ? <DataSection title="Permanent Location" data={permanentLocation as Record<string, unknown>} /> : null}{educationDetails && Array.isArray(educationDetails) ? <DataSection title="Education Details" data={{ educationDetails }} /> : null}{partnerPreferences && typeof partnerPreferences === "object" ? <DataSection title="Partner Preferences" data={partnerPreferences as Record<string, unknown>} /> : null}{member?.onboardingData ? <DataSection title="Onboarding Submission" data={member.onboardingData} /> : null}</div><div className="sticky bottom-0 flex justify-end gap-2 rounded-b-2xl border-t bg-white px-5 py-4"><Button variant="outline" onClick={onClose}>Close</Button><Button variant="outline" className="text-red-600" onClick={() => onReview("rejected")}><X className="mr-1 h-4 w-4" />Reject</Button><Button onClick={() => onReview("approved")}><Check className="mr-1 h-4 w-4" />Approve</Button></div></div></div>;
}

export default function AdminVerificationPage() {
  const [items, setItems] = React.useState<Verification[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<Verification | null>(null);
  const [error, setError] = React.useState("");

  async function load() {
    const response = await fetch("/api/admin/verifications?status=pending&limit=50", { credentials: "include" });
    const data = await response.json();
    setItems(data.verifications || []);
    setError(response.ok ? "" : data.error || "Could not load verifications");
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    const response = await fetch("/api/admin/verifications", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ verificationId: id, status }) });
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
