import { services } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/lib/category-colors";

export function Skills() {
  return (
    <section className="px-6 py-20 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Skills"
          title="Capabilities"
          description="A multidisciplinary practice spanning 3D, motion, illustration, and design."
        />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10">
          {services.map((service, i) => (
            <Reveal key={service.category} delay={(i % 2) * 0.1}>
              <div className="border-t border-border pt-8">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-3 w-3 shrink-0",
                      categoryColors[service.category] ?? "bg-bone"
                    )}
                  />
                  <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {service.category}
                  </h3>
                </div>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.items.map((item) => (
                    <span
                      key={item}
                      className="border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-sodium hover:text-sodium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
