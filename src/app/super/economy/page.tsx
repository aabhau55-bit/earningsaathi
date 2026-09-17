import { Coins, DollarSign, Wallet, Repeat } from "lucide-react";
import { prizeupQuery } from "@/lib/prizeup/db";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IssuedVsEarned } from "./charts";

/**
 * The money view: what the app gives away versus what it takes in.
 *
 * The Overview page answers "how many users" — this one answers "is this
 * profitable", which nothing in the dashboard could show before. Every number
 * comes from the existing ledger, so there is no instrumentation to ship.
 */

/** The app's own redemption price. Mirrors `rate` in phase30/phase31. */
const COINS_PER_RUPEE = 100;

/**
 * The offerwall dashboard rate: each provider converts our USD payout into
 * coins at $1 = 2150 before sending it, so dividing the coins we credited by
 * this recovers roughly what the offer paid US. Keep in step with the rate set
 * on the PubScale / GrowDeck / GrowBolt dashboards (and GROWBOLT_COINS_PER_USD).
 */
const COINS_PER_USD = 2150;

/** Rough USD→INR, for putting revenue and liability on one axis. Display only. */
const USD_INR = 88;

const rupees = (coins: number) => coins / COINS_PER_RUPEE;
const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

type Kpis = {
  issued_coins_30d: string;
  offer_coins_30d: string;
  outstanding_coins: string;
  users_at_min_payout: string;
};
type DayRow = { day: string; issued_coins: string; offer_coins: string };
type SourceRow = { source: string; coins: string; events: number };
type ProviderRow = { provider: string | null; conversions: number; coins: string };
type RetentionRow = { cohort_size: number; active_last_7d: number };

