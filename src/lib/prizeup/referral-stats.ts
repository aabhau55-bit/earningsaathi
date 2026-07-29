import "server-only";

import { prizeupQuery } from "@/lib/prizeup/db";

export type RawReferralStats = {
  lastHour: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lifetime: number;
  d1: number;
  d7: number;
};

// Real, unscaled referral counts for one PrizeUp profile — shared by the
// live creator-stats read (getCreatorStatsAction) and the snapshot taken
// when a campaign is paused (frozen_stats).
export async function getRawReferralStats(
  prizeupUserId: string,
): Promise<RawReferralStats> {
  const [stats] = await prizeupQuery<{
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
    [prizeupUserId],
  );

  return {
    lastHour: Number(stats?.last_hour ?? 0),
    lastDay: Number(stats?.last_day ?? 0),
    lastWeek: Number(stats?.last_week ?? 0),
    lastMonth: Number(stats?.last_month ?? 0),
    lifetime: Number(stats?.lifetime ?? 0),
    d1: Number(stats?.d1 ?? 0),
    d7: Number(stats?.d7 ?? 0),
  };
}
