import type { Metadata } from "next";
import Link from "next/link";
import { getJournal } from "@/lib/store";
import { buildMetadata } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Journal",
    description: "Essays and notes on design, process, and visual culture.",
  });
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function JournalPage() {
  const posts = await getJournal(false);
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <span className="fac">FAC.J — Journal</span>
        <MaskReveal delay={0.15}>
          <h1 className="dis text-white mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 16rem)", lineHeight: 0.88 }}>
            Writing
          </h1>
        </MaskReveal>
        <p className="lab text-white/40 mt-5 max-w-xl" style={{ fontSize: "0.7rem" }}>
          Essays and notes on design, process, and the visual culture that shapes the work.
        </p>
      </div>

      {/* ── FEATURED POST ───────────────────────────────────────────── */}
      {featured && (
        <section className="border-t border-rule">
          <div className="border-b border-rule px-5 py-3 md:px-12">
            <span className="fac">Latest</span>
          </div>
          <Reveal>
            <Link
              href={`/journal/${featured.slug}`}
              className="group block border-b border-rule px-5 py-10 transition-colors hover:bg-white/[0.03] md:px-12 md:py-14"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="lab text-signal" style={{ fontSize: "0.55rem" }}>
                      {new Date(featured.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="lab text-white/20" style={{ fontSize: "0.5rem" }}>
                      {readingTime(featured.content ?? featured.excerpt)} min read
                    </span>
                  </div>
                  <h2
                    className="dis text-white transition-colors group-hover:text-signal"
                    style={{ fontSize: "clamp(2rem, 6vw, 7rem)", lineHeight: 0.88 }}
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-white/50 max-w-2xl">
                    {featured.excerpt}
                  </p>
                  {featured.tags && featured.tags.length > 0 && (
                    <div className="mt-5 flex gap-2 flex-wrap">
                      {featured.tags.map((tag) => (
                        <span key={tag} className="lab text-white/20 border border-rule px-2 py-[2px]" style={{ fontSize: "0.48rem" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="lab text-white/20 transition-all group-hover:translate-x-1 group-hover:text-signal shrink-0" style={{ fontSize: "2rem" }}>→</span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ── ALL POSTS ───────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="border-t border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3 md:px-12">
            <span className="fac">Archive</span>
            <span className="lab text-white/30" style={{ fontSize: "0.6rem" }}>{rest.length} more</span>
          </div>

          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.04}>
              <Link
                href={`/journal/${post.slug}`}
                className="group flex flex-col gap-3 border-b border-rule px-5 py-7 transition-colors hover:bg-white/[0.03] md:flex-row md:items-baseline md:gap-8 md:px-12 md:py-8"
              >
                <span className="lab text-signal w-7 shrink-0" style={{ fontSize: "0.58rem" }}>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="lab text-white/25 shrink-0 md:w-36" style={{ fontSize: "0.6rem" }}>
                  {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="dis text-white transition-colors group-hover:text-signal" style={{ fontSize: "clamp(1.3rem, 4vw, 3.5rem)", lineHeight: 0.88 }}>
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/40 max-w-lg">{post.excerpt}</p>
                  <div className="mt-3 flex items-center gap-4 flex-wrap">
                    {post.tags?.length > 0 && post.tags.map((tag) => (
                      <span key={tag} className="lab text-white/20 border border-rule px-2 py-[2px]" style={{ fontSize: "0.5rem" }}>{tag}</span>
                    ))}
                    <span className="lab text-white/15" style={{ fontSize: "0.5rem" }}>
                      {readingTime(post.content ?? post.excerpt)} min read
                    </span>
                  </div>
                </div>
                <span className="lab text-transparent transition-all duration-150 group-hover:translate-x-1 group-hover:text-signal shrink-0">→</span>
              </Link>
            </Reveal>
          ))}
        </section>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
      {posts.length === 0 && (
        <section className="border-t border-rule px-5 py-20 md:px-12 text-center">
          <p className="dis text-white/20" style={{ fontSize: "clamp(1.5rem, 5vw, 4rem)" }}>No entries yet.</p>
          <p className="lab text-white/15 mt-4" style={{ fontSize: "0.6rem" }}>Writing is incoming — signal pending.</p>
        </section>
      )}
    </>
  );
}
