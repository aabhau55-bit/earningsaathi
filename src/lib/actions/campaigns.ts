"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPrizeUpAdminClient } from "@/lib/supabase/prizeup-admin";
import { prizeupQuery } from "@/lib/prizeup/db";
import { getRawReferralStats } from "@/lib/prizeup/referral-stats";
import { referralUrl } from "@/lib/urls";
import { requirePlatformUser } from "@/lib/actions/guard";

export type CreateCampaignResult =
  | {
      ok: true;
      referralLink: string;
      referralCode: string;
      creatorEmail: string;
      newlyCreated: boolean;
      password?: string;
    }
  | { ok: false; error: string };

export type UpdatePercentageResult = { ok: true } | { ok: false; error: string };
export type CampaignStatusResult = { ok: true } | { ok: false; error: string };

function revalidateCampaigns() {
  revalidatePath("/admin");
  revalidatePath("/super/admins");
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  let password = "";
  for (let i = 0; i < bytes.length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

// Creates (or reuses) a real PrizeUp account for this email, so PrizeUp's own
// signup trigger assigns it a real referral_code — the exact same mechanism
// apply_referral already validates for organic signups. No changes to
// PrizeUp's schema or referral logic; the only new state is a bookkeeping
// row here (creator_campaigns) recording which admin set this up and why.
export async function createCampaignAction(input: {
  email: string;
  campaignName: string;
}): Promise<CreateCampaignResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, error: "Email is required" };

  const guard = await requirePlatformUser();
  if (!guard.ok) return guard;
  const currentUser = guard.caller;

  const supabase = await createClient();

  let existing: { id: string; referral_code: string | null }[];
  try {
    existing = await prizeupQuery<{ id: string; referral_code: string | null }>(
      `select p.id, p.referral_code from profiles p join auth.users u on u.id = p.id where lower(u.email) = $1`,
      [email],
    );
  } catch (err) {
    console.error("createCampaignAction lookup failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't reach PrizeUp's database right now — please try again in a moment." };
  }

  let prizeupUserId: string;
  let referralCode: string | null;
  let accountJustCreated = false;
  let password: string | undefined;

  if (existing.length > 0) {
    prizeupUserId = existing[0].id;
    referralCode = existing[0].referral_code;
  } else {
    password = generatePassword();
    const admin = createPrizeUpAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return {
        ok: false,
        error: createError?.message ?? "Could not create PrizeUp account",
      };
    }
    prizeupUserId = created.user.id;
    accountJustCreated = true;

    try {
      const [profile] = await prizeupQuery<{ referral_code: string | null }>(
        `select referral_code from profiles where id = $1`,
        [prizeupUserId],
      );
      referralCode = profile?.referral_code ?? null;
    } catch (err) {
      console.error("createCampaignAction referral_code lookup failed:", err instanceof Error ? err.message : err);
      return {
        ok: false,
        error: "Account created, but couldn't confirm its referral code — check the Admins page in a moment.",
      };
    }
  }

  if (!referralCode) {
    return {
      ok: false,
      error: "Account exists but has no referral code yet — try again in a moment",
    };
  }

  const { error: insertError } = await supabase.from("creator_campaigns").insert({
    admin_id: currentUser.id,
    prizeup_user_id: prizeupUserId,
    creator_email: email,
    campaign_name: input.campaignName.trim() || null,
  });

  // Already tracked (by us, or another admin) — fine, just surface the
  // existing referral code instead of erroring.
  const alreadyTracked = insertError?.code === "23505"; // unique_violation
  if (insertError && !alreadyTracked) {
    return { ok: false, error: insertError.message };
  }

  // Re-creating a campaign you'd previously paused or deleted reactivates it
  // instead of leaving it stuck — RLS (creator_campaigns_update) means this
  // silently affects zero rows if the existing row belongs to another admin,
  // so it can't reactivate anyone else's campaign.
  if (alreadyTracked) {
    const { error: reactivateError } = await supabase
      .from("creator_campaigns")
      .update({ status: "active", frozen_stats: null })
      .eq("prizeup_user_id", prizeupUserId)
      .in("status", ["paused", "deleted"]);
    if (reactivateError) {
      console.error("createCampaignAction reactivate failed:", reactivateError.message);
    }
  }

  revalidateCampaigns();

  return {
    ok: true,
    referralLink: referralUrl(referralCode),
    referralCode,
    creatorEmail: email,
    newlyCreated: accountJustCreated && !alreadyTracked,
    password: accountJustCreated ? password : undefined,
  };
}

// Controls what % of the real referral count the creator sees on their
// public /creator/[code] page — the real count everywhere internal (this
// dashboard) is never affected. RLS (creator_campaigns_update) restricts an
// admin to their own campaigns; super_admin can update any.
export async function updateDisplayPercentageAction(
  campaignId: string,
  percentage: number,
): Promise<UpdatePercentageResult> {
  const guard = await requirePlatformUser();
  if (!guard.ok) return guard;

  if (!Number.isInteger(percentage) || percentage < 1 || percentage > 500) {
    return { ok: false, error: "Percentage must be a whole number between 1 and 500" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("creator_campaigns")
    .update({ display_percentage: percentage })
    .eq("id", campaignId);

  if (error) return { ok: false, error: error.message };

  revalidateCampaigns();
  return { ok: true };
}

// Pauses a campaign: the creator's /creator/[code] page keeps working, but
// shows a frozen snapshot of their real counts (taken right now) instead of
// a live read, so the numbers stop moving. PrizeUp's own referral redirect
// (/i/<code>) is a static page with no dependency on this table — it keeps
// working regardless of status. RLS (creator_campaigns_select/_update)
// restricts this to the caller's own campaigns; super_admin can pause any.
export async function pauseCampaignAction(
  campaignId: string,
): Promise<CampaignStatusResult> {
  const guard = await requirePlatformUser();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data: campaign, error: readError } = await supabase
    .from("creator_campaigns")
    .select("prizeup_user_id, status")
    .eq("id", campaignId)
    .single();
  if (readError || !campaign) return { ok: false, error: "Campaign not found" };
  if (campaign.status === "deleted") {
    return { ok: false, error: "Can't pause a deleted campaign" };
  }

  let frozen;
  try {
    frozen = await getRawReferralStats(campaign.prizeup_user_id);
  } catch (err) {
    console.error("pauseCampaignAction stats snapshot failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't reach PrizeUp's database right now — please try again in a moment." };
  }

  const { error } = await supabase
    .from("creator_campaigns")
    .update({ status: "paused", frozen_stats: frozen })
    .eq("id", campaignId);
  if (error) return { ok: false, error: error.message };

  revalidateCampaigns();
  return { ok: true };
}

// Resumes a paused campaign — numbers go live again. No-ops (with an error)
// if the campaign isn't currently paused, doesn't exist, or isn't the
// caller's own (RLS).
export async function resumeCampaignAction(
  campaignId: string,
): Promise<CampaignStatusResult> {
  const guard = await requirePlatformUser();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_campaigns")
    .update({ status: "active", frozen_stats: null })
    .eq("id", campaignId)
    .eq("status", "paused")
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Campaign not found, not yours, or not currently paused." };
  }

  revalidateCampaigns();
  return { ok: true };
}

// Deletes (soft) a campaign: blocks the creator's /creator/[code] page
// entirely from this point on. The row itself is kept for audit history
// (who created it, when) rather than hard-deleted — and, same as pause,
// PrizeUp's own referral redirect never checks this table, so it keeps
// working regardless. Terminal: no "undelete" in the UI.
export async function deleteCampaignAction(
  campaignId: string,
): Promise<CampaignStatusResult> {
  const guard = await requirePlatformUser();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_campaigns")
    .update({ status: "deleted" })
    .eq("id", campaignId)
    .neq("status", "deleted")
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Campaign not found, not yours, or already deleted." };
  }

  revalidateCampaigns();
  return { ok: true };
}
