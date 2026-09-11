"use client";

import * as React from "react";
import { Check, FileCheck2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Verification { _id: string; type: string; status: string; createdAt: string; userId?: { _id?: string; email?: string } | string; profile?: { firstName?: string; lastName?: string; profileCompleted?: number; photos?: Array<{ url: string; isPrimary?: boolean }> } | null; }
export default function AdminVerificationPage() {
  const [items, setItems] = React.useState<Verification[]>([]);
  const [error, setError] = React.useState("");
  async function load() { const response = await fetch("/api/admin/verifications?status=pending&limit=50", { credentials: "include" }); const data = await response.json(); setItems(data.verifications || []); setError(response.ok ? "" : data.error || "Could not load verifications"); }
  React.useEffect(() => { void load(); }, []);
  async function review(id: string, status: "approved" | "rejected") { await fetch("/api/admin/verifications", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ verificationId: id, status }) }); setItems((current) => current.filter((item) => item._id !== id)); }
  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Trust & safety</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Verification review</h2><p className="mt-2 text-sm text-slate-500">Review completed member profiles and verification submissions before they appear publicly.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-emerald-600" /> {items.length} pending submissions</CardTitle></CardHeader><CardContent className="space-y-3">{items.length ? items.map((item) => <div key={item._id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">{item.profile?.photos?.[0]?.url ? <img src={item.profile.photos[0].url} alt={`${item.profile.firstName || "Member"} profile`} className="h-20 w-20 rounded-xl object-cover" /> : null}<div className="flex-1"><p className="font-semibold">{item.profile ? `${item.profile.firstName || ""} ${item.profile.lastName || ""}`.trim() : typeof item.userId === "object" ? item.userId.email : item.userId || "Unknown member"}</p><p className="mt-1 text-sm text-slate-500">{item.type === "profile" ? `Complete profile review · ${item.profile?.profileCompleted || 100}% complete` : `${item.type} verification`} · {new Date(item.createdAt).toLocaleString()}</p></div><Badge variant="secondary">{item.status}</Badge><div className="flex gap-2"><Button size="sm" onClick={() => void review(item._id, "approved")}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => void review(item._id, "rejected")}><X className="mr-1 h-4 w-4" />Reject</Button></div></div>) : <p className="py-10 text-center text-sm text-slate-500">No verification submissions are waiting.</p>}</CardContent></Card></div>;
}
