"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [firstName, setFirstName] = React.useState(user?.firstName || "");
  const [lastName, setLastName] = React.useState(user?.lastName || "");
  const [gender, setGender] = React.useState<"Male" | "Female" | undefined>(user?.gender);
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.onboardingCompleted) router.replace("/dashboard");
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!gender) {
      setError("Please select your gender before continuing.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, gender }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save your details.");

      updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), gender, onboardingCompleted: true });
      router.replace("/dashboard");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-rose-50 via-background to-orange-50 px-4 py-12 dark:from-rose-950/20 dark:to-orange-950/10">
      <Card className="w-full max-w-lg border-rose-200/70 shadow-xl dark:border-rose-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Complete your account</CardTitle>
          <CardDescription>Tell us your name and gender before building your full biodata.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoFocus />
              <Input label="Last Name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {(["Male", "Female"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${gender === option ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Save and continue <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
