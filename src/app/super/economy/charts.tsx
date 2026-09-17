"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { ChartFrame, ChartTooltip } from "@/components/ui/chart";
import { CHART_INK, SERIES_VAR } from "@/lib/chart-theme";

const axis = {
  stroke: CHART_INK.muted,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

/**
 * Coins issued vs money earned, daily, both in rupees.
 *
 * Two series on ONE axis, which is only legitimate because both are the same
 * unit: coin liability is converted at the app's own 100 coins = ₹1 redemption
 * rate, and offerwall revenue at the rate stated on the page. A second y-axis
 * would let any two lines be drawn to look level, which is the whole reason the
 * gap this chart exists to show would disappear.
 *
 * Hue slots 1 and 2 of the house categorical order, validated as a pair against
 * the dark surface (deutan ΔE 19.6, normal 20.9 — both well clear of the
 * floors). Legend is always present because there are two series; identity is
 * never carried by colour alone.
 */
export function IssuedVsEarned({
  data,
}: {
  data: { day: string; issued: number; earned: number }[];
}) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <ChartFrame height={280} mobileHeight={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="issued" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_VAR[0]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={SERIES_VAR[0]} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="earned" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_VAR[1]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={SERIES_VAR[1]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
        <XAxis dataKey="day" tickFormatter={fmt} minTickGap={24} {...axis} />
        <YAxis
          width={44}
          tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
          {...axis}
        />
        <ChartTooltip />
        <Legend
          verticalAlign="top"
          align="left"
          height={28}
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: CHART_INK.secondary }}
        />
        <Area
          type="monotone"
          dataKey="issued"
          name="Coins issued (₹ liability)"
          stroke={SERIES_VAR[0]}
          strokeWidth={2}
          fill="url(#issued)"
          dot={false}
          activeDot={{ r: 4, stroke: CHART_INK.surface, strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="earned"
          name="Offer revenue (₹ earned)"
          stroke={SERIES_VAR[1]}
          strokeWidth={2}
          fill="url(#earned)"
          dot={false}
          activeDot={{ r: 4, stroke: CHART_INK.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartFrame>
  );
}
