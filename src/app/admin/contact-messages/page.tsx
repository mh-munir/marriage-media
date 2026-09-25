"use client";

import * as React from "react";
import { Check, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin-fetch";

type ContactMessage = { _id: string; name: string; email: string; subject: string; message: string; isRead: boolean; createdAt: string };

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [updating, setUpdating] = React.useState("");

  const loadMessages = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await adminFetch("/api/admin/contact-messages");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load contact messages");
      setMessages(data.messages || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load contact messages"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { void loadMessages(); }, [loadMessages]);

  async function markRead(id: string) {
    setUpdating(id); setError("");
    try {
      const response = await adminFetch("/api/admin/contact-messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isRead: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update message");
      setMessages((current) => current.map((message) => message._id === id ? { ...message, isRead: true } : message));
    } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not update message"); }
    finally { setUpdating(""); }
  }

  const unreadCount = messages.filter((message) => !message.isRead).length;
  return <div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-600">Customer support</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Contact messages</h2><p className="mt-2 text-sm text-slate-500">Messages submitted from the public Contact page appear here.</p></div><Button variant="outline" onClick={() => void loadMessages()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-emerald-600" />{unreadCount} unread message{unreadCount === 1 ? "" : "s"}</CardTitle></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-8 text-center text-sm text-slate-500">Loading messages...</p> : messages.length ? messages.map((message) => <article key={message._id} className={`rounded-xl border p-5 ${message.isRead ? "bg-white" : "border-emerald-200 bg-emerald-50/40"}`}><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h3 className="font-semibold">{message.subject}</h3><p className="mt-1 text-sm text-slate-600">{message.name} · <a className="text-emerald-700 underline" href={`mailto:${message.email}`}>{message.email}</a></p></div>{!message.isRead ? <Button size="sm" variant="outline" disabled={updating === message._id} onClick={() => void markRead(message._id)}><Check className="mr-1 h-4 w-4" />Mark as read</Button> : <span className="text-xs font-medium text-slate-500">Read</span>}</div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.message}</p><p className="mt-4 text-xs text-slate-500">Received {new Date(message.createdAt).toLocaleString()}</p></article>) : <p className="py-10 text-center text-sm text-slate-500">No contact messages yet.</p>}</CardContent></Card></div>;
}
