import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Accent =
  | "neutral"
  | "blue"
  | "aqua"
  | "yellow"
  | "green"
  | "violet"
  | "red"
  | "orange";

const ACCENT: Record<Accent, string> = {
  neutral: "bg-surface-2 text-muted",
  blue: "bg-series-1/15 text-series-1",
  aqua: "bg-series-2/15 text-series-2",
  yellow: "bg-series-3/15 text-series-3",
  green: "bg-series-4/15 text-series-4",
  violet: "bg-series-5/15 text-series-5",
  red: "bg-series-6/15 text-series-6",
  orange: "bg-series-8/15 text-series-8",
};

// A stat tile — the right "form" when the data's job is a single headline number
// (per data-viz: sometimes the answer is not a chart). The icon sits in a
// tinted accent chip for a more premium feel.
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "neutral",
  loading,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: Accent;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-surface p-4 shadow-sm transition hover:shadow-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              ACCENT[accent],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-surface-2" />
      ) : (
        <div className="mt-2 text-3xl font-semibold leading-none tracking-tight text-ink sm:text-[2rem]">
          {value}
        </div>
      )}
      {hint && !loading && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Responsive grid for a row of stat tiles.
export function StatGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5", className)}
    >
      {children}
    </div>
  );
}
