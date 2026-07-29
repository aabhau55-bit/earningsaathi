"use client";

import { useEffect } from "react";
import "./globals.css";

// Only mounts if the root layout itself throws — Next.js unmounts the
// broken layout, so this must supply its own <html>/<body>. Deliberately
// plain (no Card/Button/Toaster) so it can't fail the same way.
export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-page text-ink">
        <main className="flex min-h-dvh items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-6 text-center shadow-sm sm:p-8">
            <h1 className="text-lg font-semibold sm:text-xl">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted">
              A temporary hiccup loading this page — it usually clears up
              right away.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted">
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-[linear-gradient(100deg,#22c55e,#15803d)] px-4 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
