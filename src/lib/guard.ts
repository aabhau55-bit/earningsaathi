import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { homeFor, type Role } from "@/lib/roles";

// Server-side guard for area layouts. Redirects to /login when signed out, or
// to the user's own area when they don't match the requested one. This is
// defense-in-depth on top of the proxy and RLS — never the only check.
export async function requireRole(area: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== area) redirect(homeFor(user.role));
  return user;
}
