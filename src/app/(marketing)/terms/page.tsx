import Link from "next/link";

export const metadata = {
  title: "Terms of Service -PrizeUp",
  description:
    "Terms of Service for the PrizeUp rewards app by Earning Saathi.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-2 text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted">Last updated: 3 June 2026</p>

      <p className="mb-4 leading-relaxed text-ink-2">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the{" "}
        <strong className="text-ink">PrizeUp</strong> app (&ldquo;the app&rdquo;), operated by{" "}
        <strong className="text-ink">Earning Saathi</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        By creating an account or using the app, you agree to these Terms. If you do not agree, do
        not use the app.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">1. Eligibility</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        You must be at least <strong className="text-ink">13 years old</strong> (or the age of
        majority in your jurisdiction) to use PrizeUp and to redeem rewards. You may hold only{" "}
        <strong className="text-ink">one account</strong>, and you agree to provide accurate
        information and keep your login secure. You are responsible for activity under your account.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        2. Coins are a virtual currency
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Coins are a virtual, in-app currency used solely within PrizeUp.{" "}
        <strong className="text-ink">
          Coins have no monetary or cash value
        </strong>
        , cannot be purchased, sold, transferred, or exchanged for cash, and are not a financial
        instrument, deposit, or stored-value account. Coins can only be redeemed for the gift cards
        and vouchers we make available in the app, subject to availability.{" "}
        <strong className="text-ink">No purchase is ever necessary</strong> to earn or redeem coins.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">3. Earning coins</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        You can earn coins through free in-app activities such as daily check-ins, quizzes, games
        (e.g. Spin, Scratch, Tic-Tac-Toe), and referrals. We may add, change, limit or remove
        earning activities and adjust coin values at any time. Daily limits and caps may apply to keep
        the app fair.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">4. Referrals</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Referral bonuses are credited when a new user installs the app and signs in using your code or
        invite link. Each user may apply only one referral code, self-referrals are not permitted, and
        we may withhold or reverse bonuses linked to fraudulent, duplicate, or fake accounts.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">5. Redeeming rewards</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        When you redeem, the required coins are deducted and a redemption request is created. We
        review requests and aim to deliver your gift-card code{" "}
        <strong className="text-ink">within 24 hours</strong>; delivery times may vary by reward and
        availability. Rewards are subject to the terms of the issuing brand. We may decline or refund
        requests linked to suspicious activity, insufficient balance, or stock issues. Coins deducted
        for a rejected request are returned to your balance.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">6. Acceptable use</h2>
      <p className="mb-4 leading-relaxed text-ink-2">You agree not to:</p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>use bots, scripts, emulators, or automation to earn or redeem coins;</li>
        <li>create multiple or fake accounts, or manipulate referrals;</li>
        <li>
          exploit bugs, or interfere with or attempt to bypass our security or reward logic;
        </li>
        <li>use the app for any unlawful purpose.</li>
      </ul>
      <p className="mb-4 leading-relaxed text-ink-2">
        Violations may result in coin forfeiture, suspension, or permanent termination of your
        account.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        7. Suspension &amp; termination
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We may suspend or terminate your account, and forfeit unredeemed coins, if we reasonably
        believe you have violated these Terms or engaged in fraud or abuse. You may stop using the app
        and request account deletion at any time (see our{" "}
        <Link href="/privacy-policy" className="text-success hover:underline">
          Privacy Policy
        </Link>
        ).
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        8. Intellectual property &amp; trademarks
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        The app and its content are owned by Earning Saathi and protected by law. Gift-card brand
        names, logos and trademarks (such as Amazon, Google Play, Flipkart, Paytm, Myntra and Steam)
        are the property of their respective owners.{" "}
        <strong className="text-ink">
          Earning Saathi and PrizeUp are not affiliated with, endorsed by, or sponsored by these
          brands
        </strong>
        ; references are for identification only.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        9. Not gambling; no purchase necessary
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        PrizeUp is not a gambling, betting, or real-money-gaming service. There is no wagering or
        staking of money, coins cannot be bought, and rewards are gift cards with no cash value.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        10. Disclaimer of warranties
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
        any kind, whether express or implied, including fitness for a particular purpose and
        uninterrupted or error-free operation.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        11. Limitation of liability
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        To the maximum extent permitted by law, Earning Saathi will not be liable for any indirect,
        incidental, or consequential damages, or for any loss of coins, rewards, or data, arising
        from your use of the app.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">12. Governing law</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        These Terms are governed by the laws of India, without regard to conflict-of-laws rules.
        Disputes will be subject to the courts having jurisdiction in India.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        13. Changes to these Terms
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We may update these Terms from time to time. Material changes will be reflected by an updated
        &ldquo;Last updated&rdquo; date. Continued use after changes means you accept the updated
        Terms.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">14. Contact</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Earning Saathi -{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
      </p>
    </main>
  );
}
