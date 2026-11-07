"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "How it works", href: "#how" },
  { label: "Gift Cards", href: "#rewards" },
  { label: "Blog", href: "/blog" },
];

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.earningsaathi.prizeup";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/8 bg-[#04100b]/85 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image
            src="/images/logo.png"
            alt="Earning Saathi"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-white">Earning Saathi</span>
            <span className="text-[10px] tracking-wide text-white/40">
              your earning companion
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/50 transition-colors duration-200 hover:text-white hover:no-underline"
            >
              {l.label}
            </a>
          ))}
          <a
            href={PLAY_STORE}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(22,163,74,0.5)] hover:no-underline"
          >
            Download Free
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/8 bg-[#04100b]/95 px-5 pb-5 pt-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white hover:no-underline"
              >
                {l.label}
              </a>
            ))}
            <a
              href={PLAY_STORE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all hover:shadow-[0_0_28px_rgba(22,163,74,0.5)] hover:no-underline"
            >
              Download Free
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
