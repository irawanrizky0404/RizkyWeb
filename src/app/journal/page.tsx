import type { Metadata } from "next";
import Link from "next/link";
import { journalPosts } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Journal",
  description: "Essays and notes on design, process, and visual culture.",
};

export default function JournalPage() {
  return (
    <section className="px-6 pt-32 pb-16 md:px-10 md:pt-48 md:pb-24">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Writing"
          title="Journal"
          description="Essays and notes on design, process, and the visual culture that shapes my work."
        />

        <ColorBar className="my-16 md:my-24" />

        <div className="border-t border-border">
          {journalPosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.05}>
              <Link
                href={`/journal/${post.slug}`}
                className="group flex flex-col gap-2 border-b border-border py-6 md:flex-row md:items-baseline md:gap-8 md:py-8"
              >
                <span className="font-mono text-xs text-sodium md:w-32 md:shrink-0">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-medium tracking-tight transition-colors group-hover:text-sodium md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-1 max-w-lg text-pretty text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
