"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Catches any error thrown while rendering a page or layout under app/ (a
// transient DB hiccup — connection-pool pressure, a timeout — is the
// expected case; without this, Next.js's bare default crash page is what
// the user sees instead). Root layout itself is NOT covered here — see
// global-error.tsx for that.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-12">
      <Card className="w-full max-w-sm p-6 text-center sm:p-8">
        <h1 className="text-lg font-semibold text-ink sm:text-xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          A temporary hiccup loading this page — it usually clears up right
          away.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>
        )}
        <Button onClick={reset} className="mt-6 w-full">
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
      </Card>
    </main>
  );
}
