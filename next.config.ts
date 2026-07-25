import type { NextConfig } from "next";

// `unsafe-inline`/`unsafe-eval` are weaker than ideal — a nonce-based CSP
// would be stricter — but the marketing site (public/*.html) has inline
// <script> tags (scroll-reveal, footer year) and Next's dev overlay needs
// `unsafe-eval`, so this is the safe middle ground without reworking either.
// `https://*.supabase.co` in connect-src is for the browser's own Supabase
// Auth calls (login) — PrizeUp's project is only ever reached server-side.
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

const nextConfig: NextConfig = {
  // Mirrors vercel.json so `next dev` behaves the same as production. Root
  // "/" is the static marketing site (public/index.html) — the dashboard
  // lives at /dashboard, not at the domain root.
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/prizeup/:code", destination: "/prizeup/index.html" },
      { source: "/i/:code", destination: "/i/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(process.env.NODE_ENV !== "production"),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
