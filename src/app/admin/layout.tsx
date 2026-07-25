import type { ReactNode } from "react";
import { requireRole } from "@/lib/guard";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("admin");
  return (
    <AppShell role={user.role} email={user.email}>
      {children}
    </AppShell>
  );
}
