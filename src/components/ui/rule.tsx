import { cn } from "@/lib/utils";

interface RuleProps {
  className?: string;
  variant?: "thin" | "thick" | "dashed" | "double";
}

export function Rule({ className, variant = "thin" }: RuleProps) {
  return (
    <div
      className={cn(
        "w-full",
        variant === "thin" && "h-px bg-border",
        variant === "thick" && "h-0.5 bg-foreground",
        variant === "dashed" && "h-px border-t border-dashed border-foreground/30",
        variant === "double" && "h-2 border-y border-foreground/30",
        className
      )}
      aria-hidden
    />
  );
}