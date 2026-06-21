import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProjectBySlug } from "@/lib/data";
import { ColorBar } from "@/components/ui/color-bar";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/lib/category-colors";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/works/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [project.cover],
    },
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/works/[slug]">
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <section className="px-6 pt-32 pb-8 md:px-10 md:pt-48 md:pb-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <Link
              href="/works"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-sodium"
            >
              ← Back to Work
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <Reveal delay={0.1}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0",
                      categoryColors[project.category] ?? "bg-bone"
                    )}
                  />
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
                    [ {project.category} — {project.year} ]
                  </p>
                </div>
                <h1 className="mt-4 font-display text-[clamp(2rem,7vw,6rem)] font-bold leading-[0.85] tracking-tighter">
                  {project.title}
                </h1>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10">
        <div className="mx-auto max-w-[1800px]">
          <Reveal delay={0.1}>
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <Image
                src={project.cover}
                alt={project.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <ColorBar className="my-12 md:my-24" />

      <section className="px-6 md:px-10">
        <div className="mx-auto max-w-[1800px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  [ Overview ]
                </p>
              </Reveal>
            </div>

            <div className="md:col-span-9">
              <Reveal delay={0.1}>
                <p className="max-w-2xl font-serif text-[clamp(1.15rem,3vw,2.25rem)] italic leading-relaxed text-bone">
                  {project.summary}
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:mt-8 md:text-base">
                  {project.description}
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="mt-6 flex flex-wrap gap-2 md:mt-8">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                      {tag !== project.tags[project.tags.length - 1] ? " ·" : ""}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="px-6 py-12 md:px-10 md:py-24">
          <div className="mx-auto max-w-[1800px]">
            <Reveal>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground md:mb-8">
                [ Gallery — {project.gallery.length} frames ]
              </p>
            </Reveal>
            <div className="flex flex-col gap-4 md:gap-6">
              {project.gallery.map((image, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`${project.title} — ${i + 1}`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <ColorBar className="mb-12 md:mb-24" />

      <section className="px-6 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
              [ Next Project ]
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href={`/works/${nextProject.slug}`}
              className="group mt-4 flex items-baseline justify-between gap-4 border-b border-border pb-6"
            >
              <h2 className="font-display text-[clamp(1.25rem,5vw,4rem)] font-bold tracking-tighter transition-colors group-hover:text-sodium">
                {nextProject.title}
              </h2>
              <span className="shrink-0 font-mono text-xs text-sodium">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
