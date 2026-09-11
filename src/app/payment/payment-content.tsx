"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultManualPaymentNumbers, defaultPricingPlans, type ManualPaymentNumbers, type PricingPlan } from "@/lib/pricing";

type PricingResponse = {
  plans?: PricingPlan[];
  paymentNumbers?: ManualPaymentNumbers;
};

export function PaymentContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "";
  const [plans, setPlans] = React.useState<PricingPlan[]>(defaultPricingPlans);
  const [paymentNumbers, setPaymentNumbers] = React.useState<ManualPaymentNumbers>(defaultManualPaymentNumbers);
  const [isLoading, setIsLoading] = React.useState(true);
  const [paymentMethod, setPaymentMethod] = React.useState<"bkash" | "nagad">("bkash");
  const [senderMobileNumber, setSenderMobileNumber] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      try {
        const response = await fetch("/api/pricing");
        const data = (await response.json()) as PricingResponse;
        if (isMounted && Array.isArray(data.plans)) {
          setPlans(data.plans);
          if (data.paymentNumbers) setPaymentNumbers(data.paymentNumbers);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const plan = plans.find((item) => item.id === planId);

  async function submitManualPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!plan) return;
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/payment/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, paymentMethod, senderMobileNumber, transactionId }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not submit payment");
      setMessage("Payment submitted successfully. Our team will verify it shortly.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit payment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/pricing" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to pricing
      </Link>

      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <div className="bg-linear-to-r from-primary to-rose-500 px-6 py-7 text-primary-foreground">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <CreditCard className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Complete your payment</h1>
          <p className="mt-1 text-sm text-primary-foreground/85">Review your selected plan and payment details.</p>
        </div>

        <CardContent className="space-y-5 p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading selected plan…</p>
          ) : !plan ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Please select a plan before continuing.</p>
              <Button asChild className="w-full"><Link href="/pricing">View pricing plans</Link></Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submitManualPayment}>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected plan</p>
                <p className="mt-1 text-lg font-semibold">{plan.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Send payment to</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-900/50 dark:bg-pink-950/20">
                    <p className="text-xs font-medium text-pink-700 dark:text-pink-300">bKash Personal</p>
                    <p className="mt-1 font-semibold tabular-nums">{paymentNumbers.bkash}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-950/20">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Nagad Personal</p>
                    <p className="mt-1 font-semibold tabular-nums">{paymentNumbers.nagad}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={paymentMethod === "bkash" ? "default" : "outline"} onClick={() => setPaymentMethod("bkash")}>bKash</Button>
                  <Button type="button" variant={paymentMethod === "nagad" ? "default" : "outline"} onClick={() => setPaymentMethod("nagad")}>Nagad</Button>
                </div>
              </div>

              <Input
                id="sender-mobile-number"
                label="Sender mobile number"
                type="tel"
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={senderMobileNumber}
                onChange={(event) => setSenderMobileNumber(event.target.value)}
                maxLength={11}
                required
              />

              <Input
                id="transaction-id"
                label="Transaction ID"
                placeholder="Enter the transaction ID from your payment"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                required
              />

              <Input
                id="payment-price"
                label="Price"
                value={`৳${plan.price} ${plan.period}`}
                readOnly
                className="font-semibold"
              />

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

              <Button className="w-full" variant="gradient" type="submit" disabled={isSubmitting || Boolean(message)}>
                {isSubmitting ? "Submitting…" : "Submit payment for verification"}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Your payment details are kept secure.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
