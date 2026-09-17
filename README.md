# earningsaathi.com — referral landing + App Links

This folder is the website that powers the referral system. Upload it to your
**Hostinger** hosting for `earningsaathi.com` (it's plain static files + a
`.htaccess` — no PHP, no build step).

```
website/
  index.html                      ← product showcase / landing page for the root domain
  styles.css                      ← shared dark-neon styles (used by index/privacy/terms)
  privacy-policy.html             ← Privacy Policy (required URL for Play Data Safety)
  how-to-delete.html              ← Account & data deletion page (Play Data Safety URL)
  terms.html                      ← Terms of Service
  i/index.html                    ← referral redirect; serves all /i/<code> links
  .htaccess                       ← rewrites /i/<code> → i/index.html + serves assetlinks as JSON
  .well-known/assetlinks.json     ← verifies Android App Links (needs your SHA-256)
```

The site is a single **product showcase** landing page plus the legal/referral files the
app and Play Console require. It's plain static HTML/CSS — no images, fonts, or build
step (the logo/coin marks are emoji, the phone preview is pure CSS), so it loads instantly
and uploads as-is.

After deploy, the Play Console privacy-policy URL is
`https://earningsaathi.com/privacy-policy.html` and the account-deletion URL is
`https://earningsaathi.com/how-to-delete.html`. The policy/terms are templates — review
the content (and the `support@earningsaathi.com` contact) before publishing.

## What it does

- `https://earningsaathi.com/i/LOOT1A2B3`
  - **App installed** → Android opens the app directly (verified App Link) and the
    app reads the code from the URL.
  - **App not installed** → `i/index.html` redirects to the Play Store with
    `&referrer=ref=LOOT1A2B3`. After install, the app reads it back via
    `Application.getInstallReferrerAsync()` and auto-applies the code.

## One-time deploy (Hostinger)

1. **Point the domain at Hostinger.** In hPanel the domain should already resolve to
   your hosting; if it's registered elsewhere, set its nameservers/A-record to
   Hostinger. Make sure HTTPS is on (hPanel → SSL — free Let's Encrypt).
2. **Upload the files.** hPanel → **File Manager** → open `public_html` (the document
   root for `earningsaathi.com`). Upload the **contents of this `website/` folder** so
   you end up with:
   ```
   public_html/index.html
   public_html/privacy-policy.html
   public_html/how-to-delete.html
   public_html/terms.html
   public_html/i/index.html
   public_html/.htaccess
   public_html/.well-known/assetlinks.json
   ```
   - The File Manager hides dotfiles/dotfolders by default — enable
     **Settings → Show hidden files** so `.htaccess` and `.well-known` upload and show.
   - Or upload via FTP (hPanel → Files → FTP Accounts).
3. **Verify** (in a browser):
   - `https://earningsaathi.com/` → landing page loads over HTTPS.
   - `https://earningsaathi.com/privacy-policy.html` → policy loads.
   - `https://earningsaathi.com/how-to-delete.html` → deletion page loads.
   - `https://earningsaathi.com/.well-known/assetlinks.json` → returns the JSON
     (Content-Type `application/json`).
   - `https://earningsaathi.com/i/TEST123` → shows "Opening PrizeUp…" then
     redirects to the Play Store URL (with `referrer=ref=TEST123`).

> If `/i/TEST123` 404s, mod_rewrite isn't picking up `.htaccess`. Hostinger
> (LiteSpeed) honors it by default; confirm the file is in `public_html` and named
> exactly `.htaccess`.

## Fill in the SHA-256 fingerprint (required for App Links)

`assetlinks.json` currently has a placeholder. After your first EAS build, get the
app-signing fingerprint and paste it in:

```bash
eas credentials -p android
# → choose your profile → "Keystore" → copy the SHA-256 Fingerprint
```

If Google manages your signing key (Play App Signing — the default), also copy the
SHA-256 from **Play Console → your app → Setup → App integrity → App signing**.
You can list **multiple** fingerprints in the array — include both the upload key
and the Play-managed key to be safe:

```json
"sha256_cert_fingerprints": [
  "AA:BB:CC:…   (EAS upload key)",
  "11:22:33:…   (Play App Signing key)"
]
```
Re-upload `assetlinks.json` after editing. Android re-verifies App Links on install;
you can force a re-check on a device with:

```bash
adb shell pm verify-app-links --re-verify com.earningsaathi.prizeup
adb shell pm get-app-links com.earningsaathi.prizeup   # should show "verified"
```

> Note: `assetlinks.json` must be served over HTTPS with no redirects and
> `Content-Type: application/json`. The included `.htaccess` forces the JSON type;
> just make sure SSL is enabled in hPanel.
