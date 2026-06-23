import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournal, buildMetadata } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/mask-reveal";
import { ReadingProgress } from "@/components/ui/reading-progress";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const posts = await getJournal();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    type: "article",
    publishedTime: post.date,
    tags: post.tags,
  });
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function JournalPostPage(props: PageProps) {
  const { slug } = await props.params;
  const posts = await getJournal();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n").filter(Boolean);
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const mins = readingTime(post.content);

  return (
    <article>
      <ReadingProgress />

      {/* ── PAGE HEADER ───────────────────────────────────────────── */}
      <div className="border-t-2 border-signal px-5 pt-24 pb-10 md:px-12 md:pt-32 md:pb-14">
        <Link href="/journal" className="lab text-white/35 hover:text-white transition-colors" style={{ fontSize: "0.6rem" }}>
          ← Journal
        </Link>

        <div className="mt-8 flex items-center gap-4">
          <span className="fac" style={{ fontSize: "0.52rem" }}>Writing</span>
          <div className="h-px flex-1 bg-rule" />
          <span className="lab text-white/25" style={{ fontSize: "0.54rem" }}>{date}</span>
          <span className="lab text-white/15" style={{ fontSize: "0.52rem" }}>{mins} min read</span>
        </div>

        <MaskReveal delay={0.12}>
          <h1 className="dis text-white mt-4" style={{ fontSize: "clamp(2.4rem, 8vw, 11rem)", lineHeight: 0.88 }}>
            {post.title}
          </h1>
        </MaskReveal>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="lab text-white/25 border border-rule px-2 py-[2px]" style={{ fontSize: "0.5rem" }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── EXCERPT / PULL QUOTE ──────────────────────────────────── */}
      <Reveal>
        <div className="border-t border-rule px-5 py-10 md:px-12 md:py-14">
          <p className="dis text-white/65" style={{ fontSize: "clamp(1.3rem, 3.5vw, 3rem)", lineHeight: 0.92, maxWidth: "28ch" }}>
            {post.excerpt}
          </p>
          <div className="mt-6 h-px w-10 bg-signal/40" />
        </div>
      </Reveal>

      {/* ── ARTICLE BODY ──────────────────────────────────────────── */}
      <div className="border-t border-rule px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[68ch] space-y-8">
          {paragraphs.map((para, i) => (
            <Reveal key={i} delay={Math.min(i * 0.03, 0.2)}>
              <p
                className={
                  i === 0
                    ? "text-[1.15rem] leading-[1.85] text-white/70 md:text-[1.25rem]"
                    : "text-[1rem] leading-[1.85] text-white/45 md:text-[1.1rem]"
                }
                style={i === 0 ? {
                  // Drop cap on first paragraph
                  paddingTop: "0.1em",
                } : undefined}
              >
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <Reveal>
        <div className="border-t-2 border-signal px-5 py-10 md:px-12 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="lab text-white/25 mb-2" style={{ fontSize: "0.55rem" }}>End of entry</p>
              <p className="dis text-white/50" style={{ fontSize: "clamp(1.2rem, 3vw, 3rem)", lineHeight: 0.9 }}>
                More in the archive →
              </p>
            </div>
            <Link
              href="/journal"
              className="lab inline-flex items-center gap-3 border border-rule px-5 py-3 text-white/40 transition-colors hover:border-signal hover:text-signal self-start"
              style={{ fontSize: "0.6rem" }}
            >
              ← Back to Journal
            </Link>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
