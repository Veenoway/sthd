"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice, formatUsd } from "@/lib/format";
import type { Candle } from "@/lib/market";

type Point = {
  t: number;
  price: number;
  volume: number;
};

function axisTime(value: number) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: Point }[];
  label?: number;
}) {
  if (!active || !payload?.[0] || label == null) return null;
  const point = payload[0].payload;
  return (
    <div className="sheet px-3 py-2.5 shadow-sm">
      <p className="text-[11px] text-dim">{axisTime(label)}</p>
      <p className="ticker mt-1 text-sm font-semibold">{formatPrice(payload[0].value)}</p>
      {point?.volume ? (
        <p className="mt-1 text-[11px] text-dim">Vol {formatUsd(point.volume)}</p>
      ) : null}
    </div>
  );
}

export function MarketChart({
  candles,
  up,
  onHover,
}: {
  candles: Candle[];
  up: boolean;
  onHover: (price: number | null, time: number | null) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const el = box.current;
    if (!el) return;
    const sync = () => {
      const next = Math.round(el.clientWidth);
      if (next > 0) setWidth(next);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo<Point[]>(
    () =>
      candles
        .filter((c) => Number.isFinite(c.close) && c.close > 0)
        .map((c) => ({
          t: c.time * 1000,
          price: c.close,
          volume: c.volume,
        })),
    [candles],
  );

  const stroke = up ? "#ccff00" : "#ff5a5a";
  const sparse = data.length <= 24;
  const height = 408;

  return (
    <div ref={box} className="h-[420px] w-full overflow-hidden px-2 pb-2 pt-4">
      {ready && width > 0 ? (
      <ComposedChart
        data={data}
        width={width}
        height={height}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
        onMouseMove={(state) => {
          const payload = (
            state as { activePayload?: { payload: Point }[] }
          ).activePayload?.[0]?.payload;
          if (payload) onHover(payload.price, Math.floor(payload.t / 1000));
        }}
        onMouseLeave={() => onHover(null, null)}
      >
        <CartesianGrid stroke="rgba(232,234,237,0.1)" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(value: number) =>
            new Date(value).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
          tick={{ fill: "#8a929c", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          yAxisId="price"
          orientation="right"
          domain={["auto", "auto"]}
          tickFormatter={(value: number) => formatPrice(value)}
          tick={{ fill: "#8a929c", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={88}
        />
        <YAxis yAxisId="vol" orientation="left" hide domain={[0, "auto"]} />
        <Tooltip
          cursor={{ stroke: "rgba(232,234,237,0.28)", strokeWidth: 1 }}
          content={<ChartTooltip />}
        />
        <Bar
          yAxisId="vol"
          dataKey="volume"
          fill={up ? "rgba(204,255,0,0.22)" : "rgba(255,90,90,0.22)"}
          maxBarSize={18}
        />
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke={stroke}
          strokeWidth={2.2}
          fill={stroke}
          fillOpacity={0.16}
          dot={sparse ? { r: 3.5, fill: "#0a0a0a", stroke, strokeWidth: 2 } : false}
          activeDot={{ r: 5, fill: stroke, stroke: "#0a0a0a", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
      ) : null}
    </div>
  );
}
