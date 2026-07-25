// Role model — one fixed role per account, no switching. Shared by proxy,
// layouts, and UI. The DB (platform_users.role + RLS) is the source of truth;
// these constants just map a role to its single allowed area.

// PrizeUp players (creators, referrers, etc.) are never platform_users —
// referral tracking lives entirely in PrizeUp's own database and is read
// here, not managed through a login account.
export type Role = "super_admin" | "admin";

export const ROLES: Role[] = ["super_admin", "admin"];

/** The one area each role is allowed to land in. */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/super",
  admin: "/admin",
};

/** Which area a given path belongs to, or null for shared/public paths. */
export function areaForPath(pathname: string): Role | null {
  if (pathname === "/super" || pathname.startsWith("/super/"))
    return "super_admin";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  return null;
}

/** Can this role access this area? super_admin has full access within /super only. */
export function canAccessArea(role: Role, area: Role): boolean {
  return role === area;
}

export function homeFor(role: Role): string {
  return ROLE_HOME[role];
}
