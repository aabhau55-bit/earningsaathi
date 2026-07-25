"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/actions/guard";
import type { Role } from "@/lib/roles";

const MIN_PASSWORD_LENGTH = 8;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Best-effort audit log for security-relevant platform actions that don't
// already have their own dedicated table (balance adjustments and
// withdrawal actions log separately). Never blocks the action it's
// recording — a logging failure shouldn't undo something that already
// succeeded, but it's surfaced server-side so it's not silently lost.
async function logAdminAction(
  supabase: SupabaseServerClient,
  adminId: string,
  action: string,
  target?: string,
  detail?: string,
) {
  const { error } = await supabase
    .from("admin_action_log")
    .insert({ admin_id: adminId, action, target, detail });
  if (error) {
    console.error(`admin_action_log insert failed (${action}):`, error.message);
  }
}

export async function registerAppAction(
  slug: string,
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_app", {
    p_slug: slug,
    p_name: name,
  });
  if (error) return { ok: false, error: error.message };

  await logAdminAction(supabase, guard.caller.id, "register_app", slug, name);
  revalidatePath("/super");
  revalidatePath("/super/manage");
  return { ok: true };
}

export type CreateAdminResult =
  | { ok: true; email: string; password: string }
  | { ok: false; error: string };

// Postgres can't create auth accounts directly, so this is two steps: create
// the auth user here (service-role client), then provision_admin sets their
// platform_users role/name/app. Unlike creators, an admin's email must not
// already exist anywhere on the platform.
export async function createAdminAction(input: {
  email: string;
  password: string;
  name: string;
  appSlug: string;
}): Promise<CreateAdminResult> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const email = input.email.trim();

  const { data: found, error: findError } = await supabase.rpc(
    "find_platform_user_by_email",
    { p_email: email },
  );
  if (findError) return { ok: false, error: findError.message };
  if ((Array.isArray(found) ? found[0] : found)?.id) {
    return { ok: false, error: "Email already in use" };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });
  if (createError || !created.user) {
    return {
      ok: false,
      error: createError?.message ?? "Could not create account",
    };
  }

  const { error } = await supabase.rpc("provision_admin", {
    p_user_id: created.user.id,
    p_name: input.name.trim(),
    p_app_slug: input.appSlug,
  });
  if (error) return { ok: false, error: error.message };

  await logAdminAction(supabase, guard.caller.id, "create_admin", email, input.appSlug);
  revalidatePath("/super");
  revalidatePath("/super/manage");
  return { ok: true, email, password: input.password };
}

export async function setRoleAction(
  email: string,
  role: Role,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_role", {
    p_email: email,
    p_role: role,
  });
  if (error) return { ok: false, error: error.message };

  await logAdminAction(supabase, guard.caller.id, "set_role", email, role);
  revalidatePath("/super/manage");
  return { ok: true };
}

// Reset any user's password (super_admin — find_platform_user_by_email
// returns any match when the caller is super_admin).
export async function resetPasswordAction(
  email: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_platform_user_by_email", {
    p_email: email.trim(),
  });
  if (error) return { ok: false, error: error.message };
  const found = Array.isArray(data) ? data[0] : data;
  if (!found?.id) return { ok: false, error: "No such user" };

  const admin = createAdminClient();
  const { error: pwError } = await admin.auth.admin.updateUserById(found.id, {
    password: newPassword,
  });
  if (pwError) return { ok: false, error: pwError.message };

  await logAdminAction(supabase, guard.caller.id, "reset_password", email);
  return { ok: true };
}

// Deletes the auth account entirely (not just the platform_users row) — they
// can no longer sign in at all. platform_users.id references auth.users(id)
// on delete cascade, so its row disappears automatically; no separate delete
// needed there. Can't delete your own account (would lock you out).
export async function deleteAdminAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;
  if (guard.caller.id === userId) {
    return { ok: false, error: "You can't delete your own account" };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("platform_users")
    .select("email")
    .eq("id", userId)
    .single();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  await logAdminAction(supabase, guard.caller.id, "delete_admin", target?.email ?? userId);
  revalidatePath("/super/manage");
  return { ok: true };
}
