"use server";

import { prizeupQuery } from "@/lib/prizeup/db";
import { checkRateLimit } from "@/lib/rate-limit";

export type CreatorStatsResult =
  | {
      ok: true;
      username: string | null;
      lastHour: number;
      lastDay: number;
      lastWeek: number;
      lastMonth: number;
      lifetime: number;
    }
  | { ok: false; error: string };

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

  const [profile] = await prizeupQuery<{ id: string; username: string | null }>(
    `select p.id, p.username
     from profiles p
     join auth.users u on u.id = p.id
     where p.referral_code = upper(trim($1)) and lower(u.email) = lower($2)`,
    [code, email.trim()],
  );

  if (!profile) {
    return { ok: false, error: "No matching creator for that email." };
  }

  const [stats] = await prizeupQuery<{
    last_hour: string;
    last_day: string;
    last_week: string;
    last_month: string;
    lifetime: string;
  }>(
    `select
       count(*) filter (where r.created_at >= now() - interval '1 hour') as last_hour,
       count(*) filter (where r.created_at >= now() - interval '1 day') as last_day,
       count(*) filter (where r.created_at >= now() - interval '7 days') as last_week,
       count(*) filter (where r.created_at >= now() - interval '30 days') as last_month,
       count(*) as lifetime
     from referrals r
     where r.referrer_id = $1`,
    [profile.id],
  );

  return {
    ok: true,
    username: profile.username,
    lastHour: Number(stats?.last_hour ?? 0),
    lastDay: Number(stats?.last_day ?? 0),
    lastWeek: Number(stats?.last_week ?? 0),
    lastMonth: Number(stats?.last_month ?? 0),
    lifetime: Number(stats?.lifetime ?? 0),
  };
}
