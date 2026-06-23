import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  postered?: boolean;
}

export function Chip({
  children,
  className,
  variant = "solid",
  postered = false,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.32em] transition-colors",
        variant === "solid" &&
          "border-accent bg-accent text-background",
        variant === "outline" &&
          "border-foreground/25 bg-transparent text-muted-foreground",
        postered && "postered",
        className
      )}
    >
      {children}
    </span>
  );
}