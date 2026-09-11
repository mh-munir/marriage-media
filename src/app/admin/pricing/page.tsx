"use client";

import * as React from "react";
import { Check, Crown, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-fetch";
import { defaultPricingPlans, type PricingPlan } from "@/lib/pricing";

const iconMap = { crown: Crown, sparkles: Sparkles, heart: Check };

function listValue(value: string[]) {
  return value.join("\n");
}

function parseList(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function AdminPricingPage() {
  const [plans, setPlans] = React.useState<PricingPlan[]>(defaultPricingPlans);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    void adminFetch("/api/admin/pricing").then(async (response) => {
      const data = await response.json();
      if (response.ok && Array.isArray(data.plans)) setPlans(data.plans);
      else setError(data.error || "Could not load pricing plans");
      setLoading(false);
    });
  }, []);

  function updatePlan(index: number, patch: Partial<PricingPlan>) {
    setPlans((current) => current.map((plan, planIndex) => planIndex === index ? { ...plan, ...patch } : plan));
  }

  async function savePlans(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await adminFetch("/api/admin/pricing", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plans }) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save pricing plans");
        return;
      }
      setPlans(data.plans);
      setMessage("Pricing plans saved successfully.");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading pricing plans...</div>;

  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Insights & tools</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Pricing plans</h2><p className="mt-2 text-sm text-slate-500">Manage the Basic, Gold, and Premium plans shown on the public pricing page.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}{message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}<form onSubmit={savePlans} className="space-y-6">{plans.map((plan, index) => { const Icon = iconMap[plan.icon as keyof typeof iconMap] || Check; return <Card key={plan.id}><CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-emerald-600" />{plan.name}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><Input label="Plan name" value={plan.name} disabled /><Input label="Price" value={plan.price} onChange={(event) => updatePlan(index, { price: event.target.value })} /><Input label="Billing text" value={plan.period} onChange={(event) => updatePlan(index, { period: event.target.value })} /><Input label="Description" value={plan.description} onChange={(event) => updatePlan(index, { description: event.target.value })} /></div><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={plan.popular} onChange={(event) => updatePlan(index, { popular: event.target.checked })} />Show Most Popular badge</label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-medium">Included features<textarea className="mt-1 min-h-40 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={listValue(plan.features)} onChange={(event) => updatePlan(index, { features: parseList(event.target.value) })} /></label><label className="block text-sm font-medium">Not included features<textarea className="mt-1 min-h-40 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={listValue(plan.notIncluded)} onChange={(event) => updatePlan(index, { notIncluded: parseList(event.target.value) })} /></label></div></CardContent></Card>; })}<Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save pricing plans"}</Button></form></div>;
}
