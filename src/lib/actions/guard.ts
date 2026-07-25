import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type AuthorizedCaller = { id: string; email: string | null; role: Role };

export type GuardResult =
  | { ok: true; caller: AuthorizedCaller }
  | { ok: false; error: string };

// Server Actions are real network endpoints — reachable directly regardless
// of which page happens to render the button that calls them. "Only the
// /super page links to this" is NOT an authorization check. Every sensitive
// action must call one of these itself.
async function currentPlatformUser(): Promise<AuthorizedCaller | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("platform_users")
    .select("role, email")
    .eq("id", user.id)
    .single();
  if (!profile?.role) return null;

  return {
    id: user.id,
    email: profile.email ?? user.email ?? null,
    role: profile.role as Role,
  };
}

export async function requireSuperAdmin(): Promise<GuardResult> {
  const caller = await currentPlatformUser();
  if (!caller) return { ok: false, error: "Not signed in" };
  if (caller.role !== "super_admin") return { ok: false, error: "Not authorized" };
  return { ok: true, caller };
}

// Either platform role (admin or super_admin) — for actions both are allowed
// to take, e.g. creating a campaign.
export async function requirePlatformUser(): Promise<GuardResult> {
  const caller = await currentPlatformUser();
  if (!caller) return { ok: false, error: "Not signed in" };
  return { ok: true, caller };
}
