"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-lg">
            <div className="mx-auto mb-6 p-4 rounded-full bg-destructive/10 w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-2">
              We encountered an unexpected error. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}