# 🌿 Earning Saathi — UX/UI Review & Feature Log

Covers both properties in this repo: the **marketing site** (`public/`) and the
**Earning Saathi Dashboard** (`src/`). Written after reading every page,
component, and stylesheet in both — not a skim.

---

## 1. The theme (reference palette)

Both properties share one design language: **deep-emerald glassmorphism, dark-only**.
The dashboard's tokens were deliberately retinted to match the marketing site
(see `src/app/globals.css:4-11`) — confirmed identical where it counts:

| Token | Hex / value | Used for |
|---|---|---|
| Page background | `#04100b` | Body background, both properties (identical value in `public/styles.css:7` and `src/app/globals.css:15`) |
| Darker band | `#030b07` | Alternating section background on the site |
| Primary green | `#22c55e` | Brand gradient start, `--color-success`/`--color-good`, series-4 |
| Bright green | `#4ade80` | Links, icon tints, gradient headline, brand gradient (logo tiles) |
| Deep green | `#15803d` | Brand gradient end (buttons, logo marks, sidebar icon) |
| Lime | `#a3e635` | Third stop in the hero's animated gradient headline |
| Teal | `#2dd4bf` | Second stop in the gradient headline, one ambient orb |
| Coin gold | `#facc15` | Reserved *only* for the in-app coin motif — never reused elsewhere |
| Body text | `#e6f1ec` | Primary text on both properties |
| Muted text | `#a7c0b6` | Secondary text, labels |
| Faint text | `#6f8a7d` | Footnotes, legal fine print, timestamps |

**Brand gradient**: `linear-gradient(100deg, #22c55e, #15803d)` — the signature mark, reused across the logo lockup, primary buttons, and app icon tiles.

**Glass formula** (reused everywhere as `.glass` on the site, and baked into `Card`/`Button`/`shadow-*` on the dashboard):
```
background: rgba(255,255,255,0.055);
border: 1px solid rgba(255,255,255,0.12);
backdrop-filter: blur(20px) saturate(135%);
box-shadow: 0 18px 50px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.09);
```

**Categorical chart palette** (8 fixed hues, assigned by entity — never re-themed to match the brand; this is intentional, see §3):
`blue #3987e5` · `aqua #199e70` · `yellow #c98500` · `green #22c55e` · `violet #9085e9` · `red #e66767` · `magenta #d55181` · `orange #d95926`

---

## 2. What's good

### Visual identity — consistent and deliberate
- The dashboard isn't a generic admin-template green paint job — its tokens were *explicitly retinted* to match the site (`globals.css:4-11` literally documents this), and the page background, glass formula, and shadow math are byte-identical between the two stylesheets. Same ambient-orb treatment on both (`globals.css:81-94`, `styles.css:64-85`).
- The brand gradient (`#22c55e → #15803d`) is used the same way everywhere it appears: logo tile, primary button, sidebar mark. No second "accidental" brand color anywhere.

### Data-viz discipline (rare to see this done right)
- `src/lib/chart-theme.ts` documents a **fixed, CVD-safe categorical order**, assigned once per entity and never cycled past 8 ("fold into Other" past that) — this is exactly the right pattern for stable, comparable charts over time.
- The code comment is explicit that chart series colors stay CVD-safe and are **not** retinted to match the brand — correctness over cosmetics. (This is why the "Signups over time" chart uses blue, not green — see §3, this is a feature not a bug.)
- Numeric table columns use `tabular-nums` so digits align vertically (`data-table.tsx:74`) — a small but real polish detail most dashboards skip.

### Interaction & feedback
- Every mutating action (toggle a campaign, create a referral, reset a password, register an app) gets a `sonner` toast — success or failure — so the user is never left wondering if a click did anything.
- `ActiveToggle` (`src/app/admin/active-toggle.tsx`) does **optimistic UI with revert-on-failure** — flips instantly, snaps back and toasts an error if the server call fails. This is the correct pattern and it's implemented correctly.
- `RolesTable` disables role-editing on your own row (`isSelf`) — a thoughtful guard against a super_admin locking themselves out.

