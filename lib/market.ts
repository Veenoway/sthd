import type { Token } from "@/lib/types";

export const CHART_RANGES = ["1h", "6h", "1d", "7d"] as const;
export type ChartRange = (typeof CHART_RANGES)[number];
export type QuoteSource = "gmgn" | "pool" | null;

export function isChartRange(value: string): value is ChartRange {
  return (CHART_RANGES as readonly string[]).includes(value);
}

export type TokenMarket = {
  priceUsd: number | null;
  fdvUsd: number | null;
  marketCapUsd: number | null;
  volume24h: number | null;
  change5m: number | null;
  change1h: number | null;
  change6h: number | null;
  change24h: number | null;
  liquidityUsd: number | null;
  pairAddress: string | null;
  dexId: string | null;
  poolName: string | null;
  network: string;
  gmgnUrl: string | null;
  explorerUrl: string | null;
  buys24h: number | null;
  sells24h: number | null;
  holderCount: number | null;
  totalSupply: number | null;
  quoteSource: QuoteSource;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TokenTape = {
  market: TokenMarket;
  candles: Candle[];
};

export function gmgnChain(chain: string) {
  const key = chain.toLowerCase();
  if (key === "solana") return "sol";
  if (key === "eth" || key === "ethereum") return "eth";
  if (key === "base") return "base";
  if (key === "bsc" || key === "bnb") return "bsc";
  if (key === "robinhood") return "robinhood";
  return key;
}

export function hasMarketQuote(token: Pick<Token, "priceUsd" | "marketCap" | "liquidityUsd">) {
  const quoted = (value: number | null | undefined, min = 0) =>
    value != null && Number.isFinite(value) && value > min;
  return quoted(token.priceUsd) || quoted(token.marketCap) || quoted(token.liquidityUsd, 0.01);
}

export function contractAddress(token: Pick<Token, "address" | "tokenId">) {
  return token.address || token.tokenId;
}

export function isTokenAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export function gmgnTokenUrl(chain: string, address: string) {
  return `https://gmgn.ai/${gmgnChain(chain)}/token/${address}`;
}

export function explorerTokenUrl(chain: string, address: string) {
  const key = chain.toLowerCase();
  if (key === "solana") return `https://solscan.io/token/${address}`;
  if (key === "base") return `https://basescan.org/token/${address}`;
  if (key === "eth" || key === "ethereum") return `https://etherscan.io/token/${address}`;
  if (key === "bsc" || key === "bnb") return `https://bscscan.com/token/${address}`;
  return null;
}

export function emptyMarket(chain: string, address: string): TokenMarket {
  return {
    priceUsd: null,
    fdvUsd: null,
    marketCapUsd: null,
    volume24h: null,
    change5m: null,
    change1h: null,
    change6h: null,
    change24h: null,
    liquidityUsd: null,
    pairAddress: null,
    dexId: null,
    poolName: null,
    network: gmgnChain(chain),
    gmgnUrl: gmgnTokenUrl(chain, address),
    explorerUrl: explorerTokenUrl(chain, address),
    buys24h: null,
    sells24h: null,
    holderCount: null,
    totalSupply: null,
    quoteSource: null,
  };
}

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}
