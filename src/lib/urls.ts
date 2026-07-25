import { SITE_URL } from "@/lib/env";

// A PrizeUp user's own referral link. Resolves at earningsaathi.com/i/<code>
// (public/i/index.html) — opens the app directly via App Links, or falls back
// to the Play Store with the referral code attached. `code` is a real
// profiles.referral_code from PrizeUp's own database, not a generated token.
export const SHORTLINK_BASE =
  process.env.NEXT_PUBLIC_SHORTLINK_BASE ?? "https://earningsaathi.com/i";

export function referralUrl(code: string): string {
  return `${SHORTLINK_BASE}/${code}`;
}

// The public, email-gated stats page a creator uses to check their installs.
// No login — the referral code (from the link) plus their email together
// unlock a read-only view of PrizeUp's real referrals table.
export function creatorStatsUrl(code: string): string {
  return `${SITE_URL}/creator/${code}`;
}
