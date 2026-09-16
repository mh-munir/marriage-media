"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin-fetch";

type LogoPosition = "header" | "footer";
type Branding = { headerLogoUrl: string; footerLogoUrl: string };

export default function AdminBrandingPage() {
  const [branding, setBranding] = React.useState<Branding>({ headerLogoUrl: "", footerLogoUrl: "" });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState<LogoPosition | "">("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => { void adminFetch("/api/admin/site-branding").then(async (response) => { const data = await response.json(); if (response.ok) setBranding({ headerLogoUrl: data.headerLogoUrl || "", footerLogoUrl: data.footerLogoUrl || "" }); else setError(data.error || "Could not load branding settings"); setLoading(false); }).catch(() => { setError("Could not load branding settings"); setLoading(false); }); }, []);

  async function upload(position: LogoPosition, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.currentTarget.value = ""; if (!file) return;
    setUploading(position); setError(""); const formData = new FormData(); formData.append("file", file);
    const response = await adminFetch("/api/admin/site-pages/upload", { method: "POST", body: formData }); const data = await response.json(); setUploading("");
    if (!response.ok) { setError(data.error || "Could not upload logo"); return; }
    setBranding((current) => ({ ...current, [position === "header" ? "headerLogoUrl" : "footerLogoUrl"]: data.url }));
  }
  async function save() { setSaving(true); setError(""); const response = await adminFetch("/api/admin/site-branding", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(branding) }); const data = await response.json(); setSaving(false); if (!response.ok) { setError(data.error || "Could not save logo settings"); return; } setBranding({ headerLogoUrl: data.branding.headerLogoUrl || "", footerLogoUrl: data.branding.footerLogoUrl || "" }); setMessage("Logo settings saved. Refresh the public site to view the change."); }

  return <div className="mx-auto max-w-5xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Site settings</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Logo & branding</h2><p className="mt-2 text-sm text-slate-500">Set separate image logos for the public header and footer.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}{message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-emerald-600" />Public website logos</CardTitle></CardHeader><CardContent className="grid gap-6 lg:grid-cols-2">{(["header", "footer"] as LogoPosition[]).map((position) => { const field = position === "header" ? "headerLogoUrl" : "footerLogoUrl"; const value = branding[field]; return <div key={position} className="space-y-3 rounded-xl border p-4"><p className="font-semibold capitalize">{position} logo</p><div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">{value ? <Image src={value} alt={`${position} logo preview`} fill unoptimized className="object-contain p-3" /> : <span className="text-sm text-slate-400">Default logo</span>}</div><label className="block text-sm font-medium">Image URL<input value={value} onChange={(event) => setBranding((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." /></label><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">{uploading === position ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading === position ? "Uploading..." : "Upload logo"}<input type="file" accept="image/*" className="sr-only" disabled={Boolean(uploading)} onChange={(event) => void upload(position, event)} /></label></div>; })}<div className="lg:col-span-2"><Button onClick={() => void save()} disabled={loading || saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save logo settings"}</Button></div></CardContent></Card></div>;
}
