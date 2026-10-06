"use client";

import * as React from "react";
import { ImageIcon, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";

interface PendingPhoto { userId: string; username: string; photo: { url: string; publicId: string; isPrimary?: boolean } }

export default function AdminPhotosPage() {
  const [photos, setPhotos] = React.useState<PendingPhoto[]>([]);
  const [message, setMessage] = React.useState("Loading review queue...");
  const [processingPhotoId, setProcessingPhotoId] = React.useState<string | null>(null);

  async function loadPhotos() {
    const response = await adminFetch("/api/admin/photos/pending", { cache: "no-store" });
    const data = await response.json();
    setPhotos(data.pendingPhotos || []);
    setMessage(response.ok ? "" : data.error || "Could not load photos");
  }
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPhotos().catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Could not load photos");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function review(photo: PendingPhoto, action: "approve" | "reject") {
    if (
      action === "reject" &&
      !window.confirm("Reject and permanently remove this photo?")
    ) {
      return;
    }

    setProcessingPhotoId(photo.photo.publicId);
    setMessage("");
    try {
      const response = await adminFetch(`/api/admin/photos/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: photo.userId,
          publicId: photo.photo.publicId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || `Could not ${action} photo`);
        return;
      }
      setPhotos((current) =>
        current.filter((item) => item.photo.publicId !== photo.photo.publicId),
      );
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : `Could not ${action} photo`,
      );
    } finally {
      setProcessingPhotoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Trust &amp; safety</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Photo moderation</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review profile photos before they become visible to the community.
        </p>
      </div>
      {message ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.startsWith("Loading")
              ? "border-slate-200 text-slate-500"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-emerald-600" />
            {photos.length} photos awaiting review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.photo.publicId}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <Image
                      src={photo.photo.url}
                      alt={`Photo submitted by ${photo.username}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="space-y-3 p-3">
                    <p className="truncate text-sm font-semibold">{photo.username}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={processingPhotoId !== null}
                        onClick={() => void review(photo, "approve")}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        disabled={processingPhotoId !== null}
                        onClick={() => void review(photo, "reject")}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-sm text-slate-500">
              No photos are waiting for moderation.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
