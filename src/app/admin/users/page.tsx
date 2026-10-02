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
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import type { AuthUser } from "@/stores/auth-store";
import { OnboardingFormSummary } from "@/components/admin/onboarding-form-summary";

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
    age?: number;
    gender?: string;
    profession?: string;
    division?: string;
    district?: string;
    photos?: Array<{ url?: string; isPrimary?: boolean }>;
  } | null;
  subscription?: { plan: string; expiryDate: string; isActive: boolean; daysRemaining: number; biodataLimit: number; biodataUsed: number; biodataRemaining: number | null } | null;
  biodataVisits?: { totalVisits: number; uniqueBiodatas: number };
}

type PublicUserDetails = AdminUser;

function getUserEmail(user: AdminUser) {
  return [user.email, user.profile?.email, user.onboardingData?.email].find(
    (email): email is string => typeof email === "string" && email.trim().length > 0
  )?.trim() || "No email";
}

export function AdminUsersPage({ initialView = "members" }: { initialView?: "members" | "admin-team" }) {
  const currentUser = useAdminAuthStore((state) => state.user);
  const setAdminUser = useAdminAuthStore((state) => state.setUser);
  async function refreshUser() {
    const response = await adminFetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json() as { user: AuthUser };
    setAdminUser(result.user);
  }
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
  const [selectedPublicUser, setSelectedPublicUser] = React.useState<PublicUserDetails | null>(null);
  const [publicUserLoading, setPublicUserLoading] = React.useState(false);
  const [publicUserError, setPublicUserError] = React.useState("");

  function openAccount(account: AdminUser) {
    setSelectedAccount(account);
    setAccountForm({ firstName: account.firstName || "", lastName: account.lastName || "", email: account.email || "", phone: account.phone || "", password: "", isActive: account.isActive, isBlocked: account.isBlocked });
    setAccountAvatar(account.avatarUrl || "");
    setAccountError("");
    setAccountMessage("");
  }

  async function openPublicUser(user: AdminUser) {
    setSelectedPublicUser(user);
    setPublicUserLoading(true);
    setPublicUserError("");
    const response = await adminFetch(`/api/admin/users?userId=${encodeURIComponent(user._id)}`, { credentials: "include" });
    const data = await response.json();
    setPublicUserLoading(false);
    if (!response.ok || !data.user) {
      setPublicUserError(data.error || "Could not load public user details");
      return;
    }
    setSelectedPublicUser(data.user as PublicUserDetails);
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

  async function toggleUserBlock(user: AdminUser) {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    const response = await adminFetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-block", userId: user._id, isBlocked: !user.isBlocked }),
    });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) {
      setActionError(data.error || "Could not update block status");
      return;
    }
    setUsers((current) => current.map((account) => account._id === user._id ? { ...account, isBlocked: !user.isBlocked } : account));
    if (selectedAccount?._id === user._id) {
      setSelectedAccount((current) => current ? { ...current, isBlocked: !user.isBlocked } : current);
      setAccountForm((current) => ({ ...current, isBlocked: !user.isBlocked }));
    }
    setActionMessage(`User ${!user.isBlocked ? "blocked" : "unblocked"} successfully.`);
  }

  async function deleteUserAccount(user: AdminUser) {
    const confirmDelete = window.confirm(`Delete ${user.email || "this user"}? This removes the account and profile from the database permanently.`);
    if (!confirmDelete) return;
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    const response = await adminFetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
    });
    const data = await response.json();
    setActionLoading(false);
    if (!response.ok) {
      setActionError(data.error || "Could not delete user");
      return;
    }
    setUsers((current) => current.filter((account) => account._id !== user._id));
    if (selectedAccount?._id === user._id) {
      setSelectedAccount(null);
    }
    setActionMessage("User permanently deleted from the database.");
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
  const selectedPublicProfile = selectedPublicUser?.profile;
  const selectedPublicPhoto = selectedPublicProfile?.photos?.find((photo) => photo.isPrimary)?.url || selectedPublicProfile?.photos?.[0]?.url || selectedPublicUser?.avatarUrl || "";
  const selectedPublicName = `${selectedPublicProfile?.firstName || selectedPublicUser?.firstName || ""} ${selectedPublicProfile?.lastName || selectedPublicUser?.lastName || ""}`.trim() || "Unnamed public user";
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
                  <th className="px-6 py-3">Subscription</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-slate-500"
                      colSpan={7}
                    >
                      Loading {isAdminTeam ? "admin accounts" : publicSegment === "free" ? "free registration users" : "subscription users"}...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-red-600"
                      colSpan={7}
                    >
                      {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-500" colSpan={7}>
                      No {isAdminTeam ? "admin accounts" : publicSegment === "free" ? "free registration users" : "subscription users"} found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <React.Fragment key={user._id}><tr className="cursor-pointer hover:bg-slate-50" onClick={isAdminTeam ? () => openAccount(user) : () => void openPublicUser(user)}>
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
                        <p className="text-xs text-slate-500">{getUserEmail(user)} · {user.phone || "No phone"}</p>
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
                        {isAdminTeam ? null : user.subscription ? (
                          <div className="min-w-44 space-y-1 text-xs">
                            <p className="font-bold capitalize text-amber-700">{user.subscription.plan} plan</p>
                            <p className="text-slate-500">Expires: {new Date(user.subscription.expiryDate).toLocaleDateString()}</p>
                            <p className="text-slate-600">Biodata views: <strong>{user.subscription.biodataUsed} / {user.subscription.biodataLimit}</strong></p>
                            <p className={user.subscription.biodataRemaining === 0 ? "font-semibold text-red-600" : "text-emerald-700"}>
                              Biodata remaining: <strong>{user.subscription.biodataRemaining === null ? "Unlimited" : user.subscription.biodataRemaining}</strong>
                            </p>
                          </div>
                        ) : <span className="text-xs text-slate-400">Free registration</span>}
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
                      <td className="px-6 py-4">
                        {!isAdminTeam ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${user.isBlocked ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                void toggleUserBlock(user);
                              }}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              type="button"
                              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                              onClick={(event) => {
                                event.stopPropagation();
                                void deleteUserAccount(user);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
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
      {selectedPublicUser ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Public user details" onClick={() => setSelectedPublicUser(null)}>
        <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-white/70 bg-slate-50 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Onboarding submission</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{selectedPublicName}</h3>
                <p className="mt-1 text-sm text-slate-500">Information submitted in the member&apos;s onboarding form</p>
              </div>
              <button type="button" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900" onClick={() => setSelectedPublicUser(null)} aria-label="Close public user details"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-emerald-50 text-2xl font-bold text-emerald-800">
                {selectedPublicPhoto ? <Image src={selectedPublicPhoto} alt={`${selectedPublicName} profile`} fill sizes="112px" className="object-cover" /> : <span className="flex h-full items-center justify-center">{selectedPublicName.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{selectedPublicProfile?.gender || "Gender not added"}</span>
                {selectedPublicProfile?.age ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{selectedPublicProfile.age} years</span> : null}
                {selectedPublicProfile?.isVerified ? <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700">Verified</span> : null}
                {selectedPublicProfile?.isPremium ? <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-700">Premium</span> : null}
                <span className={`rounded-full px-3 py-1.5 ${selectedPublicUser.isBlocked ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"}`}>{selectedPublicUser.isBlocked ? "Blocked" : "Active account"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-5 sm:p-8">
            {publicUserLoading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading onboarding information...</p> : null}
            {publicUserError ? <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-600">{publicUserError}</p> : null}
            {!publicUserLoading && !publicUserError ? <>
              <OnboardingFormSummary
                onboardingData={selectedPublicUser.onboardingData}
                profile={selectedPublicProfile}
                photos={selectedPublicProfile?.photos || []}
              />
            </> : null}
          </div>
        </div>
      </div> : null}
    </div>
  );
}

export default function AdminUsersPageRoute() {
  return <AdminUsersPage initialView="members" />;
}
