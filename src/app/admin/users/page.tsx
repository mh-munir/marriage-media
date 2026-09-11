"use client";

import * as React from "react";
import {
  Activity,
  Crown,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    isPremium?: boolean;
    isVerified?: boolean;
  } | null;
  subscription?: { plan: string; expiryDate: string; isActive: boolean } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"members" | "admin-team">("members");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const response = await adminFetch(
        `/api/admin/users?limit=50&role=${view}&search=${encodeURIComponent(search)}`,
        { credentials: "include" },
      );
      const data = await response.json();
      setUsers(data.users || []);
      setError(response.ok ? "" : data.error || "Could not load users");
      setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, view]);

  const isAdminTeam = view === "admin-team";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          Account directory
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          {isAdminTeam ? "Admin team" : "Website members"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isAdminTeam
            ? "View the people who manage and protect your Marriage Media platform."
            : "Search members, review account health, and identify premium or verified profiles."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setView("members")}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${!isAdminTeam ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200"}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Users className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Website Members</span>
            <span className="mt-1 block text-xs text-slate-500">
              People using the public website
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setView("admin-team")}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${isAdminTeam ? "border-indigo-400 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-200"}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <UserCog className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Admin Team</span>
            <span className="mt-1 block text-xs text-slate-500">
              Admins and superadmins only
            </span>
          </span>
        </button>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            {isAdminTeam ? (
              <UserCog className="h-5 w-5 text-indigo-600" />
            ) : (
              <UserRound className="h-5 w-5 text-emerald-600" />
            )}{" "}
            {users.length} {isAdminTeam ? "admin accounts" : "members shown"}
          </CardTitle>
          <div className="w-full sm:w-80">
            <Input
              aria-label="Search members"
              placeholder={
                isAdminTeam ? "Search admin email" : "Search member email"
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Trust</th>
                  <th className="px-6 py-3">Subscription</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-slate-500"
                      colSpan={6}
                    >
                      Loading {isAdminTeam ? "admin accounts" : "members"}...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-red-600"
                      colSpan={6}
                    >
                      {error}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {user.profile
                            ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim() ||
                              "Unnamed member"
                            : isAdminTeam
                              ? "Platform administrator"
                              : "No profile"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription?.isActive ? (
                          <div className="space-y-1">
                            <Badge className="capitalize bg-amber-100 text-amber-800">{user.subscription.plan}</Badge>
                            <p className="text-xs text-slate-500">
                              Expires {new Date(user.subscription.expiryDate).toLocaleDateString()} · {Math.max(0, Math.ceil((new Date(user.subscription.expiryDate).getTime() - Date.now()) / 86_400_000))} days left
                            </p>
                          </div>
                        ) : user.subscription ? (
                          <span className="text-xs text-slate-500">{user.subscription.plan} expired</span>
                        ) : <span className="text-xs text-slate-500">Free</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            isAdminTeam
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }
                        >
                          {user.role === "superadmin" ? (
                            <>
                              <Crown className="mr-1 h-3 w-3" />
                              Superadmin
                            </>
                          ) : isAdminTeam ? (
                            "Admin"
                          ) : (
                            "Member"
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {isAdminTeam ? (
                            <Badge className="bg-indigo-100 text-indigo-700">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Staff access
                            </Badge>
                          ) : user.profile?.isVerified ? (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : null}
                          {user.profile?.isPremium ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              Premium
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <ShieldOff className="h-4 w-4" />
                            Blocked
                          </span>
                        ) : user.isActive ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Activity className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
