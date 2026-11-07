import type { MetadataRoute } from "next";

const BASE = "https://earningsaathi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/blog", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/how-to-delete", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const blogs = [
    "google-play-redeem-codes-free",
    "best-refer-and-earn-apps-india",
    "is-prizeup-legit-review",
    "earn-free-amazon-gift-cards-india",
    "best-reward-apps-no-investment-2025",
    "earn-gift-cards-playing-games-india",
    "top-free-earning-apps-india-no-deposit",
  ];

  return [
    ...pages.map((p) => ({
      url: `${BASE}${p.url}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...blogs.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
