"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard can be blocked without document focus */
        }
      }}
      className={cn(
        "text-sm font-medium",
        className ?? "text-muted hover:text-ink",
      )}
    >
      {done ? "Copied" : label}
    </button>
  );
}
