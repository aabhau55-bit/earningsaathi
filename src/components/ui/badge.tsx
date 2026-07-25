import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "blue" | "aqua" | "violet" | "good" | "critical";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  blue: "bg-series-1/15 text-series-1",
  aqua: "bg-series-2/15 text-series-2",
  violet: "bg-series-5/15 text-series-5",
  good: "bg-good/15 text-good",
  critical: "bg-critical/15 text-critical",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
