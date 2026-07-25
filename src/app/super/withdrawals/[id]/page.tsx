import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prizeupQuery } from "@/lib/prizeup/db";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { WithdrawalActions } from "@/components/withdrawal-actions";

type Redemption = {
  id: string;
  user_id: string;
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
type ActionRow = {
  id: string;
  admin_id: string;
  action: string;
  note: string | null;
  created_at: string;
};
type AdminInfo = { id: string; email: string; name: string | null };

const num = (n: unknown) => Number(n ?? 0).toLocaleString();
const fmtDate = (s: string) =>
  new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const STATUS_TONE: Record<string, "good" | "critical" | "blue" | "neutral"> = {
  pending: "neutral",
  approved: "blue",
  sent: "good",
  rejected: "critical",
};

// Payout `details` is jsonb with a shape that depends on `mode` (upi vs.
// google_play/infixmart) — labeled generically here so any shape renders.
const DETAIL_LABELS: Record<string, string> = {
  upi: "UPI ID",
  name: "Account name",
  email: "Email",
  phone: "Phone",
};

export default async function WithdrawalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [rows, actionsRes] = await Promise.all([
    prizeupQuery<Redemption>(
      `select r.id, r.user_id, u.email, p.username, r.brand, r.value, r.coins, r.status,
              r.code, r.mode, r.amount, r.details, r.created_at
       from redemptions r
       join profiles p on p.id = r.user_id
       join auth.users u on u.id = r.user_id
       where r.id = $1`,
      [id],
    ),
    supabase
      .from("withdrawal_actions")
      .select("id, admin_id, action, note, created_at")
      .eq("prizeup_redemption_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const redemption = rows[0];
  if (!redemption) notFound();

  const actions = (actionsRes.data ?? []) as ActionRow[];
  let adminById = new Map<string, AdminInfo>();
  if (actions.length > 0) {
    const adminIds = [...new Set(actions.map((a) => a.admin_id))];
    const { data: admins } = await supabase
      .from("platform_users")
      .select("id, email, name")
      .in("id", adminIds);
    adminById = new Map((admins ?? []).map((a) => [a.id, a as AdminInfo]));
  }

  const actionCols: Column<ActionRow>[] = [
    {
      key: "action",
      header: "Action",
      render: (r) => <Badge tone={STATUS_TONE[r.action] ?? "neutral"}>{r.action}</Badge>,
    },
    { key: "note", header: "Note", render: (r) => r.note ?? "—" },
    {
      key: "admin",
      header: "By",
      render: (r) => adminById.get(r.admin_id)?.name ?? adminById.get(r.admin_id)?.email ?? "—",
    },
    {
      key: "created_at",
      header: "When",
      align: "right",
      render: (r) => <span className="text-muted">{fmtDate(r.created_at)}</span>,
    },
  ];

  const detailEntries = Object.entries(redemption.details ?? {});

  return (
    <section className="space-y-6">
      <Link
        href="/super/withdrawals"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to withdrawals
      </Link>

      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-ink sm:text-xl">
                {redemption.brand} {redemption.value}
              </h1>
              <Badge tone={STATUS_TONE[redemption.status]}>{redemption.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              <Link href={`/super/users/${redemption.user_id}`} className="hover:underline">
                {redemption.username ?? redemption.email}
              </Link>{" "}
              · {redemption.email}
            </p>
          </div>
          <div className="shrink-0 text-right text-xs text-muted">
            <div>{num(redemption.coins)} coins</div>
            <div className="mt-1">Requested {fmtDate(redemption.created_at)}</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Payout details"
          description={redemption.mode ? redemption.mode.replace("_", " ") : "No mode on file"}
        />
        <CardBody className="space-y-4">
          {detailEntries.length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {detailEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    {DETAIL_LABELS[key] ?? key}
                  </dt>
                  <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">No payout details on file for this reward.</p>
          )}
          {redemption.code && (
            <div className="border-t border-hairline pt-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                Fulfilled code
              </dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{redemption.code}</dd>
            </div>
          )}
        </CardBody>
      </Card>

      <WithdrawalActions redemptionId={redemption.id} status={redemption.status} />

      {actions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted">History</h2>
          <DataTable columns={actionCols} rows={actions} getRowKey={(r) => r.id} />
        </div>
      )}
    </section>
  );
}
