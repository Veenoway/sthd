"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MarketChart } from "@/components/MarketChart";
import { cn } from "@/lib/cn";
import { formatPct, formatPrice, formatUsd } from "@/lib/format";
import {
  CHART_RANGES,
  type Candle,
  type ChartRange,
  type TokenMarket,
  type TokenTape,
} from "@/lib/market";

function rangeChange(candles: Candle[], hoverPrice: number | null) {
  if (candles.length < 2) return null;
  const first = candles[0]?.close;
  const last = hoverPrice ?? candles[candles.length - 1]?.close;
  if (first == null || last == null || !(first > 0)) return null;
  return ((last - first) / first) * 100;
}

function tapeTime(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PriceChart({
  chain,
  address,
  symbol,
  initial,
}: {
  chain: string;
  address: string;
  symbol: string;
  initial: TokenTape | null;
}) {
  const [range, setRange] = useState<ChartRange>("1d");
  const [market, setMarket] = useState<TokenMarket | null>(initial?.market ?? null);
  const [candles, setCandles] = useState<Candle[]>(initial?.candles ?? []);
  const [pending, setPending] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const seed = useRef(initial);

  useEffect(() => {
    seed.current = initial;
    setMarket(initial?.market ?? null);
    setCandles(initial?.candles ?? []);
    setHoverPrice(null);
    setHoverTime(null);
    setRange("1d");
  }, [address, chain, initial]);

  useEffect(() => {
    if (range === "1d") {
      const taped = seed.current;
      if (taped?.candles.length) setCandles(taped.candles);
      if (taped?.market) setMarket(taped.market);
      setPending(false);
      return;
    }
    let cancelled = false;
    setPending(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/chart?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address)}&range=${range}`,
        );
        const data = (await res.json()) as TokenTape;
        if (cancelled) return;
        if (data.market) setMarket(data.market);
        if (Array.isArray(data.candles)) setCandles(data.candles);
      } catch {
        /* keep SSR tape */
      } finally {
        if (!cancelled) setPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, chain, range]);

  const livePrice = hoverPrice ?? market?.priceUsd ?? candles.at(-1)?.close ?? null;
  const change = useMemo(() => {
    const fromRange = rangeChange(candles, hoverPrice);
    if (fromRange != null) return fromRange;
    return market?.change24h ?? null;
  }, [candles, hoverPrice, market?.change24h]);
  const up = (change ?? 0) >= 0;
  const changeLabel = formatPct(change);
  const hasChart = candles.length >= 2;

  return (
    <section className="sheet overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-4">
        <div>
          <p className="text-[11px] font-semibold text-dim">Market</p>
          <p className="ticker mt-0.5 text-2xl font-semibold tracking-tight">
            {formatPrice(livePrice)}
          </p>
          <p className={cn("mt-1 text-[13px]", changeLabel ? (up ? "text-up" : "text-down") : "text-dim")}>
            {changeLabel
              ? `${changeLabel} ${hoverTime ? tapeTime(hoverTime) : range.toUpperCase()}`
              : "Waiting on the first trades"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CHART_RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setHoverPrice(null);
                setHoverTime(null);
                setRange(item);
              }}
              className={cn("chip !px-2.5 !py-1", range === item && "chip-on")}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-px sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="MCAP" value={formatUsd(market?.marketCapUsd ?? market?.fdvUsd)} />
        <Stat label="Volume 24h" value={formatUsd(market?.volume24h)} />
        <Stat label="Liquidity" value={formatUsd(market?.liquidityUsd)} />
        <Stat label="Holders" value={market?.holderCount != null ? String(market.holderCount) : "—"} />
        <Stat label="5m" value={formatPct(market?.change5m) ?? "—"} hot={market?.change5m} />
        <Stat label="1h" value={formatPct(market?.change1h) ?? "—"} hot={market?.change1h} />
      </div>

      <div className={cn("relative bg-well", pending && "opacity-70")}>
        {hasChart ? (
          <MarketChart
            candles={candles}
            up={up}
            onHover={(price, time) => {
              setHoverPrice(price);
              setHoverTime(time);
            }}
          />
        ) : (
          <div className="flex h-[380px] flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-semibold text-on-well">No trades yet</p>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-on-well/50">
              ${symbol} is live. The chart fills as the pool trades.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[12px] text-dim">
        <p>
          {market?.poolName
            ? `${market.poolName}${market.dexId ? ` · ${market.dexId}` : ""}`
            : `$${symbol} · GMGN`}
        </p>
        {market?.gmgnUrl ? (
          <a
            href={market.gmgnUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-link hover:underline"
          >
            Open on GMGN
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hot,
}: {
  label: string;
  value: string;
  hot?: number | null;
}) {
  return (
    <div className="border-t border-line bg-card-2 px-4 py-3">
      <p className="text-xs text-dim">{label}</p>
      <p
        className={cn(
          "ticker mt-1 truncate text-sm",
          hot == null ? "text-ink" : hot >= 0 ? "text-up" : "text-down",
        )}
      >
        {value}
      </p>
    </div>
  );
}
