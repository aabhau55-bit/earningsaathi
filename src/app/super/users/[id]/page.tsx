import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins, Gem, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prizeupQuery } from "@/lib/prizeup/db";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyField, CopyButton } from "@/components/ui/copy-button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { referralUrl, creatorStatsUrl } from "@/lib/urls";
import { AdjustBalanceForm } from "@/components/adjust-balance-form";

type Profile = {
  id: string;
  email: string;
  username: string | null;
  referral_code: string | null;
  coins: string;
  gems: string;
  streak: number;
  created_at: string;
  last_sign_in_at: string | null;
};
type TransactionRow = {
  id: string;
  kind: "earn" | "redeem";
  source: string;
  amount: string;
  title: string;
  currency: string;
  created_at: string;
};
type RedemptionRow = {
  id: string;
  brand: string;
  value: string;
  coins: string;
  status: string;
  created_at: string;
};
type AdjustmentRow = {
  id: string;
  admin_id: string;
  coins_delta: number;
  gems_delta: number;
  reason: string;
  created_at: string;
};
type AdminInfo = { id: string; email: string; name: string | null };

const num = (n: unknown) => Number(n ?? 0).toLocaleString();
const signed = (n: number) => (n > 0 ? `+${num(n)}` : num(n));
const fmtDate = (s: string | null) =>
  s
    ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [profiles, transactions, redemptions, adjustmentsRes] = await Promise.all([
    prizeupQuery<Profile>(
      `select p.id, u.email, p.username, p.referral_code, p.coins, p.gems, p.streak,
              p.created_at, u.last_sign_in_at
       from profiles p
       join auth.users u on u.id = p.id
       where p.id = $1`,
      [id],
    ),
    prizeupQuery<TransactionRow>(
      `select id, kind, source, amount, title, currency, created_at
       from transactions where user_id = $1
       order by created_at desc limit 20`,
      [id],
    ),
    prizeupQuery<RedemptionRow>(
      `select id, brand, value, coins, status, created_at
       from redemptions where user_id = $1
       order by created_at desc limit 20`,
      [id],
    ),
    supabase
      .from("balance_adjustments")
      .select("id, admin_id, coins_delta, gems_delta, reason, created_at")
      .eq("prizeup_user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profiles[0];
  if (!profile) notFound();

  const adjustments = (adjustmentsRes.data ?? []) as AdjustmentRow[];
  let adminById = new Map<string, AdminInfo>();
  if (adjustments.length > 0) {
    const adminIds = [...new Set(adjustments.map((a) => a.admin_id))];
    const { data: admins } = await supabase
      .from("platform_users")
      .select("id, email, name")
      .in("id", adminIds);
    adminById = new Map((admins ?? []).map((a) => [a.id, a as AdminInfo]));
  }

  const txCols: Column<TransactionRow>[] = [
    { key: "title", header: "Event", render: (r) => r.title },
    { key: "source", header: "Source", render: (r) => <span className="text-xs text-muted">{r.source}</span> },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      render: (r) => (
        <span className={r.kind === "earn" ? "text-good" : "text-critical"}>
          {r.kind === "earn" ? "+" : "-"}
          {num(r.amount)} {r.currency}
        </span>
      ),
    },
    { key: "created_at", header: "When", align: "right", render: (r) => <span className="text-muted">{fmtDate(r.created_at)}</span> },
  ];

  const redemptionCols: Column<RedemptionRow>[] = [
    { key: "reward", header: "Reward", render: (r) => `${r.brand} ${r.value}` },
    { key: "coins", header: "Coins", align: "right", numeric: true, render: (r) => num(r.coins) },
    { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "sent" ? "good" : r.status === "rejected" ? "critical" : "neutral"}>{r.status}</Badge> },
    { key: "created_at", header: "Requested", align: "right", render: (r) => <span className="text-muted">{fmtDate(r.created_at)}</span> },
  ];

  const adjustmentCols: Column<AdjustmentRow>[] = [
    {
      key: "delta",
      header: "Change",
      render: (r) => (
        <span className="text-ink">
          {r.coins_delta !== 0 && <span>{signed(r.coins_delta)} coins</span>}
          {r.coins_delta !== 0 && r.gems_delta !== 0 && ", "}
          {r.gems_delta !== 0 && <span>{signed(r.gems_delta)} gems</span>}
        </span>
      ),
    },
    { key: "reason", header: "Reason", render: (r) => r.reason },
    {
      key: "admin",
      header: "By",
      render: (r) => adminById.get(r.admin_id)?.name ?? adminById.get(r.admin_id)?.email ?? "—",
    },
    { key: "created_at", header: "When", align: "right", render: (r) => <span className="text-muted">{fmtDate(r.created_at)}</span> },
  ];

  return (
    <section className="space-y-6">
      <Link href="/super/users" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-ink sm:text-xl">
              {profile.username ?? profile.email}
            </h1>
            <p className="mt-1 text-sm text-muted">{profile.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <code className="font-mono text-xs text-muted">{profile.id}</code>
              <CopyButton value={profile.id} label="" />
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-muted">
            <div>Joined {fmtDate(profile.created_at)}</div>
            <div className="mt-1">Last sign-in {fmtDate(profile.last_sign_in_at)}</div>
          </div>
        </CardBody>
      </Card>

      {profile.referral_code && (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-ink-2">Referral link</span>
              <CopyField value={referralUrl(profile.referral_code)} />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-ink-2">Stats link</span>
              <CopyField value={creatorStatsUrl(profile.referral_code)} />
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Coins" value={num(profile.coins)} accent="yellow" icon={<Coins className="h-4 w-4" />} />
        <StatCard label="Gems" value={num(profile.gems)} accent="violet" icon={<Gem className="h-4 w-4" />} />
        <StatCard label="Streak" value={num(profile.streak)} accent="green" icon={<Flame className="h-4 w-4" />} />
      </div>

      <AdjustBalanceForm prizeupUserId={profile.id} />

      {adjustments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Adjustment history ({adjustments.length})</h2>
          <DataTable columns={adjustmentCols} rows={adjustments} getRowKey={(r) => r.id} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Recent activity</h2>
        <DataTable
          columns={txCols}
          rows={transactions}
          getRowKey={(r) => r.id}
          empty={<EmptyState title="No activity yet" />}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Redemptions ({redemptions.length})</h2>
        <DataTable
          columns={redemptionCols}
          rows={redemptions}
          getRowKey={(r) => r.id}
          empty={<EmptyState title="No redemptions yet" />}
        />
      </div>
    </section>
  );
}
