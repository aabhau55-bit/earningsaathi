import Link from "next/link";
import { ChevronLeft, ChevronRight, Users as UsersIcon } from "lucide-react";
import { prizeupQuery } from "@/lib/prizeup/db";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { referralUrl } from "@/lib/urls";

type UserRow = {
  id: string;
  email: string;
  username: string | null;
  referral_code: string | null;
  coins: string;
  gems: string;
  streak: number;
  created_at: string;
  last_sign_in_at: string | null;
  referred_count: string;
};

const PAGE_SIZE = 25;

const num = (n: unknown) => Number(n ?? 0).toLocaleString();
const fmtDate = (s: string | null) =>
  s
    ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

// Direct read against PrizeUp's own database — real users, real balances.
// No writes here yet; this is search/lookup only.
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = query
    ? `where u.email ilike $1 or p.username ilike $1 or p.referral_code ilike $1 or p.id::text = $2`
    : "";
  const params = query ? [`%${query}%`, query] : [];

  const [rows, countRows] = await Promise.all([
    prizeupQuery<UserRow>(
      `select p.id, u.email, p.username, p.referral_code, p.coins, p.gems, p.streak,
              p.created_at, u.last_sign_in_at,
              (select count(*) from referrals r where r.referrer_id = p.id) as referred_count
       from profiles p
       join auth.users u on u.id = p.id
       ${where}
       order by p.created_at desc
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    ),
    prizeupQuery<{ total: string }>(
      `select count(*) as total
       from profiles p
       join auth.users u on u.id = p.id
       ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(p));
    return `/super/users?${params.toString()}`;
  };

  const cols: Column<UserRow>[] = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <Link href={`/super/users/${r.id}`} className="min-w-0 hover:underline">
          <div className="font-medium text-ink">{r.username ?? "—"}</div>
          <div className="truncate text-xs text-muted">{r.email}</div>
        </Link>
      ),
    },
    {
      key: "referral_code",
      header: "Referral code",
      render: (r) =>
        r.referral_code ? (
          <div className="flex items-center gap-1.5">
            <code className="font-mono text-xs text-ink-2">{r.referral_code}</code>
            <CopyButton value={referralUrl(r.referral_code)} label="" />
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "referred_count",
      header: "Referred",
      align: "right",
      numeric: true,
      render: (r) => num(r.referred_count),
    },
    { key: "coins", header: "Coins", align: "right", numeric: true, render: (r) => num(r.coins) },
    { key: "gems", header: "Gems", align: "right", numeric: true, render: (r) => num(r.gems) },
    {
      key: "last_sign_in_at",
      header: "Last sign-in",
      align: "right",
      render: (r) => <span className="text-muted">{fmtDate(r.last_sign_in_at)}</span>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Users</h1>
        <p className="mt-1 text-sm text-muted">
          {num(total)} total — search by email, UID, username, or referral code.
        </p>
      </div>

      <Card>
        <CardBody>
          <form className="flex gap-2" action="/super/users" method="get">
            <Input
              name="q"
              defaultValue={query}
              placeholder="email, UID, username, or referral code"
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardBody>
      </Card>

      <DataTable
        columns={cols}
        rows={rows}
        getRowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title={query ? "No matching user" : "No users yet"}
            description={query ? `Nothing found for "${query}".` : undefined}
          />
        }
      />

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)}>
                <Button variant="secondary" size="sm">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
            )}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)}>
                <Button variant="secondary" size="sm">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
