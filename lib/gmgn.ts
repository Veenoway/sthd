import {
  emptyMarket,
  gmgnChain,
  gmgnTokenUrl,
  num,
  rec,
  type Candle,
  type ChartRange,
  type TokenMarket,
} from "@/lib/market";

const GMGN = "https://gmgn.ai";
const OPENAPI = "https://openapi.gmgn.ai";

const RANGE_KLINE: Record<ChartRange, { resolution: string; spanSec: number }> = {
  "1h": { resolution: "1m", spanSec: 60 * 60 },
  "6h": { resolution: "5m", spanSec: 6 * 60 * 60 },
  "1d": { resolution: "15m", spanSec: 24 * 60 * 60 },
  "7d": { resolution: "1h", spanSec: 7 * 24 * 60 * 60 },
};

const BROWSER_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Origin: "https://gmgn.ai",
  Referer: "https://gmgn.ai/",
};

let unofficialBlockedUntil = 0;

async function gmgnUnofficial(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  if (Date.now() < unofficialBlockedUntil) return null;
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(1600),
    });
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      unofficialBlockedUntil = Date.now() + 10 * 60_000;
      return null;
    }
    return res;
  } catch {
    unofficialBlockedUntil = Date.now() + 45_000;
    return null;
  }
}

function unwrap(payload: unknown): unknown {
  const obj = rec(payload);
  if (!obj) return payload;
  if ("data" in obj) return obj.data;
  return obj;
}

export async function fetchGmgnInfo(chain: string, address: string): Promise<TokenMarket | null> {
  const network = gmgnChain(chain);
  const empty = emptyMarket(chain, address);
  const key = process.env.GMGN_API_KEY;

  if (key) {
    const ts = Math.floor(Date.now() / 1000);
    const clientId = crypto.randomUUID();
    const url = `${OPENAPI}/v1/token/info?chain=${encodeURIComponent(network)}&address=${encodeURIComponent(address)}&timestamp=${ts}&client_id=${clientId}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-APIKEY": key,
        "User-Agent": "Deployr/1.0",
      },
      next: { revalidate: 20 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const parsed = parseInfo(unwrap(await res.json()), chain, address, empty);
      if (parsed) return parsed;
    }
  }

  const res = await gmgnUnofficial(`${GMGN}/mrwapi/v1/multi_token_full_info`, {
    method: "POST",
    headers: BROWSER_HEADERS,
    body: JSON.stringify({ chain: network, addresses: [address] }),
    next: { revalidate: 20 },
  });
  if (!res?.ok) return null;
  const payload = unwrap(await res.json());
  const row = Array.isArray(payload) ? rec(payload[0]) : rec(payload);
  return parseInfo(row, chain, address, empty);
}

export async function fetchGmgnKline(
  chain: string,
  address: string,
  range: ChartRange,
): Promise<Candle[]> {
  const network = gmgnChain(chain);
  const spec = RANGE_KLINE[range];
  const to = Math.floor(Date.now() / 1000);
  const from = to - spec.spanSec;
  const key = process.env.GMGN_API_KEY;

  if (key) {
    const ts = Math.floor(Date.now() / 1000);
    const clientId = crypto.randomUUID();
    const url = `${OPENAPI}/v1/market/token_kline?chain=${encodeURIComponent(network)}&address=${encodeURIComponent(address)}&resolution=${spec.resolution}&from=${from}&to=${to}&timestamp=${ts}&client_id=${clientId}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-APIKEY": key,
        "User-Agent": "Deployr/1.0",
      },
      next: { revalidate: 20 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const candles = parseKline(unwrap(await res.json()));
      if (candles.length) return candles;
    }
  }

  const url = `${GMGN}/defi/quotation/v1/tokens/kline/${network}/${encodeURIComponent(address)}?resolution=${spec.resolution}&from=${from}&to=${to}`;
  const res = await gmgnUnofficial(url, {
    headers: BROWSER_HEADERS,
    next: { revalidate: 20 },
  });
  if (!res?.ok) return [];
  return parseKline(unwrap(await res.json()));
}

function parseInfo(
  raw: unknown,
  chain: string,
  address: string,
  empty: TokenMarket,
): TokenMarket | null {
  const row = rec(raw);
  if (!row) return null;
  const priceObj = rec(row.price);
  const priceUsd =
    num(priceObj?.price) ?? num(row.price) ?? num(row.ath_price);
  const supply = num(row.circulating_supply) ?? num(row.total_supply);
  const mcap =
    num(row.market_cap) ??
    (priceUsd != null && supply != null ? priceUsd * supply : null) ??
    num(row.ath_market_cap);
  const volume = rec(row.price) ?? rec(row.trade_stat) ?? row;
  return {
    ...empty,
    priceUsd,
    fdvUsd: mcap,
    marketCapUsd: mcap,
    volume24h: num(rec(volume)?.volume_24h) ?? num(row.volume_24h),
    change5m: num(rec(volume)?.price_change_percent5m),
    change1h: num(rec(volume)?.price_change_percent1h),
    change6h: num(rec(volume)?.price_change_percent6h),
    change24h: num(rec(volume)?.price_change_percent24h),
    liquidityUsd: num(row.liquidity),
    pairAddress: typeof row.biggest_pool_address === "string" && row.biggest_pool_address
      ? row.biggest_pool_address
      : null,
    dexId: typeof row.launchpad_platform === "string" ? row.launchpad_platform : null,
    poolName: typeof row.symbol === "string" ? `$${row.symbol}` : null,
    gmgnUrl: typeof rec(row.link)?.gmgn === "string" ? String(rec(row.link)?.gmgn) : gmgnTokenUrl(chain, address),
    buys24h: num(rec(volume)?.buys_24h),
    sells24h: num(rec(volume)?.sells_24h),
    holderCount: num(row.holder_count),
    totalSupply: supply,
    quoteSource: priceUsd != null ? "gmgn" : null,
  };
}

function parseKline(raw: unknown): Candle[] {
  const list = Array.isArray(raw) ? raw : rec(raw)?.list;
  if (!Array.isArray(list)) return [];
  const candles: Candle[] = [];
  for (const item of list) {
    const row = rec(item);
    if (!row) continue;
    let time = num(row.time);
    if (time != null && time > 1e12) time = Math.floor(time / 1000);
    const open = num(row.open);
    const high = num(row.high);
    const low = num(row.low);
    const close = num(row.close);
    const volume = num(row.volume) ?? 0;
    if (time == null || open == null || high == null || low == null || close == null) continue;
    candles.push({ time, open, high, low, close, volume });
  }
  const unique = new Map<number, Candle>();
  for (const candle of candles) unique.set(candle.time, candle);
  return [...unique.values()].sort((a, b) => a.time - b.time);
}
