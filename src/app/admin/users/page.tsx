"use client";

import * as React from "react";
import Image from "next/image";
import {
  Activity,
  Crown,
  MailCheck,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShieldOff,
  UploadCloud,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/providers/auth-provider";

interface AdminUser {
  _id: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  onboardingData?: Record<string, unknown>;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  createdAt: string;
  profile?: Record<string, unknown> & {
    firstName?: string;
    lastName?: string;
    isPremium?: boolean;
    isVerified?: boolean;
  } | null;
  subscription?: { plan: string; expiryDate: string; isActive: boolean; daysRemaining: number } | null;
  biodataVisits?: { totalVisits: number; uniqueBiodatas: number };
}

export function AdminUsersPage({ initialView = "members" }: { initialView?: "members" | "admin-team" }) {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [view] = React.useState<"members" | "admin-team">(initialView);
  const [publicSegment, setPublicSegment] = React.useState<"free" | "subscribed">("free");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [createForm, setCreateForm] = React.useState({ email: "", phone: "", password: "", firstName: "", lastName: "" });
  const [profileForm, setProfileForm] = React.useState({ firstName: "", lastName: "", email: "", password: "" });
  const [emailCode, setEmailCode] = React.useState("");
  const [developmentOtp, setDevelopmentOtp] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState("");
  const [actionError, setActionError] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<AdminUser | null>(null);
  const [accountForm, setAccountForm] = React.useState({ firstName: "", lastName: "", email: "", phone: "", password: "", isActive: true, isBlocked: false });
  const [accountAvatar, setAccountAvatar] = React.useState("");
  const [accountError, setAccountError] = React.useState("");
  const [accountMessage, setAccountMessage] = React.useState("");

  function openAccount(account: AdminUser) {
    setSelectedAccount(account);
    setAccountForm({ firstName: account.firstName || "", lastName: account.lastName || "", email: account.email || "", phone: account.phone || "", password: "", isActive: account.isActive, isBlocked: account.isBlocked });
    setAccountAvatar(account.avatarUrl || "");
    setAccountError("");
    setAccountMessage("");
  }

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAccount) return;
    setActionLoading(true);
    setAccountError("");
    setAccountMessage("");
    const response = await adminFetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedAccount._id, ...accountForm }) });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) {
      setAccountError(data.error || "Could not save account details");
      return;
    }
    const { password: changedPassword, ...visibleAccountForm } = accountForm;
    void changedPassword;
    setUsers((current) => current.map((account) => account._id === selectedAccount._id ? { ...account, ...visibleAccountForm } : account));
    setSelectedAccount((current) => current ? { ...current, ...visibleAccountForm } : current);
    setAccountMessage("Account details saved.");
    if (currentUser?.id === selectedAccount._id) await refreshUser();
  }

  async function uploadAccountAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file || !selectedAccount) return;
    setActionLoading(true);
    setAccountError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", selectedAccount._id);
    const response = await adminFetch("/api/admin/profile/avatar", { method: "POST", body: formData });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) {
      setAccountError(data.error || "Could not upload profile image");
      return;
    }
    setAccountAvatar(data.avatarUrl || "");
    setUsers((current) => current.map((account) => account._id === selectedAccount._id ? { ...account, avatarUrl: data.avatarUrl } : account));
    setSelectedAccount((current) => current ? { ...current, avatarUrl: data.avatarUrl } : current);
    setAccountMessage("Profile image uploaded.");
    if (currentUser?.id === selectedAccount._id) await refreshUser();
  }

  React.useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const response = await adminFetch(
        `/api/admin/users?limit=50&role=${view}&segment=${view === "admin-team" ? "" : publicSegment}&search=${encodeURIComponent(search)}`,
        { credentials: "include" },
      );
      const data = await response.json();
      setUsers(data.users || []);
      const loadedSuperadmin = (data.users || []).find((account: AdminUser) => account.role === "superadmin");
      if (loadedSuperadmin) {
        setProfileForm({
          firstName: loadedSuperadmin.firstName || "",
          lastName: loadedSuperadmin.lastName || "",
          email: loadedSuperadmin.email || "", password: "",
        });
      }
      setError(response.ok ? "" : data.error || "Could not load users");
      setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [publicSegment, search, view]);

  const isAdminTeam = view === "admin-team";
  const isSuperadmin = currentUser?.role === "superadmin";

  async function createAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    const response = await adminFetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) {
      setActionError(data.error || "Could not create admin account");
      return;
    }
    setCreateForm({ email: "", phone: "", password: "", firstName: "", lastName: "" });
    setActionMessage("Admin account created successfully.");
  }

  async function requestVerification() {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    const response = await adminFetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-superadmin-change-otp" }) });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) setActionError(data.error || "Could not send verification code");
    else {
      setDevelopmentOtp(data.otp || "");
      setActionMessage(data.message);
    }
  }

  async function saveSuperadmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) return;
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    const response = await adminFetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.id, firstName: profileForm.firstName, lastName: profileForm.lastName, email: profileForm.email, password: profileForm.password, changeOtp: emailCode }) });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) setActionError(data.error || "Could not update superadmin details");
    else {
      setProfileForm((current) => ({ ...current, password: "" }));
      setEmailCode("");
      setActionMessage("Superadmin details updated securely.");
      await refreshUser();
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          Account directory
        </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
          {isAdminTeam ? "Admin users" : "Public users"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isAdminTeam
            ? "View the people who manage and protect your Marriage Media platform."
            : "Search members, review account health, and identify premium or verified profiles."}
        </p>
      </div>
      {isSuperadmin && isAdminTeam ? (
        <>
          {developmentOtp ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><strong>Development email OTP:</strong> {developmentOtp}</div> : null}
          <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-600" />Create admin account</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={createAdmin}>
                <Input label="First name" value={createForm.firstName} onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))} required />
                <Input label="Last name" value={createForm.lastName} onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))} required />
                <Input label="Email" type="email" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} required />
                <Input label="Mobile number" type="tel" value={createForm.phone} onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))} required />
                <Input label="Temporary password" type="password" value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} required />
                <div className="flex items-end"><button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0d1b2a] px-4 text-sm font-semibold text-white hover:bg-slate-800" disabled={actionLoading}><Plus className="h-4 w-4" />Create admin</button></div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-600" />Superadmin details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveSuperadmin}>
                <Input label="First name" value={profileForm.firstName} onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))} required />
                <Input label="Last name" value={profileForm.lastName} onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))} required />
                <div className="sm:col-span-2 flex gap-2"><Input className="flex-1" label="New email" type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} /><button type="button" className="mt-6 inline-flex h-11 items-center gap-1 rounded-xl border px-3 text-xs" onClick={() => void requestVerification()} disabled={actionLoading}><Send className="h-3.5 w-3.5" />Send OTP</button></div>
                <Input className="sm:col-span-2" label="New password" type="password" minLength={8} placeholder="At least 8 characters" value={profileForm.password} onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))} />
                <div className="sm:col-span-2"><Input label="OTP sent to your current email" inputMode="numeric" value={emailCode} onChange={(event) => setEmailCode(event.target.value)} /></div>
                <div className="sm:col-span-2 flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700" disabled={actionLoading}><MailCheck className="h-4 w-4" /><Save className="h-4 w-4" />Save securely</button></div>
              </form>
              {actionMessage ? <p className="text-sm text-emerald-600">{actionMessage}</p> : null}
              {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
            </CardContent>
          </Card>
          </div>
        </>
      ) : null}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <CardTitle className="flex items-center gap-2">
              {isAdminTeam ? (
                <UserCog className="h-5 w-5 text-indigo-600" />
              ) : (
                <UserRound className="h-5 w-5 text-emerald-600" />
              )}{" "}
              {users.length} {isAdminTeam ? "admin accounts" : publicSegment === "free" ? "free registration users" : "subscription users"}
            </CardTitle>
            {!isAdminTeam ? (
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="Public user type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={publicSegment === "free"}
                  onClick={() => setPublicSegment("free")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${publicSegment === "free" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Free registration users
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={publicSegment === "subscribed"}
                  onClick={() => setPublicSegment("subscribed")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${publicSegment === "subscribed" ? "bg-amber-100 text-amber-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Subscription users
                </button>
              </div>
            ) : null}
          </div>
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
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-slate-500"
                      colSpan={5}
                    >
                      Loading {isAdminTeam ? "admin accounts" : publicSegment === "free" ? "free registration users" : "subscription users"}...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-red-600"
                      colSpan={5}
                    >
                      {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-500" colSpan={5}>
                      No {isAdminTeam ? "admin accounts" : publicSegment === "free" ? "free registration users" : "subscription users"} found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <React.Fragment key={user._id}><tr className={isAdminTeam ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50"} onClick={isAdminTeam ? () => openAccount(user) : undefined}>
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {isAdminTeam
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                              "Platform administrator"
                            : user.profile
                            ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim() ||
                              "Unnamed member"
                            : isAdminTeam
                              ? "Platform administrator"
                              : "No profile"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email || "No email"} · {user.phone || "No phone"}</p>
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
                    </tr></React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {selectedAccount ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Account details" onClick={() => setSelectedAccount(null)}>
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b px-5 py-4"><div><h3 className="text-xl font-bold">Account details</h3><p className="text-sm text-slate-500">Edit account, access and profile image</p></div><button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setSelectedAccount(null)} aria-label="Close account details"><X className="h-5 w-5" /></button></div>
          <form className="space-y-5 p-5" onSubmit={saveAccount}>
            <div className="flex items-center gap-4 rounded-xl border bg-slate-50 p-4"><div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">{accountAvatar ? <Image src={accountAvatar} alt="Account avatar" fill sizes="80px" className="object-cover" /> : selectedAccount.email.slice(0, 2).toUpperCase()}</div><div><p className="font-semibold">{selectedAccount.role === "superadmin" ? "Superadmin" : "Admin"}</p><p className="text-sm text-slate-500">Upload a profile image for this admin account.</p><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100"><UploadCloud className="h-3.5 w-3.5" />Upload image<input type="file" accept="image/*" className="sr-only" disabled={actionLoading} onChange={(event) => void uploadAccountAvatar(event)} /></label></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={accountForm.firstName} onChange={(event) => setAccountForm((current) => ({ ...current, firstName: event.target.value }))} disabled={!isSuperadmin} required /><Input label="Last name" value={accountForm.lastName} onChange={(event) => setAccountForm((current) => ({ ...current, lastName: event.target.value }))} disabled={!isSuperadmin} required /><Input label="Email" type="email" value={accountForm.email} onChange={(event) => setAccountForm((current) => ({ ...current, email: event.target.value }))} disabled={!isSuperadmin || selectedAccount.role === "superadmin"} required /><Input label="Mobile number" type="tel" value={accountForm.phone} onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))} disabled={!isSuperadmin} />{isSuperadmin ? <Input label="New password" type="password" placeholder="Leave blank to keep current password" value={accountForm.password} onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))} minLength={8} /> : null}</div>
            <div className="flex flex-wrap gap-4 border-t pt-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={accountForm.isActive} onChange={(event) => setAccountForm((current) => ({ ...current, isActive: event.target.checked }))} disabled={selectedAccount.role !== "admin" || currentUser?.role !== "superadmin"} />Active account</label><label className="flex items-center gap-2"><input type="checkbox" checked={accountForm.isBlocked} onChange={(event) => setAccountForm((current) => ({ ...current, isBlocked: event.target.checked }))} disabled={selectedAccount.role !== "admin" || currentUser?.role !== "superadmin"} />Blocked</label><span className="text-slate-500">Email verified: {selectedAccount.isEmailVerified ? "Yes" : "No"}</span><span className="text-slate-500">Mobile verified: {selectedAccount.isPhoneVerified ? "Yes" : "No"}</span></div>
            {selectedAccount.profile ? <div className="rounded-xl border bg-slate-50 p-4"><h4 className="mb-2 font-semibold">Stored profile data</h4><pre className="max-h-48 overflow-auto whitespace-pre-wrap wrap-break-word text-xs text-slate-600">{JSON.stringify(selectedAccount.profile, null, 2)}</pre></div> : null}
            {accountMessage ? <p className="text-sm text-emerald-600">{accountMessage}</p> : null}{accountError ? <p className="text-sm text-red-600">{accountError}</p> : null}
            <div className="flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-[#0d1b2a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" disabled={actionLoading}><Save className="h-4 w-4" />Save account</button></div>
          </form>
        </div>
      </div> : null}
    </div>
  );
}

export default function AdminUsersPageRoute() {
  return <AdminUsersPage initialView="members" />;
}
