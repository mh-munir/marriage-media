"use client";

import * as React from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeSection } from "@/components/seo/home-page-override";
import { adminFetch } from "@/lib/admin-fetch";

export function HomeSectionsEditor({ sections, onSave }: { sections: HomeSection[]; onSave: (sections: HomeSection[]) => Promise<void> }) {
  const [draft, setDraft] = React.useState(sections);
  const [uploading, setUploading] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => setDraft(sections), [sections]);

  function update(index: number, patch: Partial<HomeSection>) {
    setDraft((current) => current.map((section, itemIndex) => itemIndex === index ? { ...section, ...patch } : section));
  }

  function updateItem(sectionIndex: number, itemIndex: number, patch: Partial<HomeSection["items"][number]>) {
    setDraft((current) => current.map((section, index) => index === sectionIndex ? { ...section, items: section.items.map((item, childIndex) => childIndex === itemIndex ? { ...item, ...patch } : item) } : section));
  }

  function addItem(sectionIndex: number) {
    setDraft((current) => current.map((section, index) => index === sectionIndex ? { ...section, items: [...section.items, { title: "New item", text: "Write item description", imageUrl: "", imageAlt: "" }] } : section));
  }

  function removeItem(sectionIndex: number, itemIndex: number) {
    setDraft((current) => current.map((section, index) => index === sectionIndex ? { ...section, items: section.items.filter((_, childIndex) => childIndex !== itemIndex) } : section));
  }

  async function uploadImage(file: File, key: string, onUploaded: (url: string) => void) {
    setError("");
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await adminFetch("/api/admin/site-pages/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      onUploaded(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed");
    } finally {
      setUploading("");
    }
  }

  return <div className="space-y-5">
    {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
    {draft.map((section, index) => <details key={section.id} open={index === 0} className="rounded-xl border bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 font-semibold"><span className="mr-3 text-emerald-600">{String(index + 1).padStart(2, "0")}</span>{section.title || section.id}</summary>
      <div className="space-y-4 border-t p-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.visible} onChange={(event) => update(index, { visible: event.target.checked })} />Show this section</label>
        <div className="grid gap-4 md:grid-cols-2"><Input label="Eyebrow / label" value={section.eyebrow} onChange={(event) => update(index, { eyebrow: event.target.value })} /><Input label="Section title" value={section.title} onChange={(event) => update(index, { title: event.target.value })} /></div>
        <label className="block text-sm font-medium">Description<textarea className="mt-1 min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={section.description} onChange={(event) => update(index, { description: event.target.value })} /></label>
        {section.type !== "community" ? <><ImageUpload label="Section image" value={section.imageUrl} uploading={uploading === `section-${section.id}`} onChange={(file) => void uploadImage(file, `section-${section.id}`, (url) => update(index, { imageUrl: url }))} /><Input label="Image alt text" value={section.imageAlt} onChange={(event) => update(index, { imageAlt: event.target.value })} /></> : null}
        {section.type === "hero" ? <><ImageUpload label="Hero secondary image" value={section.secondaryImageUrl || ""} uploading={uploading === `secondary-${section.id}`} onChange={(file) => void uploadImage(file, `secondary-${section.id}`, (url) => update(index, { secondaryImageUrl: url }))} /><Input label="Secondary image alt text" value={section.secondaryImageAlt || ""} onChange={(event) => update(index, { secondaryImageAlt: event.target.value })} /></> : null}
        {section.type !== "hero" ? <div className="grid gap-4 md:grid-cols-2"><Input label="Button text" value={section.buttonText} onChange={(event) => update(index, { buttonText: event.target.value })} /><Input label="Button link" value={section.buttonLink} onChange={(event) => update(index, { buttonLink: event.target.value })} /></div> : null}
        {section.items.length || section.type === "values" || section.type === "steps" ? <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Cards / steps</p><Button type="button" size="sm" variant="outline" onClick={() => addItem(index)}><Plus className="mr-1 h-4 w-4" />Add item</Button></div>{section.items.map((item, itemIndex) => <div key={`${section.id}-${itemIndex}`} className="grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]"><Input label="Title" value={item.title} onChange={(event) => updateItem(index, itemIndex, { title: event.target.value })} /><Input label="Text" value={item.text} onChange={(event) => updateItem(index, itemIndex, { text: event.target.value })} /><button type="button" className="self-end p-2 text-red-600" aria-label="Remove item" onClick={() => removeItem(index, itemIndex)}><Trash2 className="h-4 w-4" /></button><ImageUpload label="Item image" value={item.imageUrl || ""} uploading={uploading === `item-${section.id}-${itemIndex}`} onChange={(file) => void uploadImage(file, `item-${section.id}-${itemIndex}`, (url) => updateItem(index, itemIndex, { imageUrl: url }))} /><Input label="Item image alt" value={item.imageAlt || ""} onChange={(event) => updateItem(index, itemIndex, { imageAlt: event.target.value })} /></div>)}</div> : null}
      </div>
    </details>)}
    <Button type="button" onClick={() => void onSave(draft)}><Save className="mr-2 h-4 w-4" />Save Home sections</Button>
  </div>;
}

function ImageUpload({ label, value, uploading, onChange }: { label: string; value: string; uploading: boolean; onChange: (file: File) => void }) {
  return <div className="space-y-2"><p className="text-sm font-medium">{label}</p>{value ? <img src={value} alt="Selected upload preview" className="h-32 w-full rounded-xl object-cover" /> : <div className="flex h-24 items-center justify-center rounded-xl border border-dashed text-sm text-slate-500">No image selected</div>}<label className="inline-flex cursor-pointer items-center rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}{uploading ? "Uploading..." : "Choose image"}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange(file); event.currentTarget.value = ""; }} /></label></div>;
}