export default async function EconomyPage() {
  const [kpiRows, dayRows, sourceRows, providerRows, retentionRows] =
    await Promise.all([
      prizeupQuery<Kpis>(`
        select
          (select coalesce(sum(amount),0) from transactions
            where kind='earn' and currency='coin'
              and created_at > now() - interval '30 days')      as issued_coins_30d,
          (select coalesce(sum(coins),0) from offerwall_rewards
            where created_at > now() - interval '30 days')      as offer_coins_30d,
          (select coalesce(sum(coins),0) from profiles)         as outstanding_coins,
          (select count(*) from profiles where coins >= 5000)   as users_at_min_payout
      `),
      // Grouped then joined to a day series, rather than a correlated subquery
      // per day — this runs against the live production database on every page
      // view, so it gets two index scans, not sixty.
      prizeupQuery<DayRow>(`
        with days as (
          select generate_series(current_date - 29, current_date, interval '1 day')::date as day
        ),
        issued as (
          select created_at::date as day, sum(amount) as coins
            from transactions
           where kind='earn' and currency='coin' and created_at >= current_date - 29
           group by 1
        ),
        earned as (
          select created_at::date as day, sum(coins) as coins
            from offerwall_rewards
           where created_at >= current_date - 29
           group by 1
        )
        select d.day::text as day,
               coalesce(issued.coins, 0)::bigint as issued_coins,
               coalesce(earned.coins, 0)::bigint as offer_coins
          from days d
          left join issued on issued.day = d.day
          left join earned on earned.day = d.day
         order by d.day
      `),
      prizeupQuery<SourceRow>(`
        select source, sum(amount)::bigint as coins, count(*)::int as events
          from transactions
         where kind='earn' and currency='coin'
           and created_at > now() - interval '30 days'
         group by source
         order by sum(amount) desc
      `),
      prizeupQuery<ProviderRow>(`
        select provider, count(*)::int as conversions, sum(coins)::bigint as coins
          from offerwall_rewards
         where created_at > now() - interval '30 days'
         group by provider
         order by sum(coins) desc
      `),
      prizeupQuery<RetentionRow>(`
        with cohort as (
          select id from profiles
           where created_at between now() - interval '30 days' and now() - interval '7 days'
        )
        select (select count(*) from cohort)::int as cohort_size,
               (select count(distinct t.user_id)
                  from transactions t join cohort c on c.id = t.user_id
                 where t.created_at > now() - interval '7 days')::int as active_last_7d
      `),
    ]);

  const k = kpiRows[0];
  const issued30 = Number(k?.issued_coins_30d ?? 0);
  const offerCoins30 = Number(k?.offer_coins_30d ?? 0);
  const outstanding = Number(k?.outstanding_coins ?? 0);

  const revenueUsd30 = offerCoins30 / COINS_PER_USD;
  const liability30 = rupees(issued30);

  const ret = retentionRows[0];
  const retentionPct =
    ret && ret.cohort_size > 0
      ? (100 * ret.active_last_7d) / ret.cohort_size
      : 0;

  const chartData = dayRows.map((r) => ({
    day: r.day,
    issued: Math.round(rupees(Number(r.issued_coins))),
    earned: Math.round((Number(r.offer_coins) / COINS_PER_USD) * USD_INR),
  }));

  const totalIssued = sourceRows.reduce((a, r) => a + Number(r.coins), 0);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Economy</h1>
        <p className="mt-1 text-sm text-muted">
          Coins issued versus money earned, last 30 days. Ad revenue is not in
          here — it lives on the LevelPlay dashboard, so &ldquo;earned&rdquo;
          below is offerwall only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Coins issued (30d)"
          value={inr(liability30)}
          hint={`${Math.round(issued30).toLocaleString("en-IN")} coins`}
          accent="blue"
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          label="Offer revenue (30d)"
          value={`$${revenueUsd30.toFixed(2)}`}
          hint={`≈ ${inr(revenueUsd30 * USD_INR)}`}
          accent="aqua"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Outstanding liability"
          value={inr(rupees(outstanding))}
          hint={`${Number(k?.users_at_min_payout ?? 0).toLocaleString("en-IN")} users can redeem`}
          accent="orange"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="7-day retention"
          value={`${retentionPct.toFixed(1)}%`}
          hint={`of ${(ret?.cohort_size ?? 0).toLocaleString("en-IN")} who joined 7–30d ago`}
          accent="violet"
          icon={<Repeat className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader
          title="Issued vs earned"
          description={`Daily, in rupees. Coins at ${COINS_PER_RUPEE} = ₹1; offer revenue at $1 = ${COINS_PER_USD} coins, ₹${USD_INR} = $1.`}
        />
        <CardBody>
          {chartData.length ? (
            <IssuedVsEarned data={chartData} />
          ) : (
            <EmptyState title="No activity in the last 30 days" />
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Where the coins go"
            description="Coins issued by source, last 30 days."
          />
          <CardBody>
            {sourceRows.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 text-right font-medium">Events</th>
                    <th className="pb-2 text-right font-medium">Value</th>
                    <th className="pb-2 text-right font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.map((r) => {
                    const coins = Number(r.coins);
                    const share = totalIssued ? (100 * coins) / totalIssued : 0;
                    return (
                      <tr key={r.source} className="border-t border-hairline">
                        <td className="py-2 text-ink">{r.source}</td>
                        <td className="py-2 text-right text-muted">
                          {r.events.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 text-right text-ink">
                          {inr(rupees(coins))}
                        </td>
                        <td className="py-2 text-right text-muted">
                          {share.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState title="Nothing issued in the last 30 days" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Offerwall revenue by provider"
            description="What each wall actually earned us, last 30 days."
          />
          <CardBody>
            {providerRows.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="pb-2 font-medium">Provider</th>
                    <th className="pb-2 text-right font-medium">Conversions</th>
                    <th className="pb-2 text-right font-medium">We earned</th>
                    <th className="pb-2 text-right font-medium">Paid out</th>
                  </tr>
                </thead>
                <tbody>
                  {providerRows.map((r) => {
                    const coins = Number(r.coins);
                    return (
                      <tr
                        key={r.provider ?? "unknown"}
                        className="border-t border-hairline"
                      >
                        <td className="py-2 text-ink">{r.provider ?? "unknown"}</td>
                        <td className="py-2 text-right text-muted">
                          {r.conversions.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 text-right text-ink">
                          ${(coins / COINS_PER_USD).toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-muted">
                          {inr(rupees(coins))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No offer conversions in the last 30 days" />
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
