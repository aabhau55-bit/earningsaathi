// Chart palette — the validated categorical order. Assign a hue to an entity
// ONCE, in this order; never cycle a 9th series (fold into "Other"). CSS vars so
// light/dark swap automatically. Use `SERIES_VAR[i]` for recharts `fill`/`stroke`.
export const SERIES_VAR = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;

export const CHART_INK = {
  primary: "var(--ink)",
  secondary: "var(--ink-2)",
  muted: "var(--muted)",
  grid: "var(--gridline)",
  baseline: "var(--baseline)",
  surface: "var(--surface)",
} as const;

// Stable hue per named entity (e.g. app slug), so a filter never repaints
// survivors. Falls back to slot order for unknown keys.
export function seriesColor(index: number): string {
  return SERIES_VAR[index % SERIES_VAR.length];
}
