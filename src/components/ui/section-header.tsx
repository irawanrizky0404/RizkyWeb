import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

interface SectionHeaderProps {
  label: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
          [ {label} ]
        </p>
      </Reveal>
      {title && (
        <Reveal delay={0.08}>
          <h2 className="font-display text-[clamp(1.75rem,5vw,4rem)] font-bold leading-[0.85] tracking-tighter">
            {title}
          </h2>
        </Reveal>
      )}
      {description && (
        <Reveal delay={0.15}>
          <p
            className={cn(
              "max-w-md font-serif text-base italic leading-relaxed text-bone/70 md:text-lg",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
