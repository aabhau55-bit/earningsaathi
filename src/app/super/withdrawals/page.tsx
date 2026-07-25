import Link from "next/link";
import { Wallet } from "lucide-react";
import { prizeupQuery } from "@/lib/prizeup/db";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

type RedemptionRow = {
  id: string;
  email: string;
  username: string | null;
  brand: string;
  value: string;
  coins: string;
  status: "pending" | "approved" | "sent" | "rejected";
  code: string | null;
  mode: string | null;
  amount: number | null;
  details: Record<string, string> | null;
  created_at: string;
};

const STATUS_FILTERS = ["all", "pending", "approved", "sent", "rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const num = (n: unknown) => Number(n ?? 0).toLocaleString();
const fmtDate = (s: string) =>
  new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const STATUS_TONE: Record<string, "good" | "critical" | "blue" | "neutral"> = {
  pending: "neutral",
  approved: "blue",
  sent: "good",
  rejected: "critical",
};

function destinationSummary(
  mode: string | null,
  details: Record<string, string> | null,
): string {
  if (!details) return "—";
  if (mode === "upi") return `UPI ${details.upi ?? "—"}${details.name ? ` (${details.name})` : ""}`;
  if (mode === "google_play" || mode === "infixmart") {
    return details.email ?? details.phone ?? "—";
  }
  return "—";
}

// Direct read against PrizeUp's real redemptions table — the exact same
// queue described in supabase/FULFILLMENT.md, oldest first. Read-only for
// now: no approve/reject actions wired up yet.
export default async function WithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: StatusFilter = STATUS_FILTERS.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "all";

  const allRows = await prizeupQuery<RedemptionRow>(`
    select r.id, u.email, p.username, r.brand, r.value, r.coins, r.status, r.code,
           r.mode, r.amount, r.details, r.created_at
    from redemptions r
    join profiles p on p.id = r.user_id
    join auth.users u on u.id = r.user_id
    order by r.created_at asc
  `);

  const counts = STATUS_FILTERS.reduce<Record<StatusFilter, number>>(
    (acc, s) => {
      acc[s] = s === "all" ? allRows.length : allRows.filter((r) => r.status === s).length;
      return acc;
    },
    { all: 0, pending: 0, approved: 0, sent: 0, rejected: 0 },
  );

  const rows = filter === "all" ? allRows : allRows.filter((r) => r.status === filter);

  const cols: Column<RedemptionRow>[] = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium text-ink">{r.username ?? "—"}</div>
          <div className="truncate text-xs text-muted">{r.email}</div>
        </div>
      ),
    },
    {
      key: "reward",
      header: "Reward",
      render: (r) => (
        <Link href={`/super/withdrawals/${r.id}`} className="font-medium text-ink hover:underline">
          {r.brand} {r.value}
        </Link>
      ),
    },
    { key: "coins", header: "Coins", align: "right", numeric: true, render: (r) => num(r.coins) },
    {
      key: "destination",
      header: "Destination",
      render: (r) => (
        <span className="text-xs text-muted">{destinationSummary(r.mode, r.details)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</Badge>,
    },
    {
      key: "created_at",
      header: "Requested",
      align: "right",
      render: (r) => <span className="text-muted">{fmtDate(r.created_at)}</span>,
    },
  ];

  const pill = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition",
      active
        ? "border-transparent bg-ink text-page"
        : "border-hairline bg-surface text-ink-2 hover:bg-surface-2",
    );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Withdrawals</h1>
        <p className="mt-1 text-sm text-muted">
          {counts.pending} pending — oldest first, matching the app&apos;s 24h fulfillment promise.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <Link key={s} href={s === "all" ? "/super/withdrawals" : `/super/withdrawals?status=${s}`}>
            <span className={pill(filter === s)}>
              {s} ({counts[s]})
            </span>
          </Link>
        ))}
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        getRowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title={filter === "all" ? "No withdrawal requests yet" : `No ${filter} requests`}
          />
        }
      />
    </section>
  );
}
