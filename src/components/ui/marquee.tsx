import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

export function Marquee({ children, className, reverse = false }: MarqueeProps) {
  return (
    <div className={cn("marquee-pause overflow-hidden", className)}>
      <div
        className={cn(
          "marquee-track",
          reverse && "marquee-track-rev"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}