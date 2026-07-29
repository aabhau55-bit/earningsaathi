"use server";

import { prizeupQuery } from "@/lib/prizeup/db";
import { getRawReferralStats, type RawReferralStats } from "@/lib/prizeup/referral-stats";
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
  try {
    [profile] = await prizeupQuery<{ id: string; username: string | null }>(
      `select p.id, p.username
       from profiles p
       join auth.users u on u.id = p.id
       where p.referral_code = upper(trim($1)) and lower(u.email) = lower($2)`,
      [code, email.trim()],
    );
  } catch (err) {
    console.error("getCreatorStatsAction DB error:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't load your stats right now — please try again in a moment." };
  }

  if (!profile) {
    return { ok: false, error: "No matching creator for that email." };
  }

  // Campaign bookkeeping (display_percentage, status, frozen_stats) lives in
  // this platform's own DB, set by an admin/super_admin. Read via the
  // service-role client since this is an unauthenticated caller — RLS on
  // that table requires a real admin_id, which a public visitor doesn't
  // have. No campaign row (e.g. an organic user checking their own stats)
  // means active + the real number.
  const admin = createAdminClient();
  const { data: campaignRow } = await admin
    .from("creator_campaigns")
    .select("display_percentage, status, frozen_stats")
    .eq("prizeup_user_id", profile.id)
    .maybeSingle();

  if (campaignRow?.status === "deleted") {
    return { ok: false, error: "This referral link's stats are no longer available." };
  }

  const pct = campaignRow?.display_percentage ?? 100;

  // Paused: show the snapshot taken the moment it was paused instead of a
  // live read, so the numbers stop moving without touching the real
  // referral data. Falls back to a live read if somehow paused with no
  // snapshot yet, so this never breaks.
  let raw: RawReferralStats;
  if (campaignRow?.status === "paused" && campaignRow.frozen_stats) {
    raw = campaignRow.frozen_stats as RawReferralStats;
  } else {
    try {
      raw = await getRawReferralStats(profile.id);
    } catch (err) {
      console.error("getCreatorStatsAction stats read failed:", err instanceof Error ? err.message : err);
      return { ok: false, error: "Couldn't load your stats right now — please try again in a moment." };
    }
  }

  return {
    ok: true,
    username: profile.username,
    lastHour: scale(raw.lastHour, pct),
    lastDay: scale(raw.lastDay, pct),
    lastWeek: scale(raw.lastWeek, pct),
    lastMonth: scale(raw.lastMonth, pct),
    lifetime: scale(raw.lifetime, pct),
    d1: scale(raw.d1, pct),
    d7: scale(raw.d7, pct),
  };
}
