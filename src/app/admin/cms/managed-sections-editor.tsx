"use client";

import * as React from "react";
import { ImagePlus, Loader2, Save, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import type { ManagedPageSection } from "@/components/seo/managed-page-content";
import { adminFetch } from "@/lib/admin-fetch";

export function ManagedSectionsEditor({
  sections,
  onSave,
}: {
  sections: ManagedPageSection[];
  onSave: (sections: ManagedPageSection[]) => Promise<void>;
}) {
  const [draft, setDraft] = React.useState(sections);
  const [uploading, setUploading] = React.useState("");
  const update = (index: number, patch: Partial<ManagedPageSection>) =>
    setDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    patch: Partial<ManagedPageSection["items"][number]>,
  ) =>
    setDraft((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, childIndex) =>
                childIndex === itemIndex ? { ...item, ...patch } : item,
              ),
            }
          : section,
      ),
    );
  const upload = async (
    file: File,
    key: string,
    done: (url: string) => void,
  ) => {
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await adminFetch("/api/admin/site-pages/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) done(data.url);
    } finally {
      setUploading("");
    }
  };
  return (
    <div className="space-y-5">
      {draft.map((section, index) => (
        <details
          key={section.id}
          open={index === 0}
          className="rounded-xl border bg-white"
        >
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold">
            <span className="mr-3 text-emerald-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            {section.title || section.id}
          </summary>
          <div className="space-y-4 border-t p-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.visible}
                onChange={(event) =>
                  update(index, { visible: event.target.checked })
                }
              />
              Show this section
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Eyebrow (বাংলা)" value={section.eyebrowBn || section.eyebrow} onChange={(event) => update(index, { eyebrowBn: event.target.value })} />
              <Input label="Eyebrow (English)" value={section.eyebrowEn || section.eyebrow} onChange={(event) => update(index, { eyebrowEn: event.target.value })} />
              <Input label="Title (বাংলা)" value={section.titleBn || section.title} onChange={(event) => update(index, { titleBn: event.target.value })} />
              <Input label="Title (English)" value={section.titleEn || section.title} onChange={(event) => update(index, { titleEn: event.target.value })} />
            </div>
            <label className="block text-sm font-medium">
              Description (বাংলা)
              <textarea
                className="mt-1 min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                value={section.descriptionBn || section.description}
                onChange={(event) =>
                  update(index, { descriptionBn: event.target.value })
                }
              />
            </label>
            <label className="block text-sm font-medium">Description (English)<textarea className="mt-1 min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" value={section.descriptionEn || section.description} onChange={(event) => update(index, { descriptionEn: event.target.value })} /></label>
            <ImageField
              label="Section image"
              value={section.imageUrl}
              busy={uploading === section.id}
              onChange={(file) =>
                void upload(file, section.id, (url) =>
                  update(index, { imageUrl: url }),
                )
              }
            />
            <Input
              label="Image alt text"
              value={section.imageAlt}
              onChange={(event) =>
                update(index, { imageAlt: event.target.value })
              }
            />
            {section.buttonText !== "" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Button text"
                  value={section.buttonText}
                  onChange={(event) =>
                    update(index, { buttonText: event.target.value })
                  }
                />
                <Input
                  label="Button link"
                  value={section.buttonLink}
                  onChange={(event) =>
                    update(index, { buttonLink: event.target.value })
                  }
                />
              </div>
            ) : null}
            {section.items.length || section.id === "gallery" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Items</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update(index, {
                        items: [
                          ...section.items,
                          {
                            title: "New item",
                            titleBn: "",
                            titleEn: "New item",
                            text: "",
                            textBn: "",
                            textEn: "",
                            imageUrl: "",
                            imageAlt: "",
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add item
                  </Button>
                </div>
                {section.items.map((item, itemIndex) => (
                  <div
                    key={`${section.id}-${itemIndex}`}
                    className="grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <Input
                      label="Item title (বাংলা)"
                      value={item.titleBn || item.title}
                      onChange={(event) =>
                        updateItem(index, itemIndex, {
                          titleBn: event.target.value,
                        })
                      }
                    />
                    <Input
                      label="Item title (English)"
                      value={item.titleEn || item.title}
                      onChange={(event) => updateItem(index, itemIndex, { titleEn: event.target.value })}
                    />
                    <Input
                      label="Item text (বাংলা)"
                      value={item.textBn || item.text}
                      onChange={(event) =>
                        updateItem(index, itemIndex, {
                          textBn: event.target.value,
                        })
                      }
                    />
                    <Input label="Item text (English)" value={item.textEn || item.text} onChange={(event) => updateItem(index, itemIndex, { textEn: event.target.value })} />
                    <button
                      type="button"
                      className="self-end p-2 text-red-600"
                      aria-label="Remove item"
                      onClick={() =>
                        update(index, {
                          items: section.items.filter(
                            (_, childIndex) => childIndex !== itemIndex,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ImageField
                      label="Item image"
                      value={item.imageUrl || ""}
                      busy={uploading === `${section.id}-${itemIndex}`}
                      onChange={(file) =>
                        void upload(file, `${section.id}-${itemIndex}`, (url) =>
                          updateItem(index, itemIndex, { imageUrl: url }),
                        )
                      }
                    />
                    <Input
                      label="Item image alt"
                      value={item.imageAlt || ""}
                      onChange={(event) =>
                        updateItem(index, itemIndex, {
                          imageAlt: event.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ))}
      <Button type="button" onClick={() => void onSave(draft)}>
        <Save className="mr-2 h-4 w-4" />
        Save page sections
      </Button>
    </div>
  );
}

function ImageField({
  label,
  value,
  busy,
  onChange,
}: {
  label: string;
  value: string;
  busy: boolean;
  onChange: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        <Image
          src={value}
          alt="Selected preview"
          fill
          className="h-28 w-48 rounded-xl object-cover"
          sizes="192px"
        />
      ) : null}
      <label className="inline-flex cursor-pointer items-center rounded-lg border bg-white px-3 py-2 text-sm font-medium">
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {busy ? "Uploading..." : "Choose image"}
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}
