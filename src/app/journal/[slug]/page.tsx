import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { journalPosts, getPostBySlug } from "@/lib/data";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";

export function generateStaticParams() {
  return journalPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/journal/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function JournalPostPage(
  props: PageProps<"/journal/[slug]">
) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");

  return (
    <article className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <Reveal>
          <Link
            href="/journal"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-sodium"
          >
            ← Back to Journal
          </Link>
        </Reveal>

        <div className="mt-12 max-w-2xl">
          <Reveal delay={0.1}>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
              [ {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })} ]
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <h1 className="mt-4 font-display text-[clamp(2rem,6vw,5rem)] font-bold leading-[0.85] tracking-tighter">
              {post.title}
            </h1>
          </Reveal>
        </div>

        <ColorBar className="my-16 md:my-24" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-3" />
          <div className="max-w-2xl md:col-span-9">
            <div className="space-y-6">
              {paragraphs.map((para, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <p
                    className={
                      i === 0
                        ? "font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] italic leading-relaxed text-bone"
                        : "text-pretty text-base leading-relaxed text-muted-foreground"
                    }
                  >
                    {para}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
