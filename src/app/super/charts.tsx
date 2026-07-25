"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartFrame, ChartTooltip } from "@/components/ui/chart";
import { CHART_INK } from "@/lib/chart-theme";

const axis = { stroke: CHART_INK.muted, fontSize: 11, tickLine: false, axisLine: false };

// Signups over time — single series, so no legend (the card title names it).
export function SignupsOverTime({
  data,
}: {
  data: { day: string; signups: number }[];
}) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return (
    <ChartFrame height={260} mobileHeight={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
        <XAxis dataKey="day" tickFormatter={fmt} minTickGap={24} {...axis} />
        <YAxis allowDecimals={false} width={32} {...axis} />
        <ChartTooltip />
        <Area
          type="monotone"
          dataKey="signups"
          name="Signups"
          stroke="var(--series-1)"
          strokeWidth={2}
          fill="url(#sg)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartFrame>
  );
}
