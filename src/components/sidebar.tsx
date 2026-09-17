"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Bell,
  Users,
  Wallet,
  ShieldCheck,
  LogOut,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { navForRole, activeHref } from "@/lib/nav";
import type { Role } from "@/lib/roles";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  settings: Settings,
  chart: BarChart3,
  bell: Bell,
  users: Users,
  wallet: Wallet,
  shield: ShieldCheck,
};

const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const ROLE_ACCENT: Record<Role, string> = {
  super_admin: "bg-series-5/15 text-series-5",
  admin: "bg-series-1/15 text-series-1",
};

function initials(email: string | null): string {
  if (!email) return "?";
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[.\-_]/).filter(Boolean);
  const s = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (s || name.slice(0, 2)).toUpperCase();
}

export function Sidebar({
  role,
  email,
  onNavigate,
}: {
  role: Role;
  email: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navForRole(role);
  const active = activeHref(pathname, items);

  return (
    <div className="flex h-full flex-col bg-surface backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(100deg,#22c55e,#15803d)] text-white shadow-sm">
          <Gamepad2 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-ink">
            Earning Saathi
          </div>
          <div className="text-[11px] text-muted">Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          Menu
        </p>
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-surface-2 text-ink"
                  : "text-muted hover:bg-surface-2/60 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px]",
                  isActive ? "text-ink" : "text-muted",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              ROLE_ACCENT[role],
            )}
          >
            {initials(email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink">
              {email ?? "—"}
            </div>
            <div className="text-[11px] text-muted">{ROLE_LABEL[role]}</div>
          </div>
        </div>
        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2/60 hover:text-ink"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
