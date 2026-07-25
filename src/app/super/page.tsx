import Link from "next/link";
import {
  ChevronRight,
  Users,
  Coins,
  Gem,
  UserPlus,
  Wallet,
  ShieldCheck,
  Search,
} from "lucide-react";
import { prizeupQuery } from "@/lib/prizeup/db";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SignupsOverTime } from "./charts";

type Kpis = {
  total_users: string;
  total_coins: string;
  total_gems: string;
  total_referrals: string;
  pending_withdrawals: string;
};
type DayRow = { day: string; signups: string };

const num = (n: unknown) => Number(n ?? 0).toLocaleString();

export default async function SuperHome() {
  const [kpisRows, overTimeRows] = await Promise.all([
    prizeupQuery<Kpis>(`
      select
        (select count(*) from profiles) as total_users,
        (select coalesce(sum(coins), 0) from profiles) as total_coins,
        (select coalesce(sum(gems), 0) from profiles) as total_gems,
        (select count(*) from referrals) as total_referrals,
        (select count(*) from redemptions where status = 'pending') as pending_withdrawals
    `),
    prizeupQuery<DayRow>(`
      select d.day::date::text as day, count(p.id)::int as signups
      from generate_series(current_date - 29, current_date, interval '1 day') as d(day)
      left join profiles p on p.created_at::date = d.day::date
      group by d.day
      order by d.day
    `),
  ]);

  const kpis = kpisRows[0];
  const timeData = overTimeRows.map((r) => ({
    day: r.day,
    signups: Number(r.signups),
  }));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Overview</h1>
        <p className="mt-1 text-sm text-muted">Live from the PrizeUp app.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={num(kpis.total_users)} accent="blue" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Coins" value={num(kpis.total_coins)} accent="yellow" icon={<Coins className="h-4 w-4" />} />
        <StatCard label="Gems" value={num(kpis.total_gems)} accent="violet" icon={<Gem className="h-4 w-4" />} />
        <StatCard label="Referrals" value={num(kpis.total_referrals)} accent="green" icon={<UserPlus className="h-4 w-4" />} />
        <StatCard label="Pending withdrawals" value={num(kpis.pending_withdrawals)} accent="orange" icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/super/users" className="group">
          <Card className="flex items-center justify-between p-4 transition group-hover:border-baseline">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-series-1/15 text-series-1">
                <Search className="h-4 w-4" />
              </span>
              <div>
                <div className="font-medium text-ink">Search users</div>
                <div className="text-xs text-muted">Look up by email, UID, or username</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Card>
        </Link>
        <Link href="/super/withdrawals" className="group">
          <Card className="flex items-center justify-between p-4 transition group-hover:border-baseline">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-series-8/15 text-series-8">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <div className="font-medium text-ink">Withdrawals</div>
                <div className="text-xs text-muted">
                  {num(kpis.pending_withdrawals)} pending
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Card>
        </Link>
        <Link href="/super/admins" className="group">
          <Card className="flex items-center justify-between p-4 transition group-hover:border-baseline">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-series-5/15 text-series-5">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <div className="font-medium text-ink">Admins</div>
                <div className="text-xs text-muted">Admins &amp; their campaigns</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader title="Signups over time" description="Last 30 days" />
        <CardBody>
          {timeData.some((d) => d.signups > 0) ? (
            <SignupsOverTime data={timeData} />
          ) : (
            <EmptyState title="No signups in this window" />
          )}
        </CardBody>
      </Card>
    </section>
  );
}
