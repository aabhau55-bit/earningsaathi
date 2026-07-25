import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EmptyState } from "./empty-state";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** tabular-nums for numeric columns that should align vertically */
  numeric?: boolean;
  className?: string;
};

// Responsive table: scrolls horizontally inside its own container on small
// screens (body never scrolls sideways). Server-renderable (no hooks).
export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowKey,
  empty,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  empty?: ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <>{empty ?? <EmptyState title="Nothing here yet" />}</>
    );
  }

  const alignClass = (a?: Column<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-hairline bg-surface",
        className,
      )}
    >
      <table className="w-full min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted",
                  alignClass(c.align),
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className="border-b border-hairline last:border-0 hover:bg-surface-2/60"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-ink",
                    alignClass(c.align),
                    c.numeric && "tabular-nums",
                    c.className,
                  )}
                >
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
