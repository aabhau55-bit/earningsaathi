import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Surface container — the base panel everything sits on.
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-surface shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink sm:text-base">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4 sm:p-5", className)}>{children}</div>;
}
