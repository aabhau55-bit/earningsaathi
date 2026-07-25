import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: admin } = await supabase
    .from("platform_users")
    .select("id, email, name, role, app_id")
    .eq("id", id)
    .single();

  if (!admin) notFound();

  const { data: appRow } = admin.app_id
    ? await supabase.from("apps").select("name").eq("id", admin.app_id).single()
    : { data: null };

  return (
    <section className="space-y-6">
      <Link
        href="/super"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-ink sm:text-xl">
            {admin.name ?? admin.email}
          </h1>
          <Badge tone="blue">Admin</Badge>
          {appRow?.name && <Badge tone="aqua">{appRow.name}</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted">{admin.email}</p>
      </div>
    </section>
  );
}
