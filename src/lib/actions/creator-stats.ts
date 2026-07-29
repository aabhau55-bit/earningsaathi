"use server";

import { prizeupQuery } from "@/lib/prizeup/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreatorStatsResult =
  | {
      ok: true;
      username: string | null;
      lastHour: number;
      lastDay: number;
      lastWeek: number;
      lastMonth: number;
      lifetime: number;
      d1: number;
      d7: number;
    }
  | { ok: false; error: string };

function scale(n: number, pct: number) {
  return Math.floor((n * pct) / 100);
}

// Public — no session. The referral code (from the link) and the email the
// creator types are, together, the "credential". Pure read against PrizeUp's
// real referrals table — no new schema or logic on PrizeUp's side.
export async function getCreatorStatsAction(
  code: string,
  email: string,
): Promise<CreatorStatsResult> {
  const allowed = await checkRateLimit("creator-stats", 20, 60);
  if (!allowed) {
    return { ok: false, error: "Too many attempts — please wait a minute and try again." };
  }

  let profile: { id: string; username: string | null } | undefined;
  let stats:
    | {
        last_hour: string;
        last_day: string;
        last_week: string;
        last_month: string;
        lifetime: string;
        d1: string;
        d7: string;
      }
    | undefined;
  try {
    [profile] = await prizeupQuery<{ id: string; username: string | null }>(
      `select p.id, p.username
       from profiles p
       join auth.users u on u.id = p.id
       where p.referral_code = upper(trim($1)) and lower(u.email) = lower($2)`,
      [code, email.trim()],
    );

    if (!profile) {
      return { ok: false, error: "No matching creator for that email." };
    }

    // Real counts, computed once here and never sent to the browser directly
    // — only the scaled version below is. Internal dashboard pages
    // (super/admins, admin) read the true count separately and are
    // unaffected by this.
    [stats] = await prizeupQuery<{
      last_hour: string;
      last_day: string;
      last_week: string;
      last_month: string;
      lifetime: string;
      d1: string;
      d7: string;
    }>(
      `select
         count(*) filter (where r.created_at >= now() - interval '1 hour') as last_hour,
         count(*) filter (where r.created_at >= now() - interval '1 day') as last_day,
         count(*) filter (where r.created_at >= now() - interval '7 days') as last_week,
         count(*) filter (where r.created_at >= now() - interval '30 days') as last_month,
         count(*) as lifetime,
         count(*) filter (where u.last_sign_in_at >= u.created_at + interval '2 hours') as d1,
         count(*) filter (where u.last_sign_in_at >= u.created_at + interval '7 days') as d7
       from referrals r
       join auth.users u on u.id = r.referred_id
       where r.referrer_id = $1`,
      [profile.id],
    );
  } catch (err) {
    console.error("getCreatorStatsAction DB error:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't load your stats right now — please try again in a moment." };
  }

  // Display percentage lives in this platform's own DB (creator_campaigns),
  // set by an admin/super_admin. Read via the service-role client since this
  // is an unauthenticated caller — RLS on that table requires a real
  // admin_id, which a public visitor doesn't have. Defaults to 100 (real
  // number) when no campaign row exists, e.g. an organic user checking their
  // own stats.
  const admin = createAdminClient();
  const { data: campaignRow } = await admin
    .from("creator_campaigns")
    .select("display_percentage")
    .eq("prizeup_user_id", profile.id)
    .maybeSingle();
  const pct = campaignRow?.display_percentage ?? 100;

  return {
    ok: true,
    username: profile.username,
    lastHour: scale(Number(stats?.last_hour ?? 0), pct),
    lastDay: scale(Number(stats?.last_day ?? 0), pct),
    lastWeek: scale(Number(stats?.last_week ?? 0), pct),
    lastMonth: scale(Number(stats?.last_month ?? 0), pct),
    lifetime: scale(Number(stats?.lifetime ?? 0), pct),
    d1: scale(Number(stats?.d1 ?? 0), pct),
    d7: scale(Number(stats?.d7 ?? 0), pct),
  };
}
