import { cn } from "@/lib/cn";

export function Sparkline({
  points,
  className,
  width = 112,
  height = 36,
  up,
}: {
  points?: number[] | null;
  className?: string;
  width?: number;
  height?: number;
  up?: boolean;
}) {
  if (!points || points.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("text-ink/15", className)}
        aria-hidden
      >
        <path
          d={`M0 ${height * 0.62} C ${width * 0.25} ${height * 0.62}, ${width * 0.5} ${height * 0.62}, ${width} ${height * 0.62}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 2;
  const coords = points.map((value, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const d = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const positive = up ?? points[points.length - 1] >= points[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn(positive ? "text-up" : "text-down", className)}
      aria-hidden
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}
