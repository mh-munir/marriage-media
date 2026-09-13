"use client";

import * as React from "react";
import { Check, Clock3, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";

type ManualPayment = { id: string; amount: number; currency: string; plan: string; paymentMethod: string; transactionId: string; senderMobileNumber: string; status: string; createdAt: string; user: { name: string; email: string; registeredMobileNumber: string } };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState<ManualPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState("");
  const [error, setError] = React.useState("");

  const loadPayments = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await adminFetch("/api/admin/payments?status=pending");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load payments");
      setPayments(data.payments || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load payments"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadPayments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  async function review(paymentId: string, action: "approve" | "reject") {
    setUpdatingId(paymentId); setError("");
    try {
      const response = await adminFetch("/api/admin/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update payment");
      setPayments((current) => current.filter((payment) => payment.id !== paymentId));
    } catch (reviewError) { setError(reviewError instanceof Error ? reviewError.message : "Could not update payment"); }
    finally { setUpdatingId(""); }
  }

  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-600">Subscription review</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Subscription payment review</h2><p className="mt-2 text-sm text-slate-500">Review manual subscription payments, sender number, and transaction ID before approving the member&apos;s subscription.</p></div><Button variant="outline" onClick={() => void loadPayments()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-500" />{payments.length} pending subscription payment{payments.length === 1 ? "" : "s"}</CardTitle></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-8 text-center text-sm text-slate-500">Loading payments...</p> : payments.length ? payments.map((payment) => <div key={payment.id} className="rounded-xl border p-4"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"><div><p className="text-xs text-slate-500">Member</p><p className="text-sm font-medium">{payment.user.name}</p><p className="text-xs text-slate-500">{payment.user.email}</p></div><div><p className="text-xs text-slate-500">Registered number</p><p className="font-mono text-sm font-semibold">{payment.user.registeredMobileNumber || "Not available"}</p></div><div><p className="text-xs text-slate-500">Sender number</p><p className="font-mono text-sm font-semibold">{payment.senderMobileNumber}</p></div><div><p className="text-xs text-slate-500">Transaction ID</p><p className="font-mono text-sm font-semibold">{payment.transactionId}</p></div><div><p className="text-xs text-slate-500">Amount</p><p className="text-sm font-semibold">৳{payment.amount} <Badge variant="secondary" className="ml-1">{payment.paymentMethod}</Badge></p></div></div><div className="flex gap-2"><Button size="sm" onClick={() => void review(payment.id, "approve")} disabled={Boolean(updatingId)}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => void review(payment.id, "reject")} disabled={Boolean(updatingId)}><X className="mr-1 h-4 w-4" />Reject</Button></div></div><p className="mt-3 text-xs text-slate-500">{payment.plan} · submitted {new Date(payment.createdAt).toLocaleString()}</p></div>) : <p className="py-8 text-center text-sm text-slate-500">No manual payments waiting for review.</p>}</CardContent></Card></div>;
}
