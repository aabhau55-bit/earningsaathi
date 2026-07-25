"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Gamepad2 } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { navForRole, activeHref } from "@/lib/nav";
import type { Role } from "@/lib/roles";

// Professional dashboard shell: fixed sidebar on desktop, slide-over drawer on
// mobile, and a slim top bar showing the current section.
export function AppShell({
  role,
  email,
  children,
}: {
  role: Role;
  email: string | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navForRole(role);
  const active = activeHref(pathname, items);
  const sectionTitle = items.find((i) => i.href === active)?.label ?? "";

  return (
    <div className="min-h-dvh bg-page text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-hairline lg:block">
        <Sidebar role={role} email={email} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-hairline bg-surface shadow-xl backdrop-blur-xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 rounded-md p-1 text-muted hover:bg-surface-2"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar role={role} email={email} onNavigate={() => setOpen(false)} />
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-hairline bg-page/80 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-1.5 text-ink hover:bg-surface-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand on mobile (sidebar hidden), section title on desktop */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(100deg,#22c55e,#15803d)] text-white">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">Earning Saathi</span>
            </div>
            <h1 className="hidden text-sm font-semibold text-ink lg:block">
              {sectionTitle}
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
