"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerSchema } from "@/lib/validations";
import { sanitizePhoneNumberInput } from "@/lib/utils";
import type { z } from "zod";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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

      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12"
      style={{ backgroundImage: "url('/images/home/hero-bg2.png')" }}
    >
      <div className="absolute inset-0 bg-black/35" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Marriage<span className="text-primary">Media</span>
          </span>
        </Link>

        <Card className="border-white/40 bg-background/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Join thousands finding their perfect match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                error={errors.phone?.message}
                {...register("phone")}
                onInput={(event) => {
                  event.currentTarget.value = sanitizePhoneNumberInput(event.currentTarget.value);
                }}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-2">
          {["100% free to register", "AI-powered matching", "Verified profiles only"].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {benefit}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}