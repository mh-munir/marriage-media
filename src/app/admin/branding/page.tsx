"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin-fetch";

type BrandingPosition = "header" | "footer" | "favicon";
type Branding = { headerLogoUrl: string; footerLogoUrl: string; faviconUrl: string };

const emptyBranding: Branding = { headerLogoUrl: "", footerLogoUrl: "", faviconUrl: "" };

export default function AdminBrandingPage() {
  const [branding, setBranding] = React.useState<Branding>(emptyBranding);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState<BrandingPosition | "">("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    void adminFetch("/api/admin/site-branding").then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        setBranding({ headerLogoUrl: data.headerLogoUrl || "", footerLogoUrl: data.footerLogoUrl || "", faviconUrl: data.faviconUrl || "" });
      } else {
        setError(data.error || "Could not load branding settings");
      }
      setLoading(false);
    }).catch(() => {
      setError("Could not load branding settings");
      setLoading(false);
    });
  }, []);

  async function upload(position: BrandingPosition, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setUploading(position);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await adminFetch("/api/admin/site-pages/upload", { method: "POST", body: formData });
    const data = await response.json();
    setUploading("");
    if (!response.ok) {
      setError(data.error || "Could not upload branding asset");
      return;
    }
    const field = position === "header" ? "headerLogoUrl" : position === "footer" ? "footerLogoUrl" : "faviconUrl";
    setBranding((current) => ({ ...current, [field]: data.url }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const response = await adminFetch("/api/admin/site-branding", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(branding) });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save branding settings");
      return;
    }
    setBranding({ headerLogoUrl: data.branding.headerLogoUrl || "", footerLogoUrl: data.branding.footerLogoUrl || "", faviconUrl: data.branding.faviconUrl || "" });
    setMessage("Branding settings saved. Refresh the public site to view the changes.");
  }

  const cards: Array<{ position: BrandingPosition; label: string; field: keyof Branding; description: string }> = [
    { position: "header", label: "Header logo", field: "headerLogoUrl", description: "Displayed in the public website header." },
    { position: "footer", label: "Footer logo", field: "footerLogoUrl", description: "Displayed in the public website footer." },
    { position: "favicon", label: "Favicon", field: "faviconUrl", description: "Displayed in browser tabs and bookmarks." },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div><p className="text-sm font-semibold text-emerald-600">Site settings</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Logo & branding</h2><p className="mt-2 text-sm text-slate-500">Manage the public website logos and browser favicon.</p></div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-emerald-600" />Public branding assets</CardTitle></CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {cards.map(({ position, label, field, description }) => {
            const value = branding[field];
            const isFavicon = position === "favicon";
            return <div key={position} className="space-y-3 rounded-xl border p-4"><div><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div><div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">{value ? <Image src={value} alt={`${label} preview`} fill unoptimized className={isFavicon ? "object-contain p-8" : "object-contain p-3"} /> : <span className="text-sm text-slate-400">Default {label.toLowerCase()}</span>}</div><label className="block text-sm font-medium">Image URL<input value={value} onChange={(event) => setBranding((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." /></label><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">{uploading === position ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading === position ? "Uploading..." : `Upload ${label.toLowerCase()}`}<input type="file" accept="image/*,.ico" className="sr-only" disabled={Boolean(uploading)} onChange={(event) => void upload(position, event)} /></label></div>;
          })}
          <div className="lg:col-span-3"><Button onClick={() => void save()} disabled={loading || saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save branding settings"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
