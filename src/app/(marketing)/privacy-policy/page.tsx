import Link from "next/link";

export const metadata = {
  title: "Privacy Policy -PrizeUp",
  description:
    "Privacy Policy for the PrizeUp rewards app by Earning Saathi.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-2 text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted">Last updated: 17 September 2026</p>

      <p className="mb-4 leading-relaxed text-ink-2">
        This Privacy Policy explains how <strong className="text-ink">Earning Saathi</strong>{" "}
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and protects your
        information when you use the <strong className="text-ink">PrizeUp</strong> mobile application
        (&ldquo;the app&rdquo;). By installing or using the app, you agree to this policy.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">1. Who we are</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        PrizeUp is a free rewards app published by Earning Saathi. You can contact us any time at{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
        .
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">2. Information we collect</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We collect only what we need to run the app and credit your rewards:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>
          <strong className="text-ink">Account information.</strong> When you sign in with Google, we
          receive your email address and basic Google profile information (such as your name) to
          create and identify your account.
        </li>
        <li>
          <strong className="text-ink">App activity.</strong> Your coin balance, transaction history,
          games played, daily check-ins, redemption requests, and referral relationships -stored to
          operate your account and credit rewards.
        </li>
        <li>
          <strong className="text-ink">Referral attribution.</strong> If you install the app from a
          referral link, the Google Play install referrer is read once to attribute your referral to
          the friend who invited you.
        </li>
        <li>
          <strong className="text-ink">Technical/diagnostic data.</strong> Our hosting provider
          records standard server logs (such as access timestamps and IP address) to keep the service
          secure and prevent fraud.
        </li>
        <li>
          <strong className="text-ink">Offerwall &amp; advertising ID.</strong> We collect your
          device Advertising ID (GAID/AAID) to detect fraudulent or duplicate accounts, to help
          credit completed offers, and to select and measure advertising. When you open an optional
          in-app offerwall (PubScale, GrowDeck or GrowBolt), we share a random in-app identifier so
          that completed offers can be credited to you, and that offerwall and its offer providers may
          also access your device Advertising ID for offer attribution. You can reset or opt out of
          this identifier at any time in your Android settings (Settings &rarr; Privacy &rarr; Ads).
          Using an offerwall is entirely optional.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed text-ink-2">
        The app <strong className="text-ink">shows third-party ads</strong>: full-screen ads at
        natural breaks in the app, rewarded videos you choose to watch in order to earn, and banner
        ads on some screens. These are delivered through Unity LevelPlay, which mediates several ad
        networks (including ironSource, Unity Ads and Start.io). Those networks may access your device
        Advertising ID to select, deliver and measure ads. We do{" "}
        <strong className="text-ink">not</strong> sell your personal information.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        3. How we use your information
      </h2>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>Create, operate and secure your account;</li>
        <li>Credit, track and display your coins and reward history;</li>
        <li>Enable referrals and process gift-card redemption requests;</li>
        <li>Detect and prevent fraud, abuse and policy violations;</li>
        <li>Respond to your support requests and communicate service updates;</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        4. How we share your information
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We do not sell your personal information. We share data only with:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>
          <strong className="text-ink">Supabase</strong> -our database, authentication and hosting
          provider, which stores your account and activity data on our behalf (
          <a
            href="https://supabase.com/privacy"
            className="text-success hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase privacy policy
          </a>
          ).
        </li>
        <li>
          <strong className="text-ink">Google</strong> -to provide Google Sign-In.
        </li>
        <li>
          <strong className="text-ink">PubScale, GrowDeck and GrowBolt</strong> -our offerwall
          partners. When you use an offerwall it receives a random in-app identifier and
          offer-completion data, and may access your device Advertising ID, to serve offers and credit
          your rewards (
          <a
            href="https://pubscale.com/privacy-policy"
            className="text-success hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            PubScale privacy policy
          </a>
          ).
        </li>
        <li>
          <strong className="text-ink">Unity LevelPlay and the ad networks it mediates</strong>{" "}
          (including ironSource, Unity Ads and Start.io) -our advertising partners. They receive your
          device Advertising ID and standard ad-request data in order to select, deliver and measure
          the ads shown in the app (
          <a
            href="https://unity.com/legal/game-player-and-app-user-privacy-policy"
            className="text-success hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unity privacy policy
          </a>
          ).
        </li>
        <li>
          <strong className="text-ink">Reward fulfillment.</strong> When you redeem a gift card, we
          use the minimum information necessary to obtain and deliver your gift-card code.
        </li>
        <li>
          <strong className="text-ink">Legal.</strong> We may disclose information if required by law
          or to protect the rights, safety and security of our users and our service.
        </li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">5. Data retention</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We keep your information for as long as your account is active or as needed to provide the
        service, comply with legal obligations, resolve disputes and enforce our agreements. When no
        longer needed, it is deleted or anonymized.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        6. Account &amp; data deletion
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        You can request deletion of your account and all associated personal data at any time. See our{" "}
        <Link href="/how-to-delete" className="text-success hover:underline">
          account deletion page
        </Link>{" "}
        for full details, or use one of the methods below:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>
          In the app: open <strong className="text-ink">Profile &rarr; Delete Account</strong>, or
        </li>
        <li>
          Email{" "}
          <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
            support@earningsaathi.com
          </a>{" "}
          from your registered email with the subject &ldquo;Delete my account&rdquo;.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed text-ink-2">
        We will verify your request and permanently delete your profile, coin balance, transaction
        history and referral data within <strong className="text-ink">30 days</strong>, except where
        we are required to retain certain records by law. Deletion is irreversible and any unredeemed
        coins are forfeited.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        7. Your rights &amp; choices
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Depending on where you live, you may have the right to access, correct, export or delete your
        personal data, or object to certain processing. To exercise these rights, contact{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
        . You can also sign out at any time from the Profile screen.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">8. Security</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We use industry-standard measures to protect your data, including encrypted connections and
        access controls. Reward balances can only be changed by our secure server logic, never
        directly by the app. No method of transmission or storage is 100% secure, but we work to
        protect your information.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        9. Children&apos;s privacy
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        PrizeUp is intended for users who are <strong className="text-ink">13 years of age or older</strong>.
        It is not directed to children under 13, and we do not knowingly collect personal information
        from anyone under 13. If we learn that we have collected such information, we will delete it.
        If you believe a child has provided us data, contact us at{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
        .
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        10. International data transfers
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Your information may be processed and stored on servers operated by our providers in locations
        outside your country. We take steps to ensure your data is handled in line with this policy
        wherever it is processed.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        11. Changes to this policy
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We may update this policy from time to time. Material changes will be reflected by an updated
        &ldquo;Last updated&rdquo; date, and where appropriate we will notify you in the app.
        Continued use after changes means you accept the updated policy.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">12. Contact us</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Earning Saathi -{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
      </p>
    </main>
  );
}
