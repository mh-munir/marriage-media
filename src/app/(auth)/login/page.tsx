"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginSchema } from "@/lib/validations";
import { sanitizePhoneNumberInput } from "@/lib/utils";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import type { z } from "zod";
import { useLanguage } from "@/providers/language-provider";

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuthStore();
  const { language, translateText: text } = useLanguage();
  const registered = searchParams.get("registered");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const submitInProgress = React.useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    if (submitInProgress.current) return;
    submitInProgress.current = true;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      setTokens(result.accessToken, result.refreshToken);
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        throw new Error("Could not load your account details");
      }
      const { user } = (await userResponse.json()) as { user: AuthUser };
      setUser(user);
      router.push(user.onboardingCompleted ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(text(message));
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    if (submitInProgress.current) {
      event.preventDefault();
      return;
    }
    void handleSubmit(onSubmit)(event);
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
            <CardTitle className="text-2xl">{text("Welcome Back")}</CardTitle>
            <CardDescription>
              {text("Sign in to continue your journey")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {text("Account created successfully! Please sign in.")}
              </div>
            )}

            <form onSubmit={submitForm} className="space-y-4">
              <Input
                label={text("Mobile Number")}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                icon={<span className="text-sm font-semibold">+88</span>}
                placeholder={text("018XXXXXXXX")}
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
                  placeholder={text("Enter your password")}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  {text("Remember me")}
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {text("Forgot password?")}
                </Link>
              </div>

              <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {text("Signing in...")}
                  </>
                ) : (
                  <>
                    {text("Sign In")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{text("Don't have an account?")} </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                 {text("Register free")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
