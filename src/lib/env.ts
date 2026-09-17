// Centralized, validated environment access.
// The publishable (anon) key is exposed to the browser; the service role /
// secret key is server-only and must NEVER be imported into client code.

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Public — safe in the browser.
export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

// Supabase's newer key naming is "publishable"; fall back to the classic
// ANON name so either works.
export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Server-only. Do not import from a "use client" module.
export function getServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// PrizeUp's own Supabase project (separate from this one — see ROADMAP.md).
// Direct Postgres connection, bypasses RLS. Server-only, never imported from
// a "use client" module.
export function getPrizeUpDatabaseUrl(): string {
  return required(
    "PRIZEUP_DATABASE_URL",
    process.env.PRIZEUP_DATABASE_URL,
  );
}

export function getPrizeUpUrl(): string {
  return required("PRIZEUP_SUPABASE_URL", process.env.PRIZEUP_SUPABASE_URL);
}

// Authenticates us to PrizeUp's `push-send` Edge Function. That endpoint can
// message every user of the app, so the secret is server-only and must never
// reach a "use client" module — the compose form calls a Server Action, which
// is what actually holds this.
export function getPushSendSecret(): string {
  return required(
    "PRIZEUP_PUSH_SEND_SECRET",
    process.env.PRIZEUP_PUSH_SEND_SECRET,
  );
}

// Needed to create real PrizeUp accounts (auth.admin.createUser) — the
// supported way, instead of writing to auth.users directly over SQL.
export function getPrizeUpServiceRoleKey(): string {
  return required(
    "PRIZEUP_SUPABASE_SERVICE_ROLE_KEY",
    process.env.PRIZEUP_SUPABASE_SERVICE_ROLE_KEY,
  );
}
