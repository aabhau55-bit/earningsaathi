"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPrizeUpAdminClient } from "@/lib/supabase/prizeup-admin";
import { prizeupQuery } from "@/lib/prizeup/db";
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

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
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

  const existing = await prizeupQuery<{ id: string; referral_code: string | null }>(
    `select p.id, p.referral_code from profiles p join auth.users u on u.id = p.id where lower(u.email) = $1`,
    [email],
  );

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

    const [profile] = await prizeupQuery<{ referral_code: string | null }>(
      `select referral_code from profiles where id = $1`,
      [prizeupUserId],
    );
    referralCode = profile?.referral_code ?? null;
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

  revalidatePath("/admin");
  revalidatePath("/super/admins");

  return {
    ok: true,
    referralLink: referralUrl(referralCode),
    referralCode,
    creatorEmail: email,
    newlyCreated: accountJustCreated && !alreadyTracked,
    password: accountJustCreated ? password : undefined,
  };
}
