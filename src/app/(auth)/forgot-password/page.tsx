"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Heart, Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const endpoint = codeSent ? "/api/auth/reset-password" : "/api/auth/forgot-password";
      const body = codeSent ? { phone, token: code, password, confirmPassword } : { phone };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to process password recovery.");
      setMessage(result.message || "Recovery code sent.");
      setCodeSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to process password recovery.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rose-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
      <Card className="relative w-full max-w-md border-white/70 bg-white/90 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2 text-xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Heart className="h-5 w-5" fill="currentColor" /></span>
            Marriage<span className="text-primary">Media</span>
          </Link>
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>Enter your mobile number to receive a secure recovery code.</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? <div className="mb-4 flex gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle className="h-4 w-4 shrink-0" />{message}</div> : null}
          {error ? <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} required />
            {codeSent ? <>
              <Input label="Recovery code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
              <Input label="New password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              <Input label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
            </> : null}
            <Button className="w-full" type="submit" size="lg" disabled={busy}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : codeSent ? <><ShieldCheck className="h-4 w-4" /> Reset password</> : <><Phone className="h-4 w-4" /> Send recovery code</>}
            </Button>
          </form>
          {codeSent ? <button type="button" className="mx-auto mt-3 block text-sm text-muted-foreground underline hover:text-primary" onClick={() => { setCodeSent(false); setCode(""); setMessage(""); setError(""); }}>Use a different number or resend code</button> : null}
          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
        </CardContent>
      </Card>
    </main>
  );
}
