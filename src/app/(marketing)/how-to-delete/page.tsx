import Link from "next/link";

export const metadata = {
  title: "Delete Your Account & Data -PrizeUp",
  description:
    "How to delete your PrizeUp account and all associated personal data.",
};

export default function HowToDeletePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-2 text-3xl font-bold text-ink">
        Delete Your Account &amp; Data
      </h1>
      <p className="mb-8 text-sm text-muted">Last updated: 4 June 2026</p>

      <p className="mb-4 leading-relaxed text-ink-2">
        This page explains how to delete your <strong className="text-ink">PrizeUp</strong> account
        (published by <strong className="text-ink">Earning Saathi</strong>) and the personal data
        associated with it. You can request deletion at any time using either method below -no login
        to this website is required.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        Option 1 -Delete in the app
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        This is the fastest way and removes your account immediately:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>
          Open the <strong className="text-ink">PrizeUp</strong> app and sign in.
        </li>
        <li>
          Go to <strong className="text-ink">Profile &rarr; Delete Account</strong>.
        </li>
        <li>Confirm the deletion when prompted.</li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">
        Option 2 -Request by email
      </h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        Email{" "}
        <a
          href="mailto:support@earningsaathi.com?subject=Delete%20my%20account"
          className="text-success hover:underline"
        >
          support@earningsaathi.com
        </a>{" "}
        from the email address registered to your account, with the subject{" "}
        <strong className="text-ink">&ldquo;Delete my account&rdquo;</strong>. We will verify the
        request and process it for you.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">What gets deleted</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        When your request is processed, we permanently delete:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>Your account and Google profile information (name, email);</li>
        <li>Your coin balance and full transaction history;</li>
        <li>Games played, daily check-ins and streak data;</li>
        <li>Referral relationships and redemption history.</li>
      </ul>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">What may be retained</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        We may retain a limited set of records where we are legally required to, or to prevent fraud
        and abuse (for example, basic redemption/transaction records needed for tax, accounting or
        dispute resolution). Such records are kept only as long as required by law and are not used to
        re-create your account.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">How long it takes</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        In-app deletion takes effect immediately. Email requests are verified and completed within{" "}
        <strong className="text-ink">30 days</strong>. Deletion is{" "}
        <strong className="text-ink">irreversible</strong>, and any unredeemed coins are forfeited.
      </p>

      <h2 className="mt-10 mb-3 text-xl font-semibold text-ink">Questions</h2>
      <p className="mb-4 leading-relaxed text-ink-2">
        For anything related to your account or data, contact{" "}
        <a href="mailto:support@earningsaathi.com" className="text-success hover:underline">
          support@earningsaathi.com
        </a>
        . See also our{" "}
        <Link href="/privacy-policy" className="text-success hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
