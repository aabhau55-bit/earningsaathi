import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";
import { ROLE_HOME, areaForPath, canAccessArea, type Role } from "@/lib/roles";

// Next.js 16: this file replaces `middleware.ts`. It runs before every matched
// request. Responsibilities:
//   1. Refresh the Supabase session cookie (must call getUser early).
//   2. Coarse gate: signed-out users can only reach public paths.
//   3. Route each signed-in user to their ONE allowed area; block cross-area
//      access at the edge (RLS + layouts enforce it again — defense in depth).
//
// NO role switching: a role can only ever land in its single ROLE_HOME.

// "/" is the static marketing site (public/index.html, rewritten in via
// vercel.json/next.config.ts) — it must never be forced through the login
// redirect, signed in or not. /creator/<code> is a public, email-gated
// stats page — creators never have a login session either. /i and /prizeup
// are the real referral-redirect links (App Links / Play Store fallback) —
// the entire acquisition funnel depends on these being reachable by anyone,
// logged in or not.
const PUBLIC_PATHS = ["/", "/login", "/auth", "/creator", "/i", "/prizeup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

// Canonical host. Everything human-facing lives on www; the bare apex is
// folded into it HERE rather than by a Vercel domain-level "Redirect to
// www" setting, because that setting also redirects
// /.well-known/assetlinks.json — and Android's App Links verifier refuses
// to follow redirects (Google's checker returns ERROR_CODE_REDIRECT). A
// redirected assetlinks.json silently unverifies every earningsaathi.com
// App Link, so invite links and the Google OAuth callback open Chrome
// instead of the app. `config.matcher` below excludes any path containing a
// dot, so assetlinks.json never reaches this function and is served from
// public/ with a plain 200 on both hosts — which is what the verifier needs.
//
// NOTE: this is inert until the apex is switched from "Redirect" to a normal
// domain in Vercel → Settings → Domains. Until then Vercel answers the apex
// at the edge and no request gets this far.
const APEX_HOST = "earningsaathi.com";
const CANONICAL_HOST = "www.earningsaathi.com";

export async function proxy(request: NextRequest) {
  // Cheapest possible check, before the Supabase round-trip below.
  if ((request.headers.get("host") ?? "").toLowerCase() === APEX_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Signed out: allow only public paths; otherwise send to /login.
  if (!user) {
    if (isPublic(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Signed in: resolve role (RLS lets a user read their own row).
  const { data: profile } = await supabase
    .from("platform_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as Role | undefined;

  // No platform_users row yet (trigger should have created it) — sign out safe.
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "no-account");
    return NextResponse.redirect(url);
  }

  const home = ROLE_HOME[role];

  // A signed-in user hitting /login goes to their area. "/" is the public
  // marketing site — signed-in users see it like anyone else, no redirect.
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Enforce single-area access.
  const area = areaForPath(pathname);
  if (area && !canAccessArea(role, area)) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static asset requests. Any
  // request for an actual file (a dot anywhere in the path — .css, .js,
  // .txt, .json, .ico, .well-known/*, etc.) is excluded rather than
  // enumerating extensions one at a time: real app routes never contain a
  // dot, so this can't accidentally let an authenticated page slip through.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};
