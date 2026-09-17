# 🌿 Earning Saathi Dashboard — Roadmap

Companion to [UX-UI-REVIEW.md](UX-UI-REVIEW.md) (note: that doc predates the
architecture correction below and describes the old, disconnected campaign
system — treat its feature list as outdated, its design/theme notes as still
valid).

## Current role scope

| Role | Scope |
|---|---|
| **super_admin** | Everything: register apps, create admins (Manage), search all PrizeUp users (Users), view the withdrawal queue (Withdrawals), create campaigns + see every admin's campaigns (Admins). |
| **admin** | Create campaigns for creators, see their own campaigns' stats. Scoped to one app. |
| ~~**creator**~~ | Not a platform role. A "creator" is just a real PrizeUp player account — they check their own stats at a public, email-gated link (`/creator/<code>`), no login. |

## Decision log 

**Two Supabase projects, not one.** This dashboard's platform database
(`platform_users`/`apps`) is separate from PrizeUp's own live production
database (`profiles`/`referrals`/`redemptions`/etc.). Keeping them separate
means a bug or leaked credential in this dashboard's code can't touch real
user funds. This dashboard connects to PrizeUp's project directly (read via
`prizeupQuery`, account creation via `createPrizeUpAdminClient`) — no sync
pipeline, no replication, just live reads/writes.

**Campaigns reuse PrizeUp's own referral system — nothing new was invented.**
Originally built a parallel "campaign token" system in this dashboard's own
database; scrapped it once we found PrizeUp already has a fully working
peer-to-peer referral system (`profiles.referral_code` + `apply_referral`).
Now "creating a campaign" just creates (or reuses) a real PrizeUp account for
that email — it gets a real referral code the exact same way any organic
signup does, so `apply_referral` already recognizes it with zero changes to
PrizeUp's schema. This dashboard's own database only stores a thin bookkeeping
table (`creator_campaigns`: which admin set up which PrizeUp account, and
what they labeled it) — never the referral data itself.

---

## What's built and verified (against real, live PrizeUp data)

- **Overview** (`/super`) — real KPIs (users, coins, gems, referrals, pending withdrawals) and a real 30-day signups chart.
- **Users** (`/super/users`) — full paginated list of all PrizeUp users, searchable by email/UID/username/referral code.
- **Withdrawals** (`/super/withdrawals`) — the real `redemptions` queue, filterable by status (all/pending/approved/sent/rejected). **Read-only** — no approve/reject/fulfill actions yet.
- **Admins** (`/super/admins`) — admin list + every campaign across the platform, with live referral-link and referred-count columns.
- **Create campaign** (on both `/admin` and `/super/admins`) — enter an email, get back a real referral link (`/i/<code>`) and a public stats link (`/creator/<code>`) for the creator, no password needed unless a brand-new account was created.
- **`/creator/<code>`** — public, email-gated stats page (lifetime + 1h/24h/7d/30d), no login.
- First `super_admin` bootstrapped: `ashish.mishra.lootbox@gmail.com`.

## What's genuinely still open

1. **Deploy.** Nothing above is live yet — still running on `next dev` locally. See checklist below.
2. **Withdrawal actions.** Approve/reject/fulfill isn't built — the page is view-only. Fulfillment today is still the manual process in PrizeUp's own `supabase/FULFILLMENT.md` runbook.
3. **Balance adjustment.** "Search a UID and adjust coins/gems" (from the original ask) was never built — Users is search/view only, no editing.
4. **Security review** before shipping anything that writes to PrizeUp's database (withdrawal actions, balance adjustment) — that's real-money-adjacent territory.
5. Housekeeping: `npm audit` had 4 high-severity findings (framework/tooling, not app code) — `npm audit fix` + bumping pinned `next` to `16.2.11` still pending. Dead `.htaccess` still present.
6. Reminder: the PrizeUp database password that got pasted in chat during setup should be rotated if it hasn't been already (Supabase → Settings → Database → Reset password).

---

## Deploy checklist (Phase 0)

- [ ] Commit everything — nothing in this whole rebuild is committed to git yet
- [ ] Create the Vercel project, import this repo
- [ ] Set env vars in Vercel (Production): all of `.env.local`'s keys, **plus explicitly set `NEXT_PUBLIC_SITE_URL=https://earningsaathi.com`** — it defaults to `localhost:3000` and nothing will error if you forget it, it'll just silently generate broken stats links in production
- [ ] Attach `earningsaathi.com` as the custom domain (point DNS at Vercel if not already)
- [ ] Verify a real stats link generated in production actually resolves to `earningsaathi.com`, not `localhost`

---

## If/when you want withdrawal actions + balance adjustment built then

That's genuinely new work, not yet started:
- `approve_withdrawal` / `reject_withdrawal` — needs a decision on manual (mark sent + paste code, matching the existing runbook) vs. automated payout (calling an actual gift-card/UPI provider API — a vendor integration, not just code)
- `adjust_balance(uid, coins_delta, gems_delta, reason)` — needs an audit/ledger table recording who adjusted what and why, non-negotiable once real value is being moved
- Both need a dedicated security pass before touching production — this is the highest-risk surface in the whole app
