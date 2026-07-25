import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-hairline bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-baseline focus:ring-2 focus:ring-baseline/40",
        className,
      )}
      {...props}
    />
  );
}

// Labeled field wrapper with optional hint/error, for forms.
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink-2"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-critical">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
