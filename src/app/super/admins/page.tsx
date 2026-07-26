import { ShieldCheck, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prizeupQuery } from "@/lib/prizeup/db";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { referralUrl, creatorStatsUrl } from "@/lib/urls";
import { CreateCampaignForm } from "@/components/create-campaign-form";
import { CampaignPercentageCell } from "@/components/campaign-percentage-cell";

type AdminRow = {
  admin_id: string;
  email: string;
  name: string | null;
  app_slug: string | null;
};
type CampaignBookkeepingRow = {
  id: string;
  admin_id: string;
  prizeup_user_id: string;
  creator_email: string;
  campaign_name: string | null;
  created_at: string;
  display_percentage: number;
};
type PrizeUpCreatorInfo = {
  id: string;
  referral_code: string | null;
  referred_count: string;
};

const num = (n: unknown) => Number(n ?? 0).toLocaleString();

// Admins list is this platform's own bookkeeping (platform_users). Campaigns
// are also bookkeeping (creator_campaigns, in this same DB) — but the
// referral code + referred-count columns are a live read from PrizeUp's own
// database, joined in here by prizeup_user_id.
export default async function AdminsPage() {
  const supabase = await createClient();

  const [adminsRes, campaignsRes] = await Promise.all([
    supabase.rpc("list_admins"),
    supabase
      .from("creator_campaigns")
      .select("id, admin_id, prizeup_user_id, creator_email, campaign_name, created_at, display_percentage")
      .order("created_at", { ascending: false }),
  ]);

  const adminRows = (adminsRes.data ?? []) as AdminRow[];
  const campaignRows = (campaignsRes.data ?? []) as CampaignBookkeepingRow[];
  const adminById = new Map(adminRows.map((a) => [a.admin_id, a]));

  let prizeupInfo = new Map<string, PrizeUpCreatorInfo>();
  if (campaignRows.length > 0) {
    const ids = campaignRows.map((c) => c.prizeup_user_id);
    const rows = await prizeupQuery<PrizeUpCreatorInfo>(
      `select p.id, p.referral_code,
              (select count(*) from referrals r where r.referrer_id = p.id) as referred_count
       from profiles p
       where p.id = any($1::uuid[])`,
      [ids],
    );
    prizeupInfo = new Map(rows.map((r) => [r.id, r]));
  }

  const adminCols: Column<AdminRow>[] = [
    {
      key: "name",
      header: "Admin",
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium text-ink">{r.name ?? "—"}</div>
          <div className="truncate text-xs text-muted">{r.email}</div>
        </div>
      ),
    },
    {
      key: "app_slug",
      header: "App",
      render: (r) => (r.app_slug ? <Badge tone="blue">{r.app_slug}</Badge> : "—"),
    },
  ];

  const campaignCols: Column<CampaignBookkeepingRow>[] = [
    { key: "campaign_name", header: "Campaign", render: (r) => r.campaign_name ?? "—" },
    { key: "creator_email", header: "Creator", render: (r) => r.creator_email },
    {
      key: "admin",
      header: "Created by",
      render: (r) => {
        const admin = adminById.get(r.admin_id);
        return admin?.name ?? admin?.email ?? "—";
      },
    },
    {
      key: "referral_code",
      header: "Referral link",
      render: (r) => {
        const info = prizeupInfo.get(r.prizeup_user_id);
        return info?.referral_code ? (
          <div className="flex items-center gap-1.5">
            <code className="font-mono text-xs text-ink-2">{info.referral_code}</code>
            <CopyButton value={referralUrl(info.referral_code)} label="" />
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      key: "referred_count",
      header: "Referred (real)",
      align: "right",
      numeric: true,
      render: (r) => num(prizeupInfo.get(r.prizeup_user_id)?.referred_count),
    },
    {
      key: "display_percentage",
      header: "Shown to creator",
      render: (r) => (
        <div className="flex items-center gap-2">
          <CampaignPercentageCell campaignId={r.id} initialPercentage={r.display_percentage} />
          <span className="text-xs text-muted">
            = {num(Math.floor((Number(prizeupInfo.get(r.prizeup_user_id)?.referred_count ?? 0) * r.display_percentage) / 100))}
          </span>
        </div>
      ),
    },
    {
      key: "stats_link",
      header: "Stats link",
      render: (r) => {
        const info = prizeupInfo.get(r.prizeup_user_id);
        return info?.referral_code ? (
          <CopyButton value={creatorStatsUrl(info.referral_code)} label="Copy" />
        ) : (
          "—"
        );
      },
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Admins</h1>
        <p className="mt-1 text-sm text-muted">
          Every admin, and the campaigns they&apos;ve created.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Admins ({adminRows.length})</h2>
        <DataTable
          columns={adminCols}
          rows={adminRows}
          getRowKey={(r) => r.admin_id}
          empty={
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No admins yet"
              description="Create one on the Manage tab."
            />
          }
        />
      </div>

      <CreateCampaignForm />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Campaigns ({campaignRows.length})</h2>
        <DataTable
          columns={campaignCols}
          rows={campaignRows}
          getRowKey={(r) => r.id}
          empty={
            <EmptyState
              icon={<Megaphone className="h-6 w-6" />}
              title="No campaigns yet"
              description="Create one above, or an admin can create one from their own dashboard."
            />
          }
        />
      </div>
    </section>
  );
}
