"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prizeupTransaction } from "@/lib/prizeup/db";
import { requireSuperAdmin } from "@/lib/actions/guard";

export type WithdrawalActionResult = { ok: true } | { ok: false; error: string };

function revalidateWithdrawal(id: string) {
  revalidatePath(`/super/withdrawals/${id}`);
  revalidatePath("/super/withdrawals");
  revalidatePath("/super");
}

// super_admin only — checked explicitly here, not just by page placement:
// Server Actions are directly callable regardless of which page renders the
// button, so route-based gating alone is not real authorization.
export async function approveWithdrawalAction(
  redemptionId: string,
): Promise<WithdrawalActionResult> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();

  try {
    await prizeupTransaction(async (query) => {
      const [row] = await query<{ status: string }>(
        `select status from redemptions where id = $1 for update`,
        [redemptionId],
      );
      if (!row) throw new Error("Redemption not found");
      if (row.status !== "pending") {
        throw new Error(`Already ${row.status} — can't approve`);
      }
      await query(`update redemptions set status = 'approved' where id = $1`, [
        redemptionId,
      ]);
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }

  await supabase.from("withdrawal_actions").insert({
    admin_id: guard.caller.id,
    prizeup_redemption_id: redemptionId,
    action: "approved",
  });

  revalidateWithdrawal(redemptionId);
  return { ok: true };
}

// Sets the real gift-card code and marks it sent — the app reveals the code
// to the user the moment status = 'sent' AND code IS NOT NULL.
export async function fulfillWithdrawalAction(
  redemptionId: string,
  code: string,
): Promise<WithdrawalActionResult> {
  const trimmedCode = code.trim();
  if (!trimmedCode) return { ok: false, error: "Enter the gift-card code" };

  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();

  try {
    await prizeupTransaction(async (query) => {
      const [row] = await query<{ status: string }>(
        `select status from redemptions where id = $1 for update`,
        [redemptionId],
      );
      if (!row) throw new Error("Redemption not found");
      if (row.status === "sent") throw new Error("Already sent");
      if (row.status === "rejected") {
        throw new Error("Already rejected — can't fulfill");
      }
      await query(
        `update redemptions set status = 'sent', code = $2 where id = $1`,
        [redemptionId, trimmedCode],
      );
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }

  // Don't duplicate the real code into a second database — just record that
  // this admin fulfilled it.
  await supabase.from("withdrawal_actions").insert({
    admin_id: guard.caller.id,
    prizeup_redemption_id: redemptionId,
    action: "sent",
  });

  revalidateWithdrawal(redemptionId);
  return { ok: true };
}

// Rejects the request AND refunds the coins — matches PrizeUp's own
// supabase/FULFILLMENT.md runbook (step 4) exactly. Atomic: status change,
// balance credit, and ledger entry succeed or fail together. 'refund' is
// exempt from PrizeUp's daily-earn-cap trigger, so a large refund is never
// blocked.
export async function rejectWithdrawalAction(
  redemptionId: string,
  reason: string,
): Promise<WithdrawalActionResult> {
  const trimmedReason = reason.trim();
  if (!trimmedReason) return { ok: false, error: "A reason is required" };

  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();

  try {
    await prizeupTransaction(async (query) => {
      const [row] = await query<{
        user_id: string;
        coins: string;
        brand: string;
        value: string;
        status: string;
      }>(
        `select user_id, coins, brand, value, status from redemptions where id = $1 for update`,
        [redemptionId],
      );
      if (!row) throw new Error("Redemption not found");
      if (row.status === "rejected") throw new Error("Already rejected");
      if (row.status === "sent") {
        throw new Error("Already sent — can't reject a fulfilled redemption");
      }

      await query(`update redemptions set status = 'rejected' where id = $1`, [
        redemptionId,
      ]);
      await query(`update profiles set coins = coins + $1 where id = $2`, [
        row.coins,
        row.user_id,
      ]);
      await query(
        `insert into transactions (user_id, kind, source, amount, title)
         values ($1, 'earn', 'refund', $2, $3)`,
        [row.user_id, row.coins, `Refund: ${row.brand} ${row.value}`],
      );
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }

  await supabase.from("withdrawal_actions").insert({
    admin_id: guard.caller.id,
    prizeup_redemption_id: redemptionId,
    action: "rejected",
    note: trimmedReason,
  });

  revalidateWithdrawal(redemptionId);
  return { ok: true };
}
