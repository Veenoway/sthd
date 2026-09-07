"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { filebaseUrl, ipfsCid, localImagePath, pinataUrl } from "@/lib/media";

function gatewayWait(url: string) {
  if (url.includes("filebase.io")) return 2500;
  if (url.includes("pinata.cloud")) return 8000;
  return 4000;
}

export function TokenAvatar({
  src,
  fallbackSrc,
  symbol,
  size = 40,
  fill = false,
  priority = false,
  className,
}: {
  src?: string | null;
  fallbackSrc?: string | null;
  symbol: string;
  size?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const sources = useMemo(() => {
    const cid = ipfsCid(src) ?? ipfsCid(fallbackSrc);
    const extras = cid ? [filebaseUrl(cid), pinataUrl(cid), localImagePath(cid)] : [];
    return [...new Set([src, fallbackSrc, ...extras].filter((value): value is string => Boolean(value)))];
  }, [src, fallbackSrc]);
  const sourceKey = sources.join("|");
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const current = sources[index] ?? null;
  const initials = symbol.replace(/\$/g, "").slice(0, 2).toUpperCase();
  const box = fill ? undefined : { width: size, height: size };

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
  }, [sourceKey]);

  useEffect(() => {
    if (!current || loaded || index + 1 >= sources.length) return;
    const next = sources[index + 1];
    const warm =
      current.includes("filebase.io") && next
        ? window.setTimeout(() => {
            const probe = new Image();
            probe.referrerPolicy = "no-referrer";
            probe.src = next;
          }, 400)
        : null;
    const timer = window.setTimeout(() => {
      setIndex((value) => (value + 1 < sources.length ? value + 1 : value));
    }, gatewayWait(current));
    return () => {
      window.clearTimeout(timer);
      if (warm) window.clearTimeout(warm);
    };
  }, [current, loaded, index, sources]);

  function advance() {
    setLoaded(false);
    setIndex((value) => value + 1);
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-card-2",
        fill && "h-full w-full rounded-none",
        className,
      )}
      style={box}
    >
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold text-muted"
        style={{ fontSize: fill ? "2rem" : size * 0.32 }}
        aria-hidden
      >
        {initials}
      </span>
      {current ? (
        // External CDNs are inconsistent with Next image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt={`$${symbol}`}
          width={fill ? undefined : size}
          height={fill ? undefined : size}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          referrerPolicy="no-referrer"
          className={cn(
            "relative z-[1] object-cover",
            fill ? "absolute inset-0 block h-full w-full" : "block h-full w-full",
            !loaded && "opacity-0",
          )}
          ref={(node) => {
            if (!node?.complete || node.naturalWidth === 0) return;
            queueMicrotask(() => setLoaded(true));
          }}
          onLoad={() => setLoaded(true)}
          onError={advance}
        />
      ) : null}
    </div>
  );
}
