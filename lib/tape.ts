import { fetchGmgnInfo, fetchGmgnKline } from "@/lib/gmgn";
import {
  emptyMarket,
  num,
  rec,
  type Candle,
  type ChartRange,
  type TokenMarket,
  type TokenTape,
} from "@/lib/market";

export type { Candle, TokenTape };

const GECKO = "https://api.geckoterminal.com/api/v2";

type GeckoPool = {
  address: string;
  market: TokenMarket;
  tokenIsBase: boolean;
};

const RANGE_OHLCV: Record<
  ChartRange,
  { timeframe: string; aggregate: number; limit: number }
> = {
  "1h": { timeframe: "minute", aggregate: 1, limit: 60 },
  "6h": { timeframe: "minute", aggregate: 5, limit: 72 },
  "1d": { timeframe: "minute", aggregate: 15, limit: 96 },
  "7d": { timeframe: "hour", aggregate: 1, limit: 168 },
};

const cache = new Map<string, { exp: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value as T;
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const run = fn()
    .then((value) => {
      inflight.delete(key);
      if (value != null) cache.set(key, { exp: Date.now() + ttlMs, value });
      return value;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });
  inflight.set(key, run);
  return run;
}

function geckoNetwork(chain: string) {
  const key = chain.toLowerCase();
  if (key === "eth" || key === "ethereum") return "eth";
  return key;
}

