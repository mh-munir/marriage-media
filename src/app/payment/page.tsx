import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PaymentContent } from "./payment-content";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      <main className="px-4 pb-16 pt-28 sm:pt-32">
        <Suspense fallback={<div className="mx-auto max-w-md text-center text-muted-foreground">Loading payment page…</div>}>
          <PaymentContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
