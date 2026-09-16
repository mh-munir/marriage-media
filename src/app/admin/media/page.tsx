"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Copy, ImagePlus, Images, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";

type MediaAsset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  return `${(bytes / 1024 / 1024).toFixed(bytes > 1024 * 1024 ? 1 : 0)} MB`;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = React.useState<MediaAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState("");

  async function loadAssets() {
    setLoading(true);
    const response = await adminFetch("/api/admin/site-pages/upload");
    const data = await response.json();
    setAssets(data.assets || []);
    setError(response.ok ? "" : data.error || "Could not load media library");
    setLoading(false);
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadAssets(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function uploadAsset(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await adminFetch("/api/admin/site-pages/upload", { method: "POST", body: formData });
    const data = await response.json();
    setUploading(false);
    if (!response.ok) {
      setError(data.error || "Image upload failed");
      return;
    }
    setMessage("Image uploaded successfully.");
    await loadAssets();
  }

  async function deleteAsset(asset: MediaAsset) {
    if (!window.confirm("Delete this image from the media library?")) return;
    const response = await adminFetch(`/api/admin/site-pages/upload?publicId=${encodeURIComponent(asset.publicId)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not delete image");
      return;
    }
    setAssets((current) => current.filter((item) => item.publicId !== asset.publicId));
    setMessage("Image deleted.");
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Content operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Media library</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Upload, review, and reuse the images that power your public pages and stories.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0d1b2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload image"}
          <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => void uploadAsset(event)} />
        </label>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Images className="h-5 w-5 text-emerald-600" />{assets.length} assets</CardTitle>
          <span className="text-xs text-slate-500">Cloudinary · site-pages/home</span>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex items-center justify-center py-16 text-sm text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading media...</div> : assets.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assets.map((asset) => <article key={asset.publicId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-4/3 bg-slate-100"><Image src={asset.url} alt={asset.publicId.split("/").pop() || "Uploaded media"} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover" /></div>
                <div className="space-y-3 p-3">
                  <div><p className="truncate text-sm font-semibold text-slate-800">{asset.publicId.split("/").pop()}</p><p className="mt-1 text-xs text-slate-500">{asset.width} × {asset.height} · {formatBytes(asset.bytes)}</p></div>
                  <div className="flex gap-2"><Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => void copyUrl(asset.url)}>{copied === asset.url ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}{copied === asset.url ? "Copied" : "Copy URL"}</Button><Button type="button" variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => void deleteAsset(asset)} aria-label="Delete image"><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              </article>)}
            </div>
          ) : <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center"><ImagePlus className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No media uploaded yet</p><p className="mt-1 text-xs text-slate-500">Upload your first website image to get started.</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
