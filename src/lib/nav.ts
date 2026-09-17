import type { Role } from "@/lib/roles";

// Icon keys are mapped to lucide icons inside the (client) Sidebar, so nav
// config stays serializable and usable from server components.
export type NavItem = { label: string; href: string; icon: string };

export function navForRole(role: Role): NavItem[] {
  switch (role) {
    case "super_admin":
      return [
        { label: "Overview", href: "/super", icon: "dashboard" },
        { label: "Economy", href: "/super/economy", icon: "chart" },
        { label: "Users", href: "/super/users", icon: "users" },
        { label: "Withdrawals", href: "/super/withdrawals", icon: "wallet" },
        { label: "Admins", href: "/super/admins", icon: "shield" },
        { label: "Manage", href: "/super/manage", icon: "settings" },
      ];
    case "admin":
      return [{ label: "Dashboard", href: "/admin", icon: "dashboard" }];
  }
}

// Longest matching href wins, so /super/manage beats /super on that route.
export function activeHref(pathname: string, items: NavItem[]): string | null {
  const matches = items.filter(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href;
}
