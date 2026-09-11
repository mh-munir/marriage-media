"use client";

import * as React from "react";
import { Search, UserRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  profile?: { firstName?: string; lastName?: string; isPremium?: boolean; isVerified?: boolean } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/users?limit=50&search=${encodeURIComponent(search)}`, { credentials: "include" });
      const data = await response.json();
      setUsers(data.users || []);
      setError(response.ok ? "" : data.error || "Could not load users");
      setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><p className="text-sm font-semibold text-emerald-600">Members & profiles</p><h2 className="mt-2 text-3xl font-bold tracking-tight">User management</h2><p className="mt-2 text-sm text-slate-500">Search members, review account health, and identify premium or verified profiles.</p></div>
      <Card><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-emerald-600" /> {users.length} members shown</CardTitle><div className="w-full sm:w-80"><Input aria-label="Search members" placeholder="Search by email" value={search} onChange={(event) => setSearch(event.target.value)} icon={<Search className="h-4 w-4" />} /></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Member</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Trust</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Joined</th></tr></thead><tbody className="divide-y">{loading ? <tr><td className="px-6 py-10 text-center text-slate-500" colSpan={5}>Loading members...</td></tr> : error ? <tr><td className="px-6 py-10 text-center text-red-600" colSpan={5}>{error}</td></tr> : users.map((user) => <tr key={user._id} className="hover:bg-slate-50"><td className="px-6 py-4"><p className="font-semibold">{user.profile ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim() || "Unnamed member" : "No profile"}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-6 py-4"><Badge variant="secondary">{user.role}</Badge></td><td className="px-6 py-4"><div className="flex gap-2">{user.profile?.isVerified ? <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge> : null}{user.profile?.isPremium ? <Badge className="bg-amber-100 text-amber-700">Premium</Badge> : null}</div></td><td className="px-6 py-4">{user.isBlocked ? <span className="flex items-center gap-1 text-red-600"><ShieldOff className="h-4 w-4" />Blocked</span> : user.isActive ? <span className="text-emerald-600">Active</span> : <span className="text-slate-500">Inactive</span>}</td><td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></CardContent></Card>
    </div>
  );
}
