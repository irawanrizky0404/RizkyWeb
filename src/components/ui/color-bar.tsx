import { ColorCode } from "@/components/ui/color-code";
import { cn } from "@/lib/utils";

interface ColorBarProps {
  className?: string;
  height?: string;
}

export function ColorBar({ className, height = "h-px" }: ColorBarProps) {
  return (
    <div className={cn("w-full overflow-hidden", height, className)}>
      <ColorCode />
    </div>
  );
}
