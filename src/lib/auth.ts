import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type SessionUser = {
  id: string;
  email: string | null;
  role: Role;
};

// Resolve the verified user + their DB role for use in Server Components and
// layouts. Returns null when signed out. getUser() contacts the Auth server
// (verified identity); the role comes from platform_users (RLS lets a user
// read their own row).
export async function getSessionUser(): Promise<SessionUser | null> {
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

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email ?? user.email ?? null,
    role: profile.role as Role,
  };
}
