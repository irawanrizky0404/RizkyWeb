import { cn } from "@/lib/utils";

const palette = [
  "bg-sodium",
  "bg-phosphor",
  "bg-acid",
  "bg-oxblood",
  "bg-bone",
  "bg-foreground",
  "bg-muted-foreground",
  "bg-sodium",
  "bg-phosphor",
  "bg-bone",
] as const;

interface ColorCodeProps {
  className?: string;
  squareClassName?: string;
  count?: number;
}

export function ColorCode({
  className,
  squareClassName,
  count = 10,
}: ColorCodeProps) {
  return (
    <div className={cn("flex w-full", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-full flex-1",
            palette[i % palette.length],
            squareClassName
          )}
        />
      ))}
    </div>
  );
}
