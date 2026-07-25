import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPrizeUpUrl, getPrizeUpServiceRoleKey } from "@/lib/env";

// Service-role client for PrizeUp's own Supabase project. Only used to create
// real login accounts (auth.admin.createUser) the supported way — never for
// bulk reads (use prizeupQuery in @/lib/prizeup/db for that). Server-only.
export function createPrizeUpAdminClient() {
  return createSupabaseClient(getPrizeUpUrl(), getPrizeUpServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
