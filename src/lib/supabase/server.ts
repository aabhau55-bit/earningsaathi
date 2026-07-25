import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

// Server Supabase client for Server Components, Route Handlers, and Server
// Actions. Reads/writes the session cookie via next/headers. In a pure Server
// Component, cookie writes throw (read-only) — we swallow that; the proxy is
// responsible for refreshing/persisting the session cookie.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — safe to ignore; the proxy
          // refreshes the session on the next request.
        }
      },
    },
  });
}
