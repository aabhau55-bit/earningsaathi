import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - Earning Saathi",
  description:
    "Tips, guides and lists about the best reward apps, earning strategies and more from Earning Saathi.",
};

const POSTS = [
  {
    slug: "google-play-redeem-codes-free",
    title: "Google Play Redeem Codes: How to Get Them Free in 2025",
    excerpt:
      "Want free Google Play redeem codes? Here are the legitimate ways to earn Google Play gift cards and credits without spending money.",
    date: "November 11, 2025",
  },
  {
    slug: "best-refer-and-earn-apps-india",
    title: "Best Refer and Earn Apps in India (2025)",
    excerpt:
      "Top refer and earn apps that pay real rewards for inviting friends. No investment needed - start referring and earning today.",
    date: "November 10, 2025",
  },
  {
    slug: "is-prizeup-legit-review",
    title: "Is PrizeUp Legit? Honest Review & How It Works",
    excerpt:
      "An honest review of PrizeUp. Is it legit? Does it actually pay? We break down how it works and whether it is worth your time.",
    date: "November 9, 2025",
  },
  {
    slug: "earn-free-amazon-gift-cards-india",
    title: "How to Earn Free Amazon Gift Cards in India (2025)",
    excerpt:
      "Learn how to earn free Amazon gift cards in India using legitimate reward apps. No investment, no scams - just real methods.",
    date: "November 8, 2025",
  },
  {
    slug: "best-reward-apps-no-investment-2025",
    title: "7 Best Reward Apps That Pay Without Any Investment (2025)",
    excerpt:
      "Looking for apps that let you earn real rewards without spending a single rupee? Here are the top 7 picks that actually pay out.",
    date: "November 7, 2025",
  },
  {
    slug: "earn-gift-cards-playing-games-india",
    title: "How to Earn Gift Cards by Playing Games in India",
    excerpt:
      "A practical guide to turning spare screen time into Amazon, Google Play and Flipkart gift cards using free gaming apps.",
    date: "November 5, 2025",
  },
  {
    slug: "top-free-earning-apps-india-no-deposit",
    title: "Top Free Earning Apps in India That Need Zero Deposit",
    excerpt:
      "Tired of apps that ask you to pay before you earn? These genuinely free apps let you start earning from day one.",
    date: "November 3, 2025",
  },
];

export default function BlogIndex() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Blog</h1>
        <p className="mt-3 text-white/50">
          Guides and lists to help you earn more with free reward apps.
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06] hover:no-underline"
            >
              <time className="text-xs text-white/35">{post.date}</time>
              <h2 className="mt-2 text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {post.excerpt}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-green-400">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
