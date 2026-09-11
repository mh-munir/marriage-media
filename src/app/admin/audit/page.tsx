"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditEntry { _id: string; action: string; resource: string; ipAddress?: string; createdAt: string; userId?: { email?: string } | string; }
export default function AdminAuditPage() {
  const [logs, setLogs] = React.useState<AuditEntry[]>([]);
  const [error, setError] = React.useState("");
  React.useEffect(() => { fetch("/api/admin/audit?limit=50", { credentials: "include" }).then(async (response) => { const data = await response.json(); setLogs(data.logs || []); setError(response.ok ? "" : data.error || "Could not load audit trail"); }); }, []);
  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-semibold text-emerald-600">Insights & tools</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Audit trail</h2><p className="mt-2 text-sm text-slate-500">A traceable record of administrative and security-sensitive actions.</p></div>{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}<Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-600" />Recent actions</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y">{logs.length ? logs.map((log) => <div key={log._id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-semibold">{log.action}</p><p className="text-xs text-slate-500">{log.resource} · {typeof log.userId === "object" ? log.userId.email : log.userId || "System"}</p></div><p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p><p className="text-xs text-slate-400">{log.ipAddress || "Unknown IP"}</p></div>) : <p className="py-14 text-center text-sm text-slate-500">No audit actions found.</p>}</div></CardContent></Card></div>;
}
