import type { NextConfig } from "next";

// `unsafe-inline` is needed because the static app-link pages (auth, prizeup,
// i) still have inline scripts, and Next's dev overlay needs `unsafe-eval`.
// `https://*.supabase.co` in connect-src is for the browser's Supabase Auth
// calls (login) — PrizeUp's project is only ever reached server-side.
function contentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

// The GrowBolt offerwall page (/growbolt) can't run under the policy above: it
// loads GrowBolt's SDK, talks to their API, and renders offer artwork served
// from whatever CDN each advertiser uses. Rather than loosen the policy for the
// whole domain — the admin dashboard handles withdrawals and shares it — the
// exemption is scoped to that one path, and every other directive stays strict.
//
//   script-src  https://sdk.growbolt.ai  — the SDK bundle itself
//   connect-src https://admin.growbolt.ai — offers/redeem API the SDK calls
//   frame-src   https://sdk.growbolt.ai  — only used if renderMode is ever
//                                          switched to 'iframe'; harmless now
//   img-src     https:                   — offer logos come from third-party
//                                          advertiser CDNs (Affise, S3, …) and
//                                          can't be usefully enumerated
function growboltContentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://sdk.growbolt.ai${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://admin.growbolt.ai",
    "frame-src https://sdk.growbolt.ai",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  // "/auth" is exact, so the POST /auth/signout route handler is untouched —
  // it only catches the bare OAuth redirect landing URL. /prizeup and /i are
  // app-link redirect pages that use Android intents and must stay as static
  // HTML (no SSR).
  async rewrites() {
    return [
      { source: "/auth", destination: "/auth/index.html" },
      { source: "/prizeup/:code", destination: "/prizeup/index.html" },
      { source: "/i/:code", destination: "/i/index.html" },
    ];
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    // Everything except the CSP — identical on every path, GrowBolt included.
    const commonHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    // The two CSP rules below MUST stay mutually exclusive: a path matching
    // both would emit two Content-Security-Policy headers, and the browser
    // enforces the intersection — which would silently block the SDK.
    return [
      { source: "/:path*", headers: commonHeaders },
      {
        // Every path except "/growbolt" (with or without a trailing slash —
        // the /growbolt rule below matches both, so both must be excluded here
        // or that one path would get two conflicting CSP headers).
        source: "/((?!growbolt/?$).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(isDev),
          },
        ],
      },
      {
        source: "/growbolt",
        headers: [
          {
            key: "Content-Security-Policy",
            value: growboltContentSecurityPolicy(isDev),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
