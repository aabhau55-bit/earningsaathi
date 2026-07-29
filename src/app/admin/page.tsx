import { Inbox, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { prizeupQuery } from "@/lib/prizeup/db";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { referralUrl, creatorStatsUrl } from "@/lib/urls";
import { CreateCampaignForm } from "@/components/create-campaign-form";
import { CampaignPercentageCell } from "@/components/campaign-percentage-cell";
import { CampaignActions, type CampaignStatus } from "@/components/campaign-actions";

type CampaignRow = {
  id: string;
  prizeup_user_id: string;
  creator_email: string;
  campaign_name: string | null;
  created_at: string;
  display_percentage: number;
  status: CampaignStatus;
};

const STATUS_TONE: Record<CampaignStatus, "good" | "blue" | "critical"> = {
  active: "good",
  paused: "blue",
  deleted: "critical",
};
type PrizeUpCreatorInfo = {
  id: string;
  referral_code: string | null;
  referred_count: string;
};

const num = (n: unknown) => Number(n ?? 0).toLocaleString();

export default async function AdminHome() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const { data: pu } = await supabase
    .from("platform_users")
    .select("app_id")
    .eq("id", user!.id)
    .single();
  const { data: app } = pu?.app_id
    ? await supabase.from("apps").select("slug, name").eq("id", pu.app_id).single()
    : { data: null };

  if (!app) {
    return (
      <section>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Admin</h1>
        <div className="mt-6">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No app assigned to your account"
            description="A super admin needs to assign you to an app before you can use this dashboard."
          />
        </div>
      </section>
    );
  }

  const { data: campaignRows } = await supabase
    .from("creator_campaigns")
    .select("id, prizeup_user_id, creator_email, campaign_name, created_at, display_percentage, status")
    .eq("admin_id", user!.id)
    .order("created_at", { ascending: false });

  const campaigns = (campaignRows ?? []) as CampaignRow[];

  let prizeupInfo = new Map<string, PrizeUpCreatorInfo>();
  if (campaigns.length > 0) {
    const ids = campaigns.map((c) => c.prizeup_user_id);
    const rows = await prizeupQuery<PrizeUpCreatorInfo>(
      `select p.id, p.referral_code,
              (select count(*) from referrals r where r.referrer_id = p.id) as referred_count
       from profiles p
       where p.id = any($1::uuid[])`,
      [ids],
    );
    prizeupInfo = new Map(rows.map((r) => [r.id, r]));
  }

  const cols: Column<CampaignRow>[] = [
    { key: "campaign_name", header: "Campaign", render: (r) => r.campaign_name ?? "—" },
    { key: "creator_email", header: "Creator", render: (r) => r.creator_email },
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
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => <CampaignActions campaignId={r.id} status={r.status} />,
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Admin</h1>
        <p className="mt-1 text-sm text-muted">
          Managing <span className="font-medium text-ink-2">{app.name}</span> —
          create referral campaigns for creators.
        </p>
      </div>

      <CreateCampaignForm />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">
          Your campaigns ({campaigns.length})
        </h2>
        <DataTable
          columns={cols}
          rows={campaigns}
          getRowKey={(r) => r.id}
          empty={
            <EmptyState
              icon={<Megaphone className="h-6 w-6" />}
              title="No campaigns yet"
              description="Create your first one above."
            />
          }
        />
      </div>
    </section>
  );
}
