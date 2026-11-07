"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client — used in client components (e.g. sign-in button).
// Env vars are read here (not at module import time) so that build-time
// prerendering of pages that import this module never triggers required()
// and fails to generate the static HTML.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  return createBrowserClient(url, key);
}
