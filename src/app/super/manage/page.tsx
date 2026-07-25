import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { RegisterAppForm } from "./register-app-form";
import { CreateAdminForm } from "./create-admin-form";
import { RolesTable, type ManagedUser } from "./roles-table";
import type { Role } from "@/lib/roles";

type PU = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  app_id: string | null;
};

export default async function ManagePage() {
  const user = await getSessionUser();
  const supabase = await createClient();

  const [appsRes, usersRes] = await Promise.all([
    supabase.from("apps").select("id, slug, name").order("name"),
    supabase
      .from("platform_users")
      .select("id, email, name, role, app_id")
      .order("created_at"),
  ]);

  const appRows = (appsRes.data ?? []) as { id: string; slug: string; name: string }[];
  const apps = appRows.map((a) => ({ slug: a.slug, name: a.name }));
  const appById = new Map(appRows.map((a) => [a.id, a.name]));

  const managed: ManagedUser[] = ((usersRes.data ?? []) as PU[]).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    app_name: u.app_id ? (appById.get(u.app_id) ?? null) : null,
  }));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Manage</h1>
        <p className="mt-1 text-sm text-muted">
          Register apps, create admins, and manage roles &amp; passwords.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RegisterAppForm />
        <CreateAdminForm apps={apps} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">
          Roles &amp; passwords ({managed.length})
        </h2>
        <RolesTable users={managed} currentEmail={user!.email ?? ""} />
      </div>
    </section>
  );
}
