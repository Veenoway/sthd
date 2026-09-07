"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getAge } from "@/lib/format";

export function Timestamp({
  iso,
  ms,
  className,
}: {
  iso?: string | null;
  ms?: number | null;
  className?: string;
}) {
  const dateTime =
    iso && /^\d{4}-\d{2}-\d{2}/.test(iso)
      ? iso
      : ms != null && Number.isFinite(ms)
        ? new Date(ms).toISOString()
        : "";
  const [label, setLabel] = useState("—");

  useEffect(() => {
    setLabel(getAge(iso, ms)?.label ?? "—");
  }, [iso, ms]);

  if (!dateTime && iso == null && ms == null) {
    return <span className={cn("font-mono text-[12px] text-dim", className)}>—</span>;
  }

  return (
    <time
      dateTime={dateTime || undefined}
      title={label === "—" ? undefined : label}
      suppressHydrationWarning
      className={cn(
        "inline-flex items-baseline gap-1.5 font-mono text-[12px] tabular-nums tracking-tight text-dim",
        className,
      )}
    >
      {label}
    </time>
  );
}
