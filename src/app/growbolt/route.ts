// GrowBolt Offerwall — hosted wall page for the PrizeUp app.
//
// WHY THIS EXISTS
// GrowBolt has no hosted wall URL of the `?app_id=&user_id=` shape that
// PubScale and GrowDeck expose. Its offerwall is rendered by a JS SDK
// (https://sdk.growbolt.ai/sdk.js) that must be init'd + identified on a page
// we control. This route IS that page.
//
// The PrizeUp app opens it in a Chrome Custom Tab exactly like the other two
// walls (see PrizeUp src/lib/offerwall.ts) — deliberately NOT in an in-app
// react-native-webview, because advertiser anti-fraud blocks the embedded
// WebView "; wv" user-agent (PrizeUp PROBLEMS.md #5). Inside a real Custom Tab
// the SDK's offer redirects (intent:// / market:// / Play Store links) are
// handled natively by Chrome, so no native bridge is needed at all.
//
// A route handler rather than a page.tsx on purpose: no root layout, no
// Tailwind/global CSS, no font loading — just the SDK on a blank dark page, and
// it can read the server-only SDK token from the environment.
//
// CSP: `/growbolt` is excluded from the site-wide policy and gets its own,
// looser one in next.config.ts (it needs sdk.growbolt.ai + admin.growbolt.ai +
// third-party advertiser logo CDNs). Nothing else on the domain is affected.

import { NextResponse } from "next/server";

// Reads the query string, so never prerender or cache it.
export const dynamic = "force-dynamic";

// GrowBolt SDK token — dashboard → Settings → API & Postback → API-Key.
// It is a *publishable* key (GrowBolt's docs: "safe to embed in your frontend
// JavaScript … only has permission to render the offerwall"), so shipping it to
// the browser here is by design, same as PrizeUp's GrowDeck wall secret-key.
// Still read from the env rather than hardcoded so it can be rotated without a
// code change. Unset → the page renders a "being set up" notice instead.
const SDK_TOKEN = process.env.GROWBOLT_SDK_TOKEN ?? "";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Embed a value inside an inline <script> without letting it break out. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const SHELL_CSS = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: #121216;
    color: #fff;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  #gb-shell {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px 24px;
    text-align: center;
  }
  #gb-shell h1 { margin: 0; font-size: 19px; font-weight: 800; }
  #gb-shell p { margin: 0; max-width: 30ch; font-size: 14px; line-height: 1.5; color: #9CA3AF; }
  .gb-spinner {
    width: 34px; height: 34px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.15);
    border-top-color: #16C784;
    animation: gb-spin 0.7s linear infinite;
  }
  @keyframes gb-spin { to { transform: rotate(360deg); } }
  .gb-btn {
    margin-top: 6px;
    border: 0; border-radius: 999px;
    padding: 12px 26px;
    background: #16C784; color: #08130F;
    font-size: 14px; font-weight: 800;
    cursor: pointer;
  }
`;

/**
 * Renders the wall page. `uid` is the PrizeUp user's Supabase UUID and becomes
 * GrowBolt's `sub4` — the value that comes back on the reward postback, so it
 * has to be the real account id and nothing else.
 */
function page(uid: string | null, token: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex, nofollow" />
<title>PrizeUp Offers</title>
<style>${SHELL_CSS}</style>
<script src="https://sdk.growbolt.ai/sdk.js" defer></script>
</head>
<body>
<div id="gb-shell">
  <div class="gb-spinner" id="gb-spinner"></div>
  <h1 id="gb-title">Loading offers…</h1>
  <p id="gb-msg">Hang tight, this only takes a moment.</p>
</div>
<script>
(function () {
  var UID = ${jsonForScript(uid)};
  var TOKEN = ${jsonForScript(token)};

  var spinner = document.getElementById("gb-spinner");
  var title = document.getElementById("gb-title");
  var msg = document.getElementById("gb-msg");
  var shell = document.getElementById("gb-shell");
  var retryBtn = null;

  function state(headline, detail, opts) {
    spinner.style.display = (opts && opts.busy) ? "" : "none";
    title.textContent = headline;
    msg.textContent = detail;
    if (opts && opts.retry) {
      if (!retryBtn) {
        retryBtn = document.createElement("button");
        retryBtn.className = "gb-btn";
        retryBtn.textContent = "Open offers";
        retryBtn.addEventListener("click", open);
        shell.appendChild(retryBtn);
      }
      retryBtn.style.display = "";
    } else if (retryBtn) {
      retryBtn.style.display = "none";
    }
  }

  function open() {
    state("Loading offers…", "Hang tight, this only takes a moment.", { busy: true });
    try {
      GrowBolt.openOfferwall();
    } catch (e) {
      state("Could not open offers", "Please close this tab and try again.", { retry: true });
    }
  }

  if (!TOKEN) {
    state("Offers are being set up", "This offerwall isn't live yet — please check back soon.");
    return;
  }
  if (!UID) {
    state("Open this from the PrizeUp app", "Offers are tied to your account, so they can only be opened from inside the app.");
    return;
  }

  window.addEventListener("load", async function () {
    if (typeof window.GrowBolt === "undefined") {
      state("Could not load offers", "Check your connection, then close this tab and try again.");
      return;
    }
    try {
      // init() first and once — GrowBolt's docs are explicit that it must not
      // be called from a click handler, so the offerwall opens with no latency.
      //
      // baseUrl is pinned rather than left to the SDK's own resolution: when the
      // page is served from localhost/127.0.0.1, sdk.js silently points its API
      // at http://localhost, so the wall loads no offers and \`next dev\` can never
      // be used to test this page. The value here is exactly what the SDK would
      // pick in production anyway, so it changes nothing once deployed.
      await GrowBolt.init({ apiKey: TOKEN, baseUrl: "https://admin.growbolt.ai" });
      // identify() BEFORE openOfferwall(), or completions aren't attributed.
      // sub4 is what the S2S postback sends back to growbolt-callback.
      GrowBolt.identify({ sub4: UID });
      // The wall is a full-screen overlay; when the user backs out of it we
      // land on this shell again, so offer a way back in rather than a
      // dead blank page (they can also just close the Custom Tab).
      GrowBolt.on("widget_closed", function () {
        state("Done for now?", "Close this tab to head back to PrizeUp, or reopen the offers below.", { retry: true });
      });
      open();
    } catch (e) {
      state("Could not load offers", "Please close this tab and try again in a moment.", { retry: true });
    }
  });
})();
</script>
</body>
</html>`;
}

export async function GET(request: Request): Promise<NextResponse> {
  const uidParam = new URL(request.url).searchParams.get("uid");
  // Only ever hand a real UUID to identify() — sub4 lands in GrowBolt's
  // reporting and comes back on the postback, so junk in means junk credited.
  const uid = uidParam && UUID_RE.test(uidParam) ? uidParam : null;

  return new NextResponse(page(uid, SDK_TOKEN), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Contains a user id — never let a proxy or the browser keep it.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
