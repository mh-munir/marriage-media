"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Eye, EyeOff, Loader2, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerSchema } from "@/lib/validations";
import { sanitizePhoneNumberInput } from "@/lib/utils";
import type { z } from "zod";
import { useLanguage } from "@/providers/language-provider";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { language, translateText: text } = useLanguage();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pendingUserId, setPendingUserId] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setPendingUserId(result.userId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: pendingUserId, code: otp }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Verification failed");
      router.replace("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div
      className="auth-page-shell relative flex min-h-screen items-center justify-center px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="auth-brand-mark flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 via-pink-500 to-orange-400">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span suppressHydrationWarning className="text-2xl font-bold tracking-tight text-primary">
            {language === "bn" ? "হালাল বিয়ে" : "Halal Biye"}
          </span>
        </Link>

        <Card className="auth-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{text("Create Your Account")}</CardTitle>
            <CardDescription>
              {text("Join thousands finding their perfect match")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUserId ? <form onSubmit={verifyOtp} className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{text("A verification code was sent to your mobile number.")}</div>
              <Input label={text("Mobile verification code")} inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
              <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={otpLoading}>{otpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> {text("Verify and continue")}</>}</Button>
            </form> : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Input
                label={text("Mobile Number")}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                icon={<span className="text-sm font-semibold">+88</span>}
                placeholder="018XXXXXXXX"
                error={errors.phone?.message}
                {...register("phone")}
                onInput={(event) => {
                  event.currentTarget.value = sanitizePhoneNumberInput(event.currentTarget.value);
                }}
              />

              <div className="relative">
                <Input
                  label={text("Password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={text("Create a strong password")}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label={text("Confirm Password")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={text("Confirm your password")}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {text("Create Account")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{text("Already have an account?")} </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                {text("Sign in")}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-2">
          {["100% free to register", "AI-powered matching", "Verified profiles only"].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {text(benefit)}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
