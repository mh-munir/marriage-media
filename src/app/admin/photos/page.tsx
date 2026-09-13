"use client";

import * as React from "react";
import { ImageIcon, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PendingPhoto { userId: string; username: string; photo: { url: string; publicId: string; isPrimary?: boolean } }

export default function AdminPhotosPage() {
  const [photos, setPhotos] = React.useState<PendingPhoto[]>([]);
  const [message, setMessage] = React.useState("Loading review queue...");

  async function loadPhotos() {
    const response = await fetch("/api/admin/photos/pending", { credentials: "include" });
    const data = await response.json();
    setPhotos(data.pendingPhotos || []);
    setMessage(response.ok ? "" : data.error || "Could not load photos");
  }
  React.useEffect(() => {
    // Use setTimeout to avoid synchronous state update in effect
    setTimeout(() => loadPhotos(), 0);
  }, []);

  async function review(photo: PendingPhoto) {
    await fetch("/api/admin/photos/approve", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ userId: photo.userId, publicId: photo.photo.publicId }) });
    setPhotos((current) => current.filter((item) => item.photo.publicId !== photo.photo.publicId));
  }

    return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Trust & safety</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Photo moderation</h2><p className="mt-2 text-sm text-slate-500">Review profile photos before they become visible to the community.</p></div>{message ? <div className={`rounded-xl border p-4 text-sm ${message.startsWith("Loading") ? "border-slate-200 text-slate-500" : "border-red-200 bg-red-50 text-red-700"}`}>{message}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-emerald-600" /> {photos.length} photos awaiting review</CardTitle></CardHeader><CardContent>{photos.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{photos.map((photo) => <div key={photo.photo.publicId} className="overflow-hidden rounded-xl border"><Image src={photo.photo.url} alt={`Photo submitted by ${photo.username}`} fill className="aspect-square w-full object-cover" sizes="100vw" /><div className="space-y-3 p-3"><p className="truncate text-sm font-semibold">{photo.username}</p><Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => void review(photo)}><Check className="mr-1 h-4 w-4" />Approve</Button></div></div>)}</div> : <div className="py-14 text-center text-sm text-slate-500">No photos are waiting for moderation.</div>}</CardContent></Card></div>;
}
