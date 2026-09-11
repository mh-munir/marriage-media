"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Mail, Save, Settings2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const pageOptions = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "pricing", label: "Pricing" },
  { slug: "blog", label: "Blog" },
  { slug: "success-stories", label: "Success Stories" },
];
interface SitePage { slug: string; title: string; description: string; content: string; seoTitle: string; seoDescription: string; isPublished: boolean; }
interface Blog { _id: string; title: string; category?: string; isPublished?: boolean; createdAt: string; }
interface Template { _id: string; name?: string; subject?: string; isActive?: boolean; }

export default function AdminCmsPage() {
  const searchParams = useSearchParams();
  const [section, setSection] = React.useState<"pages" | "blogs" | "email-templates">("pages");
  const [selectedSlug, setSelectedSlug] = React.useState("home");
  const [page, setPage] = React.useState<SitePage>({ slug: "home", title: "Home", description: "", content: "", seoTitle: "", seoDescription: "", isPublished: true });
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const requestedSlug = searchParams.get("slug");
    if (pageOptions.some((option) => option.slug === requestedSlug)) setSelectedSlug(requestedSlug as string);
  }, [searchParams]);

  React.useEffect(() => {
    if (section !== "pages") return;
    void fetch(`/api/admin/site-pages?slug=${selectedSlug}`, { credentials: "include" }).then(async (response) => {
      const data = await response.json();
      const saved = data.pages?.[0];
      setPage(saved || { slug: selectedSlug, title: pageOptions.find((item) => item.slug === selectedSlug)?.label || selectedSlug, description: "", content: "", seoTitle: "", seoDescription: "", isPublished: true });
      setError(response.ok ? "" : data.error || "Could not load page");
    });
  }, [selectedSlug, section]);

  React.useEffect(() => {
    if (section === "pages") return;
    void fetch(`/api/admin/cms?type=${section}`, { credentials: "include" }).then(async (response) => {
      const data = await response.json();
      if (section === "blogs") setBlogs(data.blogs || []); else setTemplates(data.templates || []);
      setError(response.ok ? "" : data.error || "Could not load content");
    });
  }, [section]);

  async function savePage(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/site-pages", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(page) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not save page"); return; }
    setPage(data.page);
    setMessage("Page content saved successfully.");
  }

  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Insights & tools</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Content & CMS</h2><p className="mt-2 text-sm text-slate-500">Edit website pages, public stories, and transactional email templates.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}{message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}<div className="flex flex-wrap gap-2"><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "pages" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`} onClick={() => setSection("pages")}><Globe className="mr-2 inline h-4 w-4" />Website pages</button><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "blogs" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`} onClick={() => setSection("blogs")}><FileText className="mr-2 inline h-4 w-4" />Blog posts</button><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "email-templates" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`} onClick={() => setSection("email-templates")}><Mail className="mr-2 inline h-4 w-4" />Email templates</button></div>{section === "pages" ? <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-emerald-600" />Edit website page</CardTitle><div className="flex flex-wrap gap-2 pt-3">{pageOptions.map((option) => <button key={option.slug} className={`rounded-lg border px-3 py-2 text-sm ${selectedSlug === option.slug ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700" : "bg-white text-slate-600"}`} onClick={() => { setSelectedSlug(option.slug); setMessage(""); }}>{option.label}</button>)}</div></CardHeader><CardContent><form className="space-y-5" onSubmit={savePage}><Input label="Page title" value={page.title} onChange={(event) => setPage({ ...page, title: event.target.value })} required /><Input label="Page description" value={page.description} onChange={(event) => setPage({ ...page, description: event.target.value })} /><div><label className="text-sm font-medium">Page content</label><p className="mb-2 mt-1 text-xs text-slate-500">Use basic HTML such as &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, and &lt;li&gt;.</p><textarea className="min-h-80 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={page.content} onChange={(event) => setPage({ ...page, content: event.target.value })} placeholder="Write the page content here..." /></div><div className="grid gap-4 md:grid-cols-2"><Input label="SEO title" value={page.seoTitle} onChange={(event) => setPage({ ...page, seoTitle: event.target.value })} /><Input label="SEO description" value={page.seoDescription} onChange={(event) => setPage({ ...page, seoDescription: event.target.value })} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.isPublished} onChange={(event) => setPage({ ...page, isPublished: event.target.checked })} />Published</label><Button type="submit"><Save className="mr-2 h-4 w-4" />Save page content</Button></form></CardContent></Card> : <Card><CardHeader><CardTitle>{section === "blogs" ? "Blog library" : "Email library"}</CardTitle></CardHeader><CardContent className="divide-y p-0">{section === "blogs" ? blogs.map((blog) => <div key={blog._id} className="flex items-center gap-4 px-6 py-4"><div className="flex-1"><p className="font-semibold">{blog.title}</p><p className="text-xs text-slate-500">{blog.category || "General"} · {new Date(blog.createdAt).toLocaleDateString()}</p></div><Badge variant={blog.isPublished ? "default" : "secondary"}>{blog.isPublished ? "Published" : "Draft"}</Badge></div>) : templates.map((template) => <div key={template._id} className="flex items-center gap-4 px-6 py-4"><div className="flex-1"><p className="font-semibold">{template.name || "Unnamed template"}</p><p className="text-xs text-slate-500">{template.subject || "No subject"}</p></div><Badge variant={template.isActive ? "default" : "secondary"}>{template.isActive ? "Active" : "Inactive"}</Badge></div>)}{((section === "blogs" && !blogs.length) || (section === "email-templates" && !templates.length)) ? <p className="py-14 text-center text-sm text-slate-500">No content found.</p> : null}</CardContent></Card>}</div>;
}
