import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { getWorks, buildMetadata } from "@/lib/store";
import { Reveal } from "@/components/ui/reveal";
import { ReadingProgress } from "@/components/ui/reading-progress";

const GalleryLightbox = nextDynamic(() => import("@/components/works/gallery-lightbox").then((m) => m.GalleryLightbox));
const ParallaxHero = nextDynamic(() => import("@/components/works/parallax-hero").then((m) => m.ParallaxHero));

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const works = await getWorks();
  const project = works.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return buildMetadata({
    title: project.title,
    description: project.summary,
    image: project.cover,
    type: "article",
  });
}

export default async function PersonalProjectDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const works = await getWorks();
  const personalWorks = works.filter((p) => p.type === "personal");
  const project = personalWorks.find((p) => p.slug === slug);
  if (!project) notFound();

  const currentIndex = personalWorks.findIndex((p) => p.slug === slug);
  const nextProject = personalWorks[(currentIndex + 1) % personalWorks.length];

  return (
    <article className="min-h-screen">
      <ReadingProgress />

      {/* ── HERO — full-bleed cover ──────────────────────────────── */}
      <div className="relative h-[70svh] min-h-[420px] overflow-hidden bg-black">
        <ParallaxHero src={project.cover} alt={project.title} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--black) 20%, transparent) 0%, transparent 40%, color-mix(in srgb, var(--black) 85%, transparent) 100%)" }} />

        {/* Back nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-24 pb-5 md:px-12 md:pt-32">
          <Link href="/personal-works" className="lab text-white/50 hover:text-white transition-colors" style={{ fontSize: "0.58rem" }}>
            ← Personal Works
          </Link>
          <span className="lab text-white/25" style={{ fontSize: "0.52rem" }}>
            {String(currentIndex + 1).padStart(2, "0")} / {String(personalWorks.length).padStart(2, "0")}
          </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 md:px-12 md:pb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="fac" style={{ fontSize: "0.5rem" }}>{project.category}</span>
            <span className="text-white/20">·</span>
            <span className="lab text-white/40" style={{ fontSize: "0.52rem" }}>{project.year}</span>
            {project.featured && (
              <>
                <span className="text-white/20">·</span>
                <span className="fac" style={{ fontSize: "0.5rem" }}>Featured</span>
              </>
            )}
          </div>
          <h1 className="dis text-white" style={{ fontSize: "clamp(2.5rem, 8vw, 10rem)", lineHeight: 0.88 }}>
            {project.title}
          </h1>
        </div>
      </div>

      {/* ── SPLIT LAYOUT ─────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[400px_1fr]">
          
          {/* Sticky Sidebar (Left) */}
          <div className="border-b border-rule md:border-b-0 md:border-r border-rule">
            <div className="sticky top-16 flex flex-col md:min-h-[calc(100vh-4rem)] p-5 md:p-8 lg:p-12">
              
              <div className="flex-1">
                <Reveal>
                  <p className="lab text-signal/70 mb-8" style={{ fontSize: "0.55rem" }}>[ Project Details ]</p>
                </Reveal>

                <div className="space-y-6">
                  {[
                    { label: "Client", value: project.client },
                    { label: "Category", value: project.category },
                    { label: "Year", value: String(project.year) },
                  ].map(({ label, value }, i) => value ? (
                    <Reveal key={label} delay={i * 0.1}>
                      <div>
                        <p className="lab text-white/25 mb-1" style={{ fontSize: "0.48rem" }}>{label}</p>
                        <p className="lab text-white" style={{ fontSize: "0.7rem" }}>{value}</p>
                      </div>
                    </Reveal>
                  ) : null)}

                  {project.tags.length > 0 && (
                    <Reveal delay={0.3}>
                      <div>
                        <p className="lab text-white/25 mb-3" style={{ fontSize: "0.48rem" }}>Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span key={tag} className="lab text-white/40 border border-rule px-2 py-1 hover:border-signal/50 hover:text-signal transition-colors" style={{ fontSize: "0.5rem" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  )}

                  {project.url && (
                    <Reveal delay={0.4}>
                      <div>
                        <p className="lab text-white/25 mb-1" style={{ fontSize: "0.48rem" }}>Live</p>
                        <a href={project.url} target="_blank" rel="noopener noreferrer"
                          className="lab text-signal hover:text-white transition-colors" style={{ fontSize: "0.7rem" }}>
                          View ↗
                        </a>
                      </div>
                    </Reveal>
                  )}
                </div>
              </div>

              <Reveal delay={0.5}>
                <div className="mt-12 pt-8 border-t border-rule/50">
                  <p className="lab text-white/25 mb-2" style={{ fontSize: "0.5rem" }}>Index</p>
                  <p className="dis text-white/20" style={{ fontSize: "clamp(4rem, 8vw, 6rem)", lineHeight: 0.85 }}>
                    {String(currentIndex + 1).padStart(2, "0")}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Scrolling Content (Right) */}
          <div className="flex flex-col">
            
            {/* Description Block */}
            <div className="p-5 py-12 md:p-12 lg:p-16 lg:py-24 border-b border-rule bg-black relative z-10">
              <Reveal>
                <p className="dis text-white mb-8" style={{ fontSize: "clamp(1.4rem, 3.5vw, 3.2rem)", lineHeight: 0.95 }}>
                  {project.summary}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="h-px w-12 bg-signal/40 mb-8" />
                <p className="text-sm md:text-base leading-loose text-white/50 max-w-2xl">
                  {project.description}
                </p>
              </Reveal>
              
              {/* Video Support (if added to data) */}
              {project.videoUrl && (
                <Reveal delay={0.2}>
                  <div className="mt-12 aspect-video w-full bg-dim/50 border border-rule overflow-hidden">
                    <iframe 
                      src={project.videoUrl} 
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Reveal>
              )}
            </div>

            {/* Gallery Block */}
            {project.gallery.length > 0 && (
              <div className="flex-1 bg-black">
                <div className="border-b border-rule px-5 py-3 md:px-12 flex items-center justify-between bg-black/80 backdrop-blur sticky top-16 z-20">
                  <span className="fac">Gallery</span>
                  <span className="lab text-white/30" style={{ fontSize: "0.58rem" }}>{project.gallery.length} frame{project.gallery.length > 1 ? "s" : ""}</span>
                </div>
                <GalleryLightbox images={project.gallery} projectTitle={project.title} />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── NEXT PROJECT — full bleed ────────────────────────────── */}
      <div className="relative overflow-hidden bg-black" style={{ minHeight: "340px" }}>
        {/* Background cover image */}
        <div className="absolute inset-0">
          <Image
            src={nextProject.cover}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: "grayscale(1) contrast(1.1) brightness(0.35)", mixBlendMode: "screen" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--black) 92%, transparent) 0%, color-mix(in srgb, var(--black) 60%, transparent) 60%, color-mix(in srgb, var(--black) 40%, transparent) 100%)" }} />
        </div>

        {/* Top rule */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-signal" />

        <Link
          href={`/personal-works/${nextProject.slug}`}
          className="group relative flex h-full flex-col justify-between px-5 py-10 md:px-12 md:py-14"
          style={{ minHeight: "340px" }}
        >
          <div className="flex items-center justify-between">
            <span className="lab text-white/30" style={{ fontSize: "0.55rem" }}>Next Project</span>
            <span className="lab text-white/20" style={{ fontSize: "0.52rem" }}>{nextProject.category} · {nextProject.year}</span>
          </div>

          <div>
            <p className="dis text-white/40 mb-2 transition-colors duration-300 group-hover:text-white/60" style={{ fontSize: "clamp(0.7rem, 2vw, 1.2rem)", lineHeight: 1 }}>
              Up next —
            </p>
            <h2
              className="dis text-white transition-colors duration-300 group-hover:text-signal"
              style={{ fontSize: "clamp(2.5rem, 9vw, 12rem)", lineHeight: 0.85 }}
            >
              {nextProject.title}
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-signal/40 transition-all duration-500 group-hover:w-16" />
              <span className="lab text-signal transition-transform duration-300 group-hover:translate-x-1" style={{ fontSize: "0.6rem" }}>
                View project →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
