"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

const DEFAULT_EMAIL = "admin@marriagemedia.com";
const DEFAULT_PASSWORD = "Admin@12345";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAdminAuthStore((state) => state.setSession);
  const [email, setEmail] = React.useState(DEFAULT_EMAIL);
  const [password, setPassword] = React.useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          response.ok
            ? "Admin login returned an unexpected response."
            : `Admin login endpoint returned HTTP ${response.status}. Verify the current app build includes /api/admin/auth/login.`
        );
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Admin login failed");
      setSession(result.user, result.accessToken, result.refreshToken);
      router.replace("/admin");
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Admin login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0d1b2a] px-4 py-12"><Card className="w-full max-w-md border-white/10 bg-white shadow-2xl"><CardHeader className="space-y-4 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#0d1b2a]"><ShieldCheck className="h-7 w-7" /></div><div><CardTitle className="text-2xl">Admin sign in</CardTitle><p className="mt-2 text-sm text-slate-500">Access the Marriage Media control room.</p></div></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit}><Input label="Admin email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /><div className="relative"><Input label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required rightIcon={<button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} /></div><Button className="w-full bg-[#0d1b2a] hover:bg-slate-800" type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="mr-2 h-4 w-4" />Sign in to admin</>}</Button></form><p className="mt-5 text-center text-xs text-slate-400">Development default credentials are pre-filled. Change them through environment variables before production.</p></CardContent></Card></main>;
}
