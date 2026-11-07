import Link from "next/link";
import Image from "next/image";

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.earningsaathi.prizeup";

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-white/6 bg-black/40">
      <div className="pointer-events-none absolute -top-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

      <div className="mx-auto max-w-[1120px] px-5 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <Image
                src="/images/logo.png"
                alt="Earning Saathi"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-bold text-white">Earning Saathi</span>
                <span className="text-[10px] tracking-wide text-white/40">
                  your earning companion
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40">
              We build free, rewarding mobile apps. Our flagship app PrizeUp
              lets you play, earn coins, and redeem gift cards.
            </p>
          </div>

          {/* App */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
              App
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a
                href="#features"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Features
              </a>
              <a
                href="#screenshots"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Screenshots
              </a>
              <Link
                href="/blog"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Blog
              </Link>
              <a
                href={PLAY_STORE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Google Play
              </a>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
              Company
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a
                href="#about"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                About
              </a>
              <a
                href="mailto:support@earningsaathi.com"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
              Legal
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/privacy-policy"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Terms of Service
              </Link>
              <Link
                href="/how-to-delete"
                className="text-sm text-white/40 transition-colors hover:text-white hover:no-underline"
              >
                Delete Account
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/6 pt-6 text-center text-xs text-white/25 sm:flex-row sm:justify-between sm:text-left">
          <span>
            &copy; {new Date().getFullYear()} Earning Saathi. All rights
            reserved.
          </span>
          <span>
            Not affiliated with Amazon, Google, Flipkart, Paytm, Myntra or
            Steam.
          </span>
        </div>
      </div>
    </footer>
  );
}
