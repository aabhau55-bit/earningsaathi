"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

// Browser Supabase client — used in client components (e.g. sign-in button).
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
