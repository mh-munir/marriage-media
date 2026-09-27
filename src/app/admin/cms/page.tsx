"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Mail, Settings2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HomeSection,
  defaultHomeSections,
  ensureHomeSections,
} from "@/components/seo/home-page-override";
import { HomeSectionsEditor } from "./home-sections-editor";
import { ManagedSectionsEditor } from "./managed-sections-editor";
import { invalidateSitePageCache } from "@/components/seo/site-page-override";
import { BlogEditor, type BlogRecord } from "./blog-editor";
import {
  defaultManagedSections,
  ensureManagedSections,
  type ManagedPageSection,
} from "@/components/seo/managed-page-content";
import { adminFetch } from "@/lib/admin-fetch";
import AdminPricingPage from "@/app/admin/pricing/page";
import AdminBrandingPage from "@/app/admin/branding/page";

const pageOptions = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "pricing", label: "Pricing" },
  { slug: "success-stories", label: "Success Stories" },
  { slug: "contact", label: "Contact" },
];
interface SitePage {
  slug: string;
  title: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  sections?: Array<HomeSection | ManagedPageSection>;
}
type Blog = BlogRecord;
interface Template {
  _id: string;
  name?: string;
  subject?: string;
  isActive?: boolean;
}

export default function AdminCmsPage() {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get("slug");
  const [section, setSection] = React.useState<
    "pages" | "blogs" | "success-stories" | "email-templates" | "pricing" | "branding"
  >("pages");
  const [selectedSlug, setSelectedSlug] = React.useState(
    pageOptions.some((option) => option.slug === requestedSlug)
      ? (requestedSlug as string)
      : "home",
  );
  const [page, setPage] = React.useState<SitePage>({
    slug: "home",
    title: "Home",
    description: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    isPublished: true,
    sections: defaultHomeSections(),
  });
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (section !== "pages") return;
    let active = true;
    void adminFetch(`/api/admin/site-pages?slug=${selectedSlug}`).then(
      async (response) => {
        const data = await response.json();
        if (!active) return;
        const saved = data.pages?.[0];
        setPage(
          saved
            ? {
                ...saved,
                sections:
                  selectedSlug === "home"
                    ? ensureHomeSections(
                        (saved.sections ||
                          defaultHomeSections()) as HomeSection[],
                      )
                    : saved.sections?.length
                      ? ensureManagedSections(selectedSlug, saved.sections as ManagedPageSection[])
                      : defaultManagedSections(selectedSlug),
              }
            : {
                slug: selectedSlug,
                title:
                  pageOptions.find((item) => item.slug === selectedSlug)
                    ?.label || selectedSlug,
                description: "",
                content: "",
                seoTitle: "",
                seoDescription: "",
                isPublished: true,
                sections:
                  selectedSlug === "home"
                    ? defaultHomeSections()
                    : defaultManagedSections(selectedSlug),
              },
        );
        setError(response.ok ? "" : data.error || "Could not load page");
      },
    );
    return () => { active = false; };
  }, [selectedSlug, section]);

  React.useEffect(() => {
    if (section === "pages" || section === "pricing" || section === "branding") return;
    void adminFetch(`/api/admin/cms?type=${section}`).then(async (response) => {
      const data = await response.json();
      if (section === "blogs" || section === "success-stories")
        setBlogs(data.blogs || []);
      else setTemplates(data.templates || []);
      setError(response.ok ? "" : data.error || "Could not load content");
    });
  }, [section]);

  async function saveHomeSections(sections: HomeSection[]) {
    setError("");
    setMessage("");
    try {
      const response = await adminFetch("/api/admin/site-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, slug: "home", sections }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save Home sections");
        return;
      }
      setPage(data.page);
      invalidateSitePageCache("home");
      setMessage("Home page sections saved successfully.");
    } catch {
      setError(
        "Could not connect to the server. Please restart the development server and try again.",
      );
    }
  }

  async function saveManagedSections(sections: ManagedPageSection[]) {
    setError("");
    setMessage("");
    try {
      const response = await adminFetch("/api/admin/site-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, sections }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save page sections");
        return;
      }
      setPage(data.page);
      invalidateSitePageCache(selectedSlug);
      setMessage("Page sections saved successfully.");
    } catch {
      setError("Could not connect to the server. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          Insights & tools
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Content & CMS
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Edit website pages, public stories, and transactional email templates.
        </p>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "pages" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("pages")}
        >
          <Globe className="mr-2 inline h-4 w-4" />
          Website pages
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "blogs" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("blogs")}
        >
          <FileText className="mr-2 inline h-4 w-4" />
          Blog posts
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "success-stories" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("success-stories")}
        >
          <FileText className="mr-2 inline h-4 w-4" />
          Success Stories
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "email-templates" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("email-templates")}
        >
          <Mail className="mr-2 inline h-4 w-4" />
          Email templates
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "pricing" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("pricing")}
        >
          Pricing plans
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === "branding" ? "bg-[#0d1b2a] text-white" : "border bg-white"}`}
          onClick={() => setSection("branding")}
        >
          Logo & branding
        </button>
      </div>
      {section === "pricing" ? <AdminPricingPage /> : section === "branding" ? <AdminBrandingPage /> : section === "pages" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-emerald-600" />
              Edit website page
            </CardTitle>
            <div className="flex flex-wrap gap-2 pt-3">
              {pageOptions.map((option) => (
                <button
                  key={option.slug}
                  className={`rounded-lg border px-3 py-2 text-sm ${selectedSlug === option.slug ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700" : "bg-white text-slate-600"}`}
                  onClick={() => {
                    setSelectedSlug(option.slug);
                    setMessage("");
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSlug === "home" ? (
              <HomeSectionsEditor
                sections={
                  (page.sections as HomeSection[] | undefined)?.length
                    ? (page.sections as HomeSection[])
                    : defaultHomeSections()
                }
                onSave={saveHomeSections}
              />
            ) : (
              <ManagedSectionsEditor
                key={`${selectedSlug}-${page.slug}`}
                sections={
                  (page.sections as ManagedPageSection[] | undefined)?.length
                    ? (page.sections as ManagedPageSection[])
                    : defaultManagedSections(selectedSlug)
                }
                imageCapabilities={{ section: false, items: selectedSlug === "success-stories" }}
                sectionLabels={managedSectionLabels[selectedSlug] || {}}
                onSave={saveManagedSections}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {section === "blogs"
                ? "Blog library"
                : section === "success-stories"
                  ? "Success Stories library"
                  : "Email library"}
            </CardTitle>
          </CardHeader>
          {section === "blogs" ? (
            <BlogEditor
              onCreated={(blog) => setBlogs((current) => [blog, ...current])}
              onMessage={setMessage}
              onError={setError}
            />
          ) : null}
          <CardContent className="divide-y p-0">
            {section === "blogs" || section === "success-stories"
              ? blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{blog.title}</p>
                      <p className="text-xs text-slate-500">
                        {blog.category || "General"} · {blog.likes?.toLocaleString() || "0"} likes ·{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={blog.isPublished ? "default" : "secondary"}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))
              : templates.map((template) => (
                  <div
                    key={template._id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {template.name || "Unnamed template"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {template.subject || "No subject"}
                      </p>
                    </div>
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
            {((section === "blogs" || section === "success-stories") && !blogs.length) ||
            (section === "email-templates" && !templates.length) ? (
              <p className="py-14 text-center text-sm text-slate-500">
                No content found.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const managedSectionLabels: Record<string, Record<string, string>> = {
  about: { hero: "Hero banner", stats: "Statistics", mission: "Mission", vision: "Vision", values: "Our values", team: "Our team", why: "Why choose us", recognition: "Recognition" },
  pricing: { hero: "Hero banner", benefits: "Premium benefits", testimonials: "Member testimonials", faq: "Frequently asked questions" },
  "success-stories": { hero: "Hero banner", gallery: "Photo gallery", cta: "Join call to action" },
  contact: { email: "Email contact", phone: "Phone contact", address: "Office address", hours: "Working hours" },
};
