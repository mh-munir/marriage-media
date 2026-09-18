"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-fetch";

export interface BlogRecord {
  _id: string;
  title: string;
  category?: string;
  isPublished?: boolean;
  createdAt: string;
  likes?: number;
}

interface BlogEditorProps {
  onCreated: (blog: BlogRecord) => void;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
}

const initialForm = {
  titleBn: "",
  titleEn: "",
  categoryBn: "সাধারণ",
  categoryEn: "General",
  excerptBn: "",
  excerptEn: "",
  contentBn: "",
  contentEn: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  featuredImage: "",
  likes: "610",
  isPublished: false,
};

export function BlogEditor({ onCreated, onMessage, onError }: BlogEditorProps) {
  const [form, setForm] = React.useState(initialForm);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  function update(field: keyof typeof initialForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    onError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await adminFetch("/api/admin/site-pages/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      update("featuredImage", data.url);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if ((!form.titleBn.trim() && !form.titleEn.trim()) || (!form.contentBn.trim() && !form.contentEn.trim())) {
      onError("At least one language is required for title and content.");
      return;
    }
    setSaving(true);
    onError("");
    onMessage("");
    try {
      const response = await adminFetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.titleEn.trim() || form.titleBn.trim(),
          titleBn: form.titleBn.trim(),
          titleEn: form.titleEn.trim(),
          category: form.categoryEn.trim() || form.categoryBn.trim() || "General",
          categoryBn: form.categoryBn.trim(),
          categoryEn: form.categoryEn.trim(),
          excerpt: form.excerptEn.trim() || form.excerptBn.trim(),
          excerptBn: form.excerptBn.trim(),
          excerptEn: form.excerptEn.trim(),
          content: form.contentEn.trim() || form.contentBn.trim(),
          contentBn: form.contentBn.trim(),
          contentEn: form.contentEn.trim(),
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          metaTitle: form.metaTitle.trim(),
          metaDescription: form.metaDescription.trim(),
          featuredImage: { url: form.featuredImage, publicId: "" },
          likes: form.likes,
          isPublished: form.isPublished,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create blog");
      onCreated(data.blog);
      setForm(initialForm);
      onMessage("Blog post created successfully.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not create blog");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5 border-t p-6">
    <div className="flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-semibold">Add blog post</h3></div>
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Title (বাংলা)" value={form.titleBn} onChange={(event) => update("titleBn", event.target.value)} />
      <Input label="Title (English)" required value={form.titleEn} onChange={(event) => update("titleEn", event.target.value)} />
    </div>
    <div className="grid gap-4 md:grid-cols-2"><Input label="Category (বাংলা)" value={form.categoryBn} onChange={(event) => update("categoryBn", event.target.value)} /><Input label="Category (English)" value={form.categoryEn} onChange={(event) => update("categoryEn", event.target.value)} /></div>
    <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-medium">Excerpt (বাংলা)<textarea className="mt-1 min-h-20 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={form.excerptBn} onChange={(event) => update("excerptBn", event.target.value)} /></label><label className="block text-sm font-medium">Excerpt (English)<textarea className="mt-1 min-h-20 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={form.excerptEn} onChange={(event) => update("excerptEn", event.target.value)} /></label></div>
    <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-medium">Content (বাংলা)<textarea className="mt-1 min-h-56 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={form.contentBn} onChange={(event) => update("contentBn", event.target.value)} /></label><label className="block text-sm font-medium">Content (English)<textarea className="mt-1 min-h-56 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={form.contentEn} onChange={(event) => update("contentEn", event.target.value)} /></label></div>
    <div className="grid gap-4 md:grid-cols-3"><Input label="Tags" value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="marriage, advice, relationship" /><Input label="Meta title" value={form.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} /><Input label="Likes" type="number" min="0" value={form.likes} onChange={(event) => update("likes", event.target.value)} /></div>
    <label className="block text-sm font-medium">Meta description<textarea className="mt-1 min-h-20 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={form.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} /></label>
    <div className="space-y-2"><p className="text-sm font-medium">Featured image</p>{form.featuredImage ? <Image src={form.featuredImage} alt="Featured image preview" width={640} height={320} className="h-40 w-full max-w-md rounded-xl object-cover" /> : <div className="flex h-24 max-w-md items-center justify-center rounded-xl border border-dashed text-sm text-slate-500">No image selected</div>}<label className="inline-flex cursor-pointer items-center rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}{uploading ? "Uploading..." : "Choose image"}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ""; }} /></label></div>
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isPublished} onChange={(event) => update("isPublished", event.target.checked)} />Publish immediately</label>
    <Button type="submit" disabled={saving || uploading}><Save className="mr-2 h-4 w-4" />{saving ? "Creating..." : "Create blog post"}</Button>
  </form>;
}
