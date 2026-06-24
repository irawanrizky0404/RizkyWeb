"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/data";
import { Magnetic } from "@/components/ui/magnetic";
import { AmbientSound } from "@/components/ui/ambient-sound";
import { useDesign } from "@/lib/design-context";

const TICKER_ITEMS = [
  "Available for Work",
  "Indonesia",
  "UTC +7",
  "Multidisciplinary Visual Artist",
  "Est. 2017",
  "3D · Motion · Illustration",
  "FAC.001",
  "Open for Collaboration",
];

const TICKER_TEXT = Array(4).fill(TICKER_ITEMS).flat()
  .map((t) => `${t} ·`).join("  ");

export function Footer() {
  const pathname = usePathname();
  const design = useDesign();
  const year = new Date().getFullYear();

  const email = design?.site?.email || siteConfig.email;
  const name = design?.site?.name || siteConfig.name || "Rizky Irawan";
  const location = design?.site?.location || "Indonesia";
  const established = design?.site?.established || "2017";
  const availableText = design?.hero?.availableText || "Open for Work";

  const socials = [
    { label: "Instagram", href: design?.social?.instagram || siteConfig.social.instagram },
    { label: "Behance",   href: design?.social?.behance   || siteConfig.social.behance   },
    { label: "LinkedIn",  href: design?.social?.linkedin  || siteConfig.social.linkedin  },
  ];

  // Split email into user/domain for big display
  const [emailUser, emailDomain] = email.includes("@") ? email.split("@") : [email, ""];

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative overflow-hidden border-t-2 border-signal bg-black">

      {/* Ghost FAC */}
      <span
        className="dis pointer-events-none absolute -bottom-6 left-0 select-none leading-none text-white/[0.022]"
        style={{ fontSize: "50vw" }}
        aria-hidden
      >
        FAC
      </span>

      {/* ── Email ─────────────────────────────────────────────────── */}
      <div className="relative px-5 pt-14 pb-0 md:px-8 md:pt-20">
        <div className="flex items-center justify-between mb-6">
          <p className="lab text-white/25" style={{ fontSize: "0.55rem" }}>Open for transmission</p>
          <span className="lab flex items-center gap-2 text-signal" style={{ fontSize: "0.55rem" }}>
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-signal" style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }} />
            {availableText}
          </span>
          <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}`}</style>
        </div>
        <Magnetic strength={0.18}>
          <a href={`mailto:${email}`} className="group block">
            <span
              className="dis block text-white transition-colors duration-200 group-hover:text-signal"
              style={{ fontSize: "clamp(1.8rem, 5.5vw, 9rem)", lineHeight: 0.88 }}
            >
              {emailUser}
            </span>
            {emailDomain && (
              <span
                className="dis block text-white/30 transition-colors duration-200 group-hover:text-white/50"
                style={{ fontSize: "clamp(1.8rem, 5.5vw, 9rem)", lineHeight: 0.88 }}
              >
                @{emailDomain}
              </span>
            )}
          </a>
        </Magnetic>
        <div className="mt-8 flex items-center gap-6 pb-10">
          <Link
            href="/works"
            className="group lab inline-flex items-center gap-3 border border-rule px-5 py-3 text-white/50 transition-colors hover:border-signal hover:text-signal"
            style={{ fontSize: "0.6rem" }}
          >
            View All Works
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/contact"
            className="lab text-white/30 hover:text-white transition-colors"
            style={{ fontSize: "0.6rem" }}
          >
            Start a project →
          </Link>
        </div>
      </div>

      {/* ── Bottom strip: socials + copyright ─────────────────────── */}
      <div className="relative border-t border-rule px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8">
        {/* Socials */}
        <div className="flex items-center gap-5 shrink-0">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="lab text-white/30 transition-colors hover:text-white"
              style={{ fontSize: "0.58rem" }}
            >
              {s.label}
            </a>
          ))}
        </div>
        {/* Status + Ambient Sound */}
        <div className="flex items-center justify-between md:justify-start gap-6">
          <AmbientSound />
          <span className="lab text-signal shrink-0" style={{ fontSize: "0.58rem" }}>{availableText}</span>
        </div>
      </div>

      {/* ── Ticker ────────────────────────────────────────────────── */}
      <div className="relative border-t border-rule overflow-hidden py-2" style={{ borderColor: "rgba(34,34,32,1)" }}>
        <div
          className="whitespace-nowrap"
          style={{
            display: "inline-block",
            animation: "ticker 28s linear infinite",
            willChange: "transform",
          }}
        >
          <span className="lab text-white/15" style={{ fontSize: "0.52rem", letterSpacing: "0.18em" }}>
            {TICKER_TEXT}
          </span>
        </div>
        <style>{`
          @keyframes ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── Copyright ─────────────────────────────────────────────── */}
      <div className="relative border-t border-rule px-5 py-3 md:px-8">
        <span className="lab text-white/15" style={{ fontSize: "0.55rem" }}>
          © {year} {name} · {location} · Est. {established}
        </span>
      </div>
    </footer>
  );
}
