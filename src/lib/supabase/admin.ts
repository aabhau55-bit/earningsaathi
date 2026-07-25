import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, getServiceRoleKey } from "@/lib/env";

// Service-role client. Bypasses RLS — use ONLY in trusted server code
// (coin sync, app_sources management, service-key operations). Never expose
// to the browser. The "server-only" import makes a client-side import fail
// the build.
export function createAdminClient() {
  return createSupabaseClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