### Accessibility
- `prefers-reduced-motion: reduce` is honored on **both** properties — all drifting orbs, shimmer, hover-lifts, and scroll-reveal are disabled (`styles.css:492-497`, mirrored intent in the dashboard's simpler animation set).
- The marketing site's scroll-reveal only hides content once a `.js` class confirms JavaScript ran — so a no-JS visitor still sees everything (`index.html:18-21`, `styles.css:484`).
- Focus-visible rings on `Button` and `Input`, `role="switch"`/`aria-checked` on the campaign toggle, `aria-label` on icon-only buttons, `aria-hidden` on decorative overlays — these aren't afterthoughts, they're on every interactive primitive I read.
- Contrast was measured, not assumed — every text token against the `#04100b` background clears WCAG AA with real margin:

  | Pair | Ratio | AA (4.5:1) |
  |---|---|---|
  | Body text `#e6f1ec` | 16.75:1 | ✅ |
  | Muted `#a7c0b6` | 10.02:1 | ✅ |
  | Faint `#6f8a7d` (smallest, used for legal fine print) | 5.17:1 | ✅ |
  | Bright-green links `#4ade80` | 11.12:1 | ✅ |
  | White on primary button `#15803d` | 5.02:1 | ✅ |

### Component architecture (dashboard)
- A real shared UI kit — `Badge`, `Button`, `Card`/`CardHeader`/`CardBody`, `DataTable`, `StatCard`, `EmptyState`, `CopyButton`/`CopyField`, `Skeleton`, chart wrapper — used consistently everywhere instead of one-off styled `div`s per page.
- `DataTable` scrolls horizontally **inside its own container**, so the page body never scrolls sideways on small screens — the correct containment pattern.
- Every table has a real, specific `EmptyState` (not just "no data") — e.g. "No creators yet — this admin hasn't created any referral links."

---

## 3. What's not good (real gaps, verified)

| # | Finding | Where | Why it matters |
|---|---|---|---|
| 1 | **Mobile nav has no menu — links just disappear.** `.nav-links a:not(.nav-cta) { display: none; }` below 760px, with no hamburger to reveal them. | `public/styles.css:153` | On mobile, visitors can only reach Products / How it works / Inside PrizeUp / About / Contact by scrolling — the nav becomes decorative except for the "Get PrizeUp" CTA. |
| 2 | **Two hand-maintained theme files, no shared source of truth.** `public/styles.css` and `src/app/globals.css` currently agree (I diffed the values), but nothing enforces that — a future rebrand tweak in one will silently drift from the other. | `public/styles.css:6-35` vs `src/app/globals.css:13-50` | Maintainability risk, not a visible bug today. |
| 3 | **No route-level loading state.** Every dashboard page is an async Server Component awaiting `Promise.all([...])` (the `/super` page alone fires 6 parallel RPCs) with no `loading.tsx`/Suspense boundary anywhere in `src/app`. `Skeleton` and `StatCard`'s `loading` prop exist but are never actually triggered. | confirmed via search — no `loading.tsx`/`error.tsx` in `src/app` | On a slow connection, navigating between `/super`, `/admin`, `/creator` shows a blank/frozen page until *all* queries resolve, instead of an instant skeleton. |
| 4 | **Two icon philosophies.** The marketing site uses emoji as iconography (🎮❓🎁); the dashboard uses `lucide-react` SVG icons. Reasonable independently, but emoji render differently per OS (Windows/macOS/Android draw them differently), so the site's visual weight isn't fully consistent across visitors' devices — the dashboard's SVG icons don't have that problem. | `public/index.html` vs any `src/components` file | Low severity, but worth knowing if the two properties are ever shown side-by-side (e.g. a screenshot deck). |
| 5 | **Small duplication, not a UX bug but worth a pass:** the `num()` formatter (`Number(n ?? 0).toLocaleString()`) is copy-pasted in 5 files instead of one shared util; the 12-char password generator is copy-pasted in 2 forms; the brand gradient string is hardcoded independently in ~4 places (`button.tsx`, `sidebar.tsx`, `app-shell.tsx`, `styles.css`) instead of one token. | `src/app/admin/page.tsx:31`, `src/app/creator/page.tsx:18`, `src/app/super/page.tsx:39`, `src/app/super/admins/[id]/page.tsx:19`, `src/components/campaign-detail.tsx:19` | No visible effect today; makes future changes (e.g. "change the brand gradient angle") more error-prone since there's no single place to edit. |
| 6 | **Dark-only, by design.** Neither property has a light mode — confirmed intentional (`globals.css:5-6` literally says "the marketing site has no light mode, so neither does this"). Not a flaw, but worth flagging: an admin using the dashboard outdoors or in a bright office has no alternative. | — | Deliberate brand-consistency tradeoff — flagging for awareness, not recommending a change. |

---

## 4. Dashboard — full feature list (built)

### Auth & session
- Email/password sign-in (`src/app/(auth)/login/page.tsx`) — no self-signup by design.
- Session refresh + role-based routing on every request (`src/proxy.ts` — Next.js 16's replacement for `middleware.ts`).
- Three-layer access control: proxy (edge redirect) → `requireRole()` per-layout → Postgres RLS. Each of the three roles is hard-locked to exactly one area, no switching.
- Sign-out route (`src/app/auth/signout/route.ts`).

### super_admin (`/super`)
- **Overview**: 6 KPI tiles (users, coins, signups, active links, creators, admins), "signups over time" area chart (30 days), "signups by app" bar chart, app switcher (filter everything by app or view all), campaigns table, admins table.
- **Manage** (`/super/manage`): register a new app, create an admin (scoped to one app), create a referral link/creator for any app, and a roles & passwords table (change any user's role inline, reset any password, self-role-change disabled).
- **Admin detail** (`/super/admins/[id]`): that admin's assigned app + every creator they've provisioned, with signup counts across time windows.
- **Campaign detail** (`/super/campaigns/[id]`): referral link, users referred, total coins, per-user table — with an App column since a super admin can view any app's campaign.

### admin (`/admin`)
- Dashboard scoped to their one assigned app: create a referral link (provisions the creator if new), campaigns table with a live active/pause toggle, creators table (links, 24h/7d/lifetime signups).
- Campaign detail drill-down (same shared component as super, without the App column).
- Reset a creator's password.

### creator (`/creator`)
- "Your Referrals": stat tiles across 5 time windows (1h / 24h / 7d / 30d / lifetime), per-link breakdown table if they have more than one link. No emails or coin totals exposed to creators — numbers only.

### Shared UI kit
`Badge`, `Button` (4 variants × 2 sizes), `Card`/`CardHeader`/`CardBody`, `DataTable` (generic, horizontally-contained, empty-state fallback), `StatCard`/`StatGrid`, `EmptyState`, `CopyButton`/`CopyField` (clipboard + toast), `Skeleton`, chart wrapper + themed tooltip, `Input`/`Field`.

### Cross-cutting
- Responsive app shell: fixed sidebar on desktop, slide-over drawer on mobile.
- Toast notifications (via `sonner`) on every mutating action.
- Password generator (excludes ambiguous characters) on every "create account" form.

---

## 5. Remaining — not yet done

### Infrastructure (blocking a real deploy)
- [ ] Confirm/create the first `super_admin` row in the existing Supabase project.
- [ ] Fill in `.env.local` (dev) and Vercel project env vars (prod) from that Supabase project.
- [ ] Commit everything — the rename, `vercel.json` fix, `urls.ts` fix, and the entire `src/` app are still uncommitted.
- [ ] Create the Vercel project, deploy, attach `earningsaathi.com` as the custom domain.

### Housekeeping (low risk, whenever convenient)
- [ ] Delete the now-dead `.htaccess` (Vercel ignores it; `vercel.json` owns the rewrites now).
- [ ] Clear 3 unused-import ESLint warnings in `src/app/admin/page.tsx`.
- [ ] Run `npm audit fix` (fixes `brace-expansion`, dev-only) and bump the pinned `next` version to `16.2.11` (fixes the other 3 high-severity advisories).
- [ ] `pg` is an unused devDependency — either wire it into a real migration/seed script or drop it.

### UX/UI follow-ups (from §3 of this review)
- [ ] Add a mobile menu (hamburger + drawer) to the marketing site nav instead of hiding links outright.
- [ ] Add `loading.tsx` (or Suspense boundaries) to `/super`, `/admin`, `/creator` so route transitions show the existing `Skeleton`/`StatCard` loading state instead of a blank page.
- [ ] Consolidate the brand gradient, and ideally the whole token set, into one source both stylesheets import from — instead of two hand-synced copies.
- [ ] Extract the duplicated `num()` formatter and password generator into `src/lib/format.ts` / `src/lib/password.ts`.

### Product features not yet built (not attempted, no code for these)
- [ ] No CSV/export option anywhere in the dashboard (campaigns, referred users, or admin lists).
- [ ] No date-range picker for the KPI/charts — "last 30 days" is hardcoded (`super/page.tsx:53`).
- [ ] No audit log / activity history for role changes or password resets performed via the Manage tab.
- [ ] No email notifications (e.g. to a newly-created admin/creator with their credentials) — credentials are shown once in the UI only, admin must relay them manually.
