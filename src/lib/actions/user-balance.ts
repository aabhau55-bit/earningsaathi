"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prizeupTransaction } from "@/lib/prizeup/db";
import { requireSuperAdmin } from "@/lib/actions/guard";

export type AdjustBalanceResult =
  | { ok: true; coins: number; gems: number }
  | { ok: false; error: string };

// super_admin only — checked explicitly here, not just by page placement:
// Server Actions are directly callable regardless of which page renders the
// button, so route-based gating alone is not real authorization.
//
// Atomic: the profiles update and the mirrored PrizeUp ledger entry happen in
// one transaction, so if PrizeUp's own daily-earn-cap trigger rejects the
// ledger insert, the balance change rolls back too — never a silent
// mismatch between what profiles.coins says and what the ledger shows.
export async function adjustBalanceAction(input: {
  prizeupUserId: string;
  coinsDelta: number;
  gemsDelta: number;
  reason: string;
}): Promise<AdjustBalanceResult> {
  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "A reason is required" };
  if (input.coinsDelta === 0 && input.gemsDelta === 0) {
    return { ok: false, error: "Enter a non-zero coins or gems amount" };
  }
  if (!Number.isInteger(input.coinsDelta) || !Number.isInteger(input.gemsDelta)) {
    return { ok: false, error: "Amounts must be whole numbers" };
  }

  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;
  const currentUser = guard.caller;

  const supabase = await createClient();

  let updated: { coins: string; gems: string } | undefined;
  try {
    updated = await prizeupTransaction(async (query) => {
      const [row] = await query<{ coins: string; gems: string }>(
        `update profiles
         set coins = coins + $1, gems = gems + $2
         where id = $3 and coins + $1 >= 0 and gems + $2 >= 0
         returning coins, gems`,
        [input.coinsDelta, input.gemsDelta, input.prizeupUserId],
      );
      if (!row) {
        throw new Error(
          "User not found, or this would take coins or gems negative.",
        );
      }

      if (input.coinsDelta !== 0) {
        await query(
          `insert into transactions (user_id, kind, source, amount, title, currency)
           values ($1, $2, 'admin_adjustment', $3, $4, 'coin')`,
          [
            input.prizeupUserId,
            input.coinsDelta > 0 ? "earn" : "redeem",
            Math.abs(input.coinsDelta),
            `Admin adjustment: ${reason}`,
          ],
        );
      }
      if (input.gemsDelta !== 0) {
        await query(
          `insert into transactions (user_id, kind, source, amount, title, currency)
           values ($1, $2, 'admin_adjustment', $3, $4, 'gem')`,
          [
            input.prizeupUserId,
            input.gemsDelta > 0 ? "earn" : "redeem",
            Math.abs(input.gemsDelta),
            `Admin adjustment: ${reason}`,
          ],
        );
      }

      return row;
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Adjustment failed",
    };
  }

  // Audit trail in our own database — who did this, and why. The balance
  // change already succeeded at this point; don't fail the whole action over
  // a logging error, but don't lose it silently either.
  const { error: auditError } = await supabase.from("balance_adjustments").insert({
    admin_id: currentUser.id,
    prizeup_user_id: input.prizeupUserId,
    coins_delta: input.coinsDelta,
    gems_delta: input.gemsDelta,
    reason,
  });
  if (auditError) {
    console.error("balance_adjustments insert failed:", auditError.message);
  }

  revalidatePath(`/super/users/${input.prizeupUserId}`);
  revalidatePath("/super/users");

  return { ok: true, coins: Number(updated.coins), gems: Number(updated.gems) };
}
