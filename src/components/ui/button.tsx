import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(100deg,#22c55e,#15803d)] text-white shadow-[0_14px_34px_-10px_rgba(34,197,94,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_20px_44px_-10px_rgba(34,197,94,0.85),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0",
  secondary:
    "border border-hairline bg-surface text-ink backdrop-blur-xl hover:bg-surface-2 hover:border-[rgba(74,222,128,0.45)] disabled:opacity-50",
  ghost: "text-ink hover:bg-surface-2 disabled:opacity-50",
  danger:
    "bg-critical text-white hover:opacity-90 disabled:opacity-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-baseline disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
