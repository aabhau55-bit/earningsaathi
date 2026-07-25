"use client";

import type { ReactElement } from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { CHART_INK } from "@/lib/chart-theme";

// Responsive chart frame — gives Recharts a sized parent and a consistent height
// that scales down on mobile. Pass a single Recharts chart element as children.
export function ChartFrame({
  height = 280,
  mobileHeight = 200,
  children,
}: {
  height?: number;
  mobileHeight?: number;
  children: ReactElement;
}) {
  return (
    <>
      <div className="block sm:hidden" style={{ width: "100%", height: mobileHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <div className="hidden sm:block" style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </>
  );
}

// Themed tooltip — ink tokens for text, surface for the card. Text wears text
// tokens; the colored swatch beside each row carries series identity.
export function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ stroke: CHART_INK.grid }}
      contentStyle={{
        background: "rgba(6, 20, 14, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        fontSize: 12,
        color: CHART_INK.primary,
        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.6)",
      }}
      labelStyle={{ color: CHART_INK.secondary, marginBottom: 4 }}
      itemStyle={{ color: CHART_INK.primary }}
    />
  );
}
