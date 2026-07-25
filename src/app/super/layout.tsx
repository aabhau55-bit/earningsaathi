import type { ReactNode } from "react";
import { requireRole } from "@/lib/guard";
import { AppShell } from "@/components/app-shell";

export default async function SuperLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("super_admin");
  return (
    <AppShell role={user.role} email={user.email}>
      {children}
    </AppShell>
  );
}