async function geckoGet(path: string): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch(`${GECKO}${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Deployr/1.0",
      },
      cache: "no-store",
    });
    if (res.status === 429 && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
}

function relId(pool: Record<string, unknown>, key: string) {
  const data = rec(rec(rec(pool.relationships)?.[key])?.data);
  return typeof data?.id === "string" ? data.id : "";
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function sanitize(candles: Candle[]) {
  const closes = candles.map((c) => c.close).filter((n) => n > 0 && Number.isFinite(n));
  if (closes.length === 0) return [];
  const mid = median(closes);
  if (!(mid > 0)) return [];
  const unique = new Map<number, Candle>();
  for (const candle of candles) {
    if (!(candle.close > 0) || !Number.isFinite(candle.close)) continue;
    const ratio = candle.close / mid;
    if (ratio > 40 || ratio < 1 / 40) continue;
    unique.set(candle.time, candle);
  }
  return [...unique.values()].sort((a, b) => a.time - b.time);
}

function pinLivePrice(candles: Candle[], price: number | null) {
  if (price == null || !Number.isFinite(price) || candles.length === 0) return candles;
  const last = candles[candles.length - 1];
  if (!last) return candles;
  const now = Math.floor(Date.now() / 1000);
  if (now - last.time > 45) {
    return [
      ...candles,
      {
        time: now,
        open: last.close,
        high: Math.max(last.close, price),
        low: Math.min(last.close, price),
        close: price,
        volume: 0,
      },
    ];
  }
  return candles.map((candle, i) =>
    i === candles.length - 1
      ? {
          ...candle,
          close: price,
          high: Math.max(candle.high, price),
          low: Math.min(candle.low, price),
        }
      : candle,
  );
}

function poolToMarket(
  chain: string,
  tokenAddress: string,
  pool: Record<string, unknown>,
): GeckoPool | null {
  const attrs = rec(pool.attributes);
  if (!attrs) return null;
  const address = typeof attrs.address === "string" ? attrs.address : null;
  if (!address) return null;
  const baseId = relId(pool, "base_token");
  const quoteId = relId(pool, "quote_token");
  const tokenIsBase = baseId ? baseId.toLowerCase().includes(tokenAddress.toLowerCase()) : true;
  const tokenIsQuote = quoteId.toLowerCase().includes(tokenAddress.toLowerCase());
  if (!tokenIsBase && !tokenIsQuote && baseId) return null;

  const change = rec(attrs.price_change_percentage);
  const volume = rec(attrs.volume_usd);
  const txns = rec(rec(attrs.transactions)?.h24);
  const priceUsd = tokenIsBase ? num(attrs.base_token_price_usd) : num(attrs.quote_token_price_usd);
  const fdvUsd = num(attrs.fdv_usd);
  const market = emptyMarket(chain, tokenAddress);

  return {
    address,
    tokenIsBase,
    market: {
      ...market,
      priceUsd,
      fdvUsd,
      marketCapUsd: num(attrs.market_cap_usd) ?? fdvUsd,
      volume24h: num(volume?.h24),
      change5m: num(change?.m5),
      change1h: num(change?.h1),
      change6h: num(change?.h6),
      change24h: num(change?.h24),
      liquidityUsd: num(attrs.reserve_in_usd),
      pairAddress: address,
      dexId: relId(pool, "dex").split("_").pop() ?? null,
      poolName: typeof attrs.name === "string" ? attrs.name : null,
      buys24h: num(txns?.buys),
      sells24h: num(txns?.sells),
      quoteSource: "pool",
    },
  };
}

async function fetchGeckoPool(chain: string, address: string): Promise<GeckoPool | null> {
  const network = geckoNetwork(chain);
  const payload = await cached(`pool:${network}:${address.toLowerCase()}`, 45_000, () =>
    geckoGet(`/networks/${network}/tokens/${encodeURIComponent(address)}/pools?page=1`),
  );
  const rows = rec(payload)?.data;
  if (!Array.isArray(rows)) return null;
  const ranked = rows
    .map((row) => poolToMarket(chain, address, rec(row) ?? {}))
    .filter((row): row is GeckoPool => row != null)
    .sort((a, b) => (b.market.liquidityUsd ?? 0) - (a.market.liquidityUsd ?? 0));
  return ranked.find((row) => row.tokenIsBase) ?? ranked[0] ?? null;
}

async function fetchOhlcv(chain: string, poolAddress: string, range: ChartRange): Promise<Candle[]> {
  const network = geckoNetwork(chain);
  const spec = RANGE_OHLCV[range];
  const query = new URLSearchParams({
    aggregate: String(spec.aggregate),
    limit: String(spec.limit),
    currency: "usd",
    include_empty_intervals: "false",
  });
  const payload = await cached(`ohlcv:v2:${network}:${poolAddress}:${range}`, 30_000, () =>
    geckoGet(
      `/networks/${network}/pools/${encodeURIComponent(poolAddress)}/ohlcv/${spec.timeframe}?${query}`,
    ),
  );
  const attrs = rec(rec(rec(payload)?.data)?.attributes);
  const rows = attrs?.ohlcv_list;
  if (!Array.isArray(rows)) return [];
  const candles: Candle[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 6) continue;
    const rawTime = num(row[0]);
    const time = rawTime != null && rawTime > 1e12 ? Math.floor(rawTime / 1000) : rawTime;
    const open = num(row[1]);
    const high = num(row[2]);
    const low = num(row[3]);
    const close = num(row[4]);
    const volume = num(row[5]) ?? 0;
    if (time == null || open == null || high == null || low == null || close == null) continue;
    candles.push({ time, open, high, low, close, volume });
  }
  return collapseIdle(sanitize(candles));
}

function collapseIdle(candles: Candle[]) {
  if (candles.length < 3) return candles;
  const out: Candle[] = [candles[0]!];
  for (let i = 1; i < candles.length - 1; i += 1) {
    const cur = candles[i]!;
    const prev = out[out.length - 1]!;
    const next = candles[i + 1]!;
    const flatPrev = nearlyEqual(cur.close, prev.close) && cur.volume === 0;
    const flatNext = nearlyEqual(cur.close, next.close);
    if (flatPrev && flatNext) continue;
    out.push(cur);
  }
  const last = candles[candles.length - 1]!;
  if (out[out.length - 1]?.time !== last.time) out.push(last);
  return out;
}

function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1e-18) < 1e-6;
}

function withLiveQuote(market: TokenMarket, candles: Candle[]): TokenMarket {
  if (market.priceUsd != null) return market;
  const last = candles.at(-1)?.close;
  if (last == null) return market;
  const mcap =
    market.totalSupply != null ? last * market.totalSupply : market.marketCapUsd;
  return {
    ...market,
    priceUsd: last,
    marketCapUsd: mcap,
    fdvUsd: market.fdvUsd ?? mcap,
    quoteSource: market.quoteSource ?? "gmgn",
  };
}

export async function fetchTokenTape(input: {
  chain: string;
  address: string;
  range: ChartRange;
}): Promise<TokenTape> {
  const blank = emptyMarket(input.chain, input.address);
  const gmgnInfoP = fetchGmgnInfo(input.chain, input.address).catch(() => null);
  const gmgnKlineP = fetchGmgnKline(input.chain, input.address, input.range).catch(
    () => [] as Candle[],
  );
  const geckoPoolP = fetchGeckoPool(input.chain, input.address).catch(() => null);

  const geckoPool = await geckoPoolP;
  const geckoCandlesP =
    geckoPool?.tokenIsBase
      ? fetchOhlcv(input.chain, geckoPool.address, input.range).catch(() => [] as Candle[])
      : Promise.resolve([] as Candle[]);

  const [gmgnInfo, gmgnCandles, geckoCandles] = await Promise.all([
    gmgnInfoP,
    gmgnKlineP,
    geckoCandlesP,
  ]);

  const candles = gmgnCandles.length >= 2 ? gmgnCandles : geckoCandles;
  const gmgnMarket = gmgnInfo ? withLiveQuote(gmgnInfo, candles) : null;
  const market =
    gmgnMarket?.priceUsd != null
      ? gmgnMarket
      : geckoPool?.market
        ? { ...geckoPool.market, gmgnUrl: blank.gmgnUrl, explorerUrl: blank.explorerUrl }
        : (gmgnMarket ?? blank);

  return {
    market,
    candles: pinLivePrice(candles, market.priceUsd),
  };
}
