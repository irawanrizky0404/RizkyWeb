import { cn } from "@/lib/utils";

interface WaveformProps {
  lines?: number;
  amplitude?: number;
  className?: string;
}

export function Waveform({
  lines = 70,
  amplitude = 36,
  className,
}: WaveformProps) {
  const paths: string[] = [];

  for (let i = 0; i < lines; i++) {
    const yc = (i / (lines - 1)) * 100;
    const distFromCenter =
      Math.abs(i - (lines - 1) / 2) / ((lines - 1) / 2);
    const peakAmp = (1 - distFromCenter ** 2) * amplitude;

    const points: string[] = [];
    for (let x = 0; x <= 100; x += 1) {
      const localAmp = peakAmp * Math.exp(-((x - 50) ** 2) / 220);
      const noise = Math.sin(x * 0.55 + i * 0.35) * 1.15;
      points.push(`${x},${yc + localAmp + noise}`);
    }
    paths.push(`M ${points.join(" L ")}`);
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.15}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}