import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Backed by this platform's own database (see migration 0009) — no new
// external service. Scopes by IP + action name so different endpoints don't
// share a budget. Fails OPEN: if the check itself errors (RPC unavailable,
// DB hiccup), the request is allowed through rather than blocking a
// legitimate user over a broken rate limiter — this is defense in depth on
// top of the actual authorization/matching logic, not the only line of
// defense.
export async function checkRateLimit(
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const key = `${action}:${ip}`;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed:", error.message);
    return true;
  }
  return data === true;
}
