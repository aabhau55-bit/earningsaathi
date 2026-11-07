import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Earning Saathi | PrizeUp - Play Games, Earn Coins & Win Gift Cards Free",
  description:
    "Earning Saathi (Coin Saathi) builds free reward apps. PrizeUp lets you play Tic-Tac-Toe, quizzes & games, earn coins and redeem them for Amazon, Google Play, Flipkart, Paytm & more gift cards. 100% free, no investment.",
  keywords: [
    "earning saathi",
    "coin saathi",
    "coin sathi",
    "prizeup",
    "saathi win",
    "saathi rewards",
    "coin saathi real or fake",
    "earn gift cards free",
    "reward app india",
    "free earning app",
  ],
  openGraph: {
    title: "Earning Saathi | PrizeUp - Play Games, Earn Coins & Win Gift Cards",
    description:
      "Earning Saathi builds free reward apps. PrizeUp lets you play games, earn coins, redeem for real gift cards. No investment needed!",
    url: "https://earningsaathi.com/",
    siteName: "Earning Saathi",
    images: [{ url: "/images/feature-graphic.png", width: 512, height: 512 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earning Saathi | PrizeUp - Earn Gift Cards Free",
    description:
      "Play games, earn coins, redeem for Amazon & Google Play gift cards. 100% free!",
    images: ["/images/feature-graphic.png"],
  },
  alternates: {
    canonical: "https://earningsaathi.com/",
  },
};

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.earningsaathi.prizeup";

const SCREENSHOTS = [
  { src: "/images/screenshot-5.png", alt: "Play Fun Games -earn coins playing games" },
  { src: "/images/screenshot-1.png", alt: "Track & Grow Your Rewards -wallet and streaks" },
  { src: "/images/screenshot-2.png", alt: "Discover Fun Games -Tic Tac Toe and more" },
  { src: "/images/screenshot-4.png", alt: "Earn More Every Day -quiz, spin, scratch, refer" },
  { src: "/images/screenshot-3.png", alt: "Invite Friends Unlock Bonuses -referral system" },
];

const FEATURES = [
  {
    icon: "🎮",
    title: "Play Games",
    desc: "Beat the AI in Tic-Tac-Toe on Easy, Medium or Hard. Tougher wins pay more coins.",
    coins: "+10 / +20 / +40",
    color: "from-teal-500/20",
  },
  {
    icon: "❓",
    title: "Daily Quiz",
    desc: "Answer trivia questions daily. Every correct answer earns coins instantly.",
    coins: "+20 / correct",
    color: "from-blue-500/20",
  },
  {
    icon: "☸️",
    title: "Spin the Wheel",
    desc: "One free spin every day. Land on a segment and bank whatever it shows.",
    coins: "up to 250",
    color: "from-lime-500/20",
  },
  {
    icon: "🎟️",
    title: "Scratch Cards",
    desc: "Scratch to reveal hidden coin prizes. A fresh card appears every single day.",
    coins: "up to 250",
    color: "from-pink-500/20",
  },
  {
    icon: "📅",
    title: "Daily Check-in",
    desc: "Open the app each day and claim your bonus. Keep the streak alive for more.",
    coins: "+100 / day",
    color: "from-green-500/20",
  },
  {
    icon: "👥",
    title: "Refer & Earn",
    desc: "Share your invite link. When a friend joins, you both get a generous bonus.",
    coins: "+500 each",
    color: "from-emerald-500/20",
  },
];

const BRANDS = [
  { name: "Amazon", emoji: "🛒" },
  { name: "Google Play", emoji: "▶" },
  { name: "Flipkart", emoji: "🛍" },
  { name: "Paytm", emoji: "💸" },
  { name: "Myntra", emoji: "👗" },
  { name: "Steam", emoji: "🎮" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Earning Saathi",
  alternateName: ["Coin Saathi", "Saathi Rewards"],
  url: "https://earningsaathi.com",
  logo: "https://earningsaathi.com/images/logo.png",
  description:
    "Earning Saathi builds free, rewarding mobile apps. Our flagship app PrizeUp lets you play games, earn coins and redeem gift cards.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@earningsaathi.com",
    contactType: "customer support",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "PrizeUp",
  operatingSystem: "Android",
  applicationCategory: "GameApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    ratingCount: "100",
  },
  installUrl:
    "https://play.google.com/store/apps/details?id=com.earningsaathi.prizeup",
  screenshot: [
    "https://earningsaathi.com/images/screenshot-1.png",
    "https://earningsaathi.com/images/screenshot-2.png",
    "https://earningsaathi.com/images/screenshot-3.png",
    "https://earningsaathi.com/images/screenshot-4.png",
    "https://earningsaathi.com/images/screenshot-5.png",
  ],
  author: {
    "@type": "Organization",
    name: "Earning Saathi",
    url: "https://earningsaathi.com",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scroll-hint {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(8px); opacity: 1; }
        }
      `}</style>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(22,163,74,0.18),transparent_60%)]" />
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08),transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left -Text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300 backdrop-blur-sm">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-green-400"
                  style={{ animation: "pulse-ring 2s ease infinite" }}
                />
                Free on Google Play
              </div>

              {/* Headline */}
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Play Games.
                <br />
                <span
                  className="bg-[linear-gradient(100deg,#22c55e,#4ade80_45%,#16a34a)] bg-[length:200%_auto] bg-clip-text text-transparent"
                  style={{ animation: "gradient-x 4s ease infinite" }}
                >
                  Earn Coins.
                </span>
                <br />
                Redeem Rewards.
              </h1>

              {/* Sub */}
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg lg:mx-0">
                PrizeUp is your free rewards companion -play Tic-Tac-Toe,
                answer quizzes, spin the wheel, and turn spare minutes into{" "}
                <strong className="text-green-400">real gift cards</strong>.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <a
                  href={PLAY_STORE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-4 font-bold text-white shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(22,163,74,0.6)] hover:no-underline"
                >
                  <Image
                    src="/images/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="h-10 w-auto"
                  />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-7 py-4 font-semibold text-white/80 backdrop-blur transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white hover:no-underline"
                >
                  See Features
                  <span className="text-lg">↓</span>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
                {[
                  { value: "6+", label: "Ways to Earn" },
                  { value: "100%", label: "Free Forever" },
                  { value: "6", label: "Gift Card Brands" },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 && (
                      <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                    )}
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-white sm:text-2xl">
                        {s.value}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/40">
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right -Phone screenshots */}
            <div className="relative mt-12 flex justify-center lg:mt-0" aria-hidden="true">
              {/* Background glow */}
              <div className="absolute inset-0 m-auto h-[420px] w-[320px] rounded-[3rem] bg-green-600/15 blur-[60px]" />
              <div className="absolute inset-0 m-auto h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[50px]" />

              {/* Main phone */}
              <div
                className="relative z-10 w-[260px] overflow-hidden rounded-[2rem] border-2 border-white/15 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(22,163,74,0.15)]"
                style={{ animation: "float 6s ease-in-out infinite" }}
              >
                <Image
                  src="/images/screenshot-5.png"
                  alt="PrizeUp app -Play Fun Games"
                  width={526}
                  height={296}
                  className="h-auto w-full"
                  priority
                />
              </div>

              {/* Secondary phone (behind left) */}
              <div
                className="absolute -left-4 top-8 z-0 hidden w-[200px] overflow-hidden rounded-[1.5rem] border border-white/10 opacity-60 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] lg:block"
                style={{ animation: "float-delay 7s ease-in-out infinite", transform: "rotate(-6deg)" }}
              >
                <Image
                  src="/images/screenshot-4.png"
                  alt="PrizeUp -Earn More Every Day"
                  width={526}
                  height={296}
                  className="h-auto w-full"
                />
              </div>

              {/* Secondary phone (behind right) */}
              <div
                className="absolute -right-4 top-12 z-0 hidden w-[200px] overflow-hidden rounded-[1.5rem] border border-white/10 opacity-60 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] lg:block"
                style={{ animation: "float-delay 8s ease-in-out infinite", transform: "rotate(6deg)" }}
              >
                <Image
                  src="/images/screenshot-3.png"
                  alt="PrizeUp -Invite Friends"
                  width={526}
                  height={296}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Brand Marquee ===== */}
      <div className="relative overflow-hidden border-y border-white/6 bg-white/[0.02] py-7">
        <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
          Redeem coins for gift cards from
        </p>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#04100b] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#04100b] to-transparent" />
        <div className="relative">
          <div
            className="flex w-max gap-4"
            style={{ animation: "marquee 20s linear infinite" }}
          >
            {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/60"
              >
                <span className="text-base">{b.emoji}</span> {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Features ===== */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(22,163,74,0.06),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5">
          <SectionHead
            title="6 Ways to Earn Every Day"
            subtitle="No purchases, no catch -just fun ways to stack up coins."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
              >
                <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/0 to-transparent transition-all duration-300 group-hover:via-green-400/50" />
                <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl ring-1 ring-white/10">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {f.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-green-400 ring-1 ring-green-500/20">
                    🪙 {f.coins}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Screenshots ===== */}
      <section id="screenshots" className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-green-900/5 via-transparent to-green-900/5" />

        <div className="relative mx-auto max-w-6xl px-5">
          <SectionHead
            title="See PrizeUp in Action"
            subtitle="Real screenshots from the app -what you see is what you get."
          />

          {/* Scrollable gallery */}
          <div className="relative mt-14">
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {SCREENSHOTS.map((s) => (
                <div
                  key={s.src}
                  className="group relative flex-shrink-0 snap-center"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 transition-all duration-300 group-hover:border-green-500/30 group-hover:shadow-[0_0_30px_rgba(22,163,74,0.15)]">
                    <Image
                      src={s.src}
                      alt={s.alt}
                      width={280}
                      height={560}
                      className="h-[480px] w-auto rounded-xl object-cover sm:h-[540px]"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Scroll hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30 sm:hidden">
              <span style={{ animation: "scroll-hint 2s ease infinite" }}>→</span>
              Swipe to see more
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it Works ===== */}
      <section id="how" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHead
            title="Get Started in 3 Steps"
            subtitle="From install to gift card in under a minute."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                num: "01",
                icon: "📲",
                title: "Download PrizeUp",
                desc: "Grab it free from Google Play. Sign in with Google -zero cost, ever.",
              },
              {
                num: "02",
                icon: "🎮",
                title: "Play & Earn Coins",
                desc: "Games, quizzes, spins, scratch cards, daily check-ins, and referrals all stack coins.",
              },
              {
                num: "03",
                icon: "🎁",
                title: "Redeem Gift Cards",
                desc: "Cash your coins for Amazon, Google Play, Flipkart, Paytm, Myntra & Steam cards.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
              >
                <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/0 to-transparent transition-all duration-300 group-hover:via-green-400/50" />

                {/* Step number */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 ring-1 ring-green-500/20">
                  <span className="text-lg font-extrabold text-green-400">
                    {step.num}
                  </span>
                </div>
                <div className="mt-5 text-4xl">{step.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {step.desc}
                </p>

                {/* Connector arrow (between cards) */}
                {i < 2 && (
                  <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-white/15 sm:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Gift Cards / Rewards ===== */}
      <section id="rewards" className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-green-900/5 via-transparent to-green-900/5" />

        <div className="relative mx-auto max-w-5xl px-5">
          <SectionHead
            title="Real Gift Cards, Real Brands"
            subtitle="No cash, no gambling -just gift cards from brands you love."
          />

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((b) => (
              <div
                key={b.name}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] py-6 transition-all duration-300 hover:border-green-500/25 hover:bg-white/[0.06]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-2xl ring-1 ring-white/10 transition-all group-hover:ring-green-500/30">
                  {b.emoji}
                </span>
                <span className="text-sm font-medium text-white/60 group-hover:text-white/80">
                  {b.name}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            Coins have no cash value and are redeemable only for gift cards and
            vouchers in the app.
          </p>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHead
            title="Why Earning Saathi?"
            subtitle={
              <>
                &ldquo;Saathi&rdquo; means companion. We build free, rewarding mobile
                apps -PrizeUp is our flagship. Your companion in earning a
                little extra, the easy way.
              </>
            }
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🎁",
                title: "Genuinely rewarding",
                desc: "Real gift cards for real effort -no gimmicks, no pay-to-win, no hidden costs.",
              },
              {
                icon: "🛡️",
                title: "Safe & fair",
                desc: "Rewards are credited securely on our servers, with fraud checks to keep things fair.",
              },
              {
                icon: "⚡",
                title: "Simple & fun",
                desc: "Clean, fast app you actually enjoy opening -earning shouldn't feel like a chore.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
              >
                <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/0 to-transparent transition-all duration-300 group-hover:via-green-400/50" />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-4xl ring-1 ring-white/10">
                  {v.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-1">
            <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />

            <div className="relative rounded-[1.75rem] bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-16 text-center sm:py-20">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(22,163,74,0.12),transparent_60%)]" />

              <Image
                src="/images/icon.png"
                alt="PrizeUp"
                width={80}
                height={80}
                className="relative mx-auto rounded-2xl shadow-[0_0_40px_rgba(22,163,74,0.3)]"
              />

              <h2 className="relative mt-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Start Earning Today
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-white/50">
                Download PrizeUp for free and turn your spare minutes into real
                gift cards. No purchases, no catch.
              </p>

              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={PLAY_STORE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all hover:shadow-[0_0_50px_rgba(22,163,74,0.6)] hover:no-underline"
                >
                  <Image
                    src="/images/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="h-10 w-auto"
                  />
                </a>
                <a
                  href="mailto:support@earningsaathi.com"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-8 py-4 font-semibold text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white hover:no-underline"
                >
                  ✉ Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  title,
  subtitle,
}: {
  title: string;
  subtitle: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
      <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
        {subtitle}
      </p>
    </div>
  );
}
