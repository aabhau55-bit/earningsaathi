"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

// Copy-to-clipboard control. Shows an inline check + a toast. Used for the
// referral link and dashboard URL on the admin "create creator" result.
export function CopyButton({
  value,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  className,
}: {
  value: string;
  label?: string;
  toastMessage?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy it manually");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-2",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-good" />
      ) : (
        <Copy className="h-4 w-4 text-muted" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

// A read-only value box with a copy button — for showing generated URLs.
export function CopyField({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-hairline bg-surface-2 p-1.5",
        className,
      )}
    >
      <code className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-ink-2">
        {value}
      </code>
      <CopyButton value={value} className="shrink-0 bg-surface" />
    </div>
  );
}
