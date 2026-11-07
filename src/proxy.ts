import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROLE_HOME, areaForPath, canAccessArea, type Role } from "@/lib/roles";

// Next.js 16: this file replaces `middleware.ts`. It runs before every matched
// request. Responsibilities:
//   1. Refresh the Supabase session cookie (must call getUser early).
//   2. Coarse gate: signed-out users can only reach public paths.
//   3. Route each signed-in user to their ONE allowed area; block cross-area
//      access at the edge (RLS + layouts enforce it again — defense in depth).
//
// NO role switching: a role can only ever land in its single ROLE_HOME.

// Public paths: the marketing site (/), legal pages, login, app-link redirects
// (/i, /prizeup, /auth), the GrowBolt offerwall, and creator stats pages.
// None of these require a platform login.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth",
  "/creator",
  "/i",
  "/prizeup",
  "/growbolt",
  "/privacy-policy",
  "/terms",
  "/how-to-delete",
  "/blog",
];

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  try {
    return await gate(request, response, supabaseUrl, supabaseKey);
  } catch {
    return response;
  }
}

async function gate(
  request: NextRequest,
  response: NextResponse,
  supabaseUrl: string,
  supabaseKey: string,
) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (isPublic(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("platform_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as Role | undefined;

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "no-account");
    return NextResponse.redirect(url);
  }

  const home = ROLE_HOME[role];

  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    return NextResponse.redirect(url);
  }

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
