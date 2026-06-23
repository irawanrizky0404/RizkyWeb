import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

interface SectionHeaderProps {
  index?: string;
  label: string;
  title?: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  index,
  label,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Reveal>
        <div className="flex items-baseline gap-4">
          {index && (
            <span className="label text-accent">FAC.{index}</span>
          )}
          <span className="label text-muted-foreground">{label}</span>
          <span className="h-px flex-1 self-center bg-foreground/15" />
        </div>
      </Reveal>
      {title && (
        <Reveal delay={0.08}>
          <h2 className="display text-[clamp(2.5rem,7.5vw,6rem)] text-foreground">
            {title}
          </h2>
        </Reveal>
      )}
      {description && (
        <Reveal delay={0.14}>
          <p className="mt-1 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
