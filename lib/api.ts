import { cache } from "react";
import { chainParam } from "@/lib/chains";
import type { Token, TokenListResponse } from "@/lib/types";
import { resolveTokenImages } from "@/lib/media";
import { DEPLOYR_API } from "@/lib/site";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asSparkline(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const points = value
    .map((point) => {
      if (typeof point === "number") return point;
      if (point && typeof point === "object") {
        const rec = point as Record<string, unknown>;
        return asNumber(rec.close ?? rec.value ?? rec.p ?? rec.y);
      }
      return asNumber(point);
    })
    .filter((n): n is number => n != null);
  return points.length >= 2 ? points : null;
}

function asBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function pickMarket(raw: Record<string, unknown>) {
  const market =
    raw.market && typeof raw.market === "object"
      ? (raw.market as Record<string, unknown>)
      : raw.stats && typeof raw.stats === "object"
        ? (raw.stats as Record<string, unknown>)
        : {};
  const fees =
    raw.fees && typeof raw.fees === "object" ? (raw.fees as Record<string, unknown>) : {};

  return {
    marketCap: asNumber(
      raw.marketCapUsd ??
        raw.marketCap ??
        raw.mcap ??
        raw.fdv ??
        market.marketCapUsd ??
        market.marketCap ??
        market.mcap,
    ),
    priceUsd: asNumber(raw.priceUsd ?? raw.price ?? market.priceUsd ?? market.price),
    priceNative: asNumber(raw.priceNative ?? market.priceNative),
    priceChange24h: asNumber(
      raw.priceChange24h ??
        raw.priceChange ??
        market.priceChange24h ??
        market.change24h,
    ),
    volume24h: asNumber(
      raw.volume24hUsd ?? raw.volume24h ?? raw.volume ?? market.volume24hUsd ?? market.volume24h,
    ),
    liquidityUsd: asNumber(raw.liquidityUsd ?? market.liquidityUsd),
    holders: asNumber(raw.holders ?? market.holders ?? market.holderCount),
    trades24h: asNumber(raw.trades24h ?? market.trades24h),
    graduated: asBool(raw.graduated ?? market.graduated),
    graduationPercent: asNumber(raw.graduationPercent ?? market.graduationPercent),
    marketSource: asString(market.source),
    feeProfile: asString(raw.feeProfile ?? fees.profile),
    creatorTaxBps: asNumber(fees.customFeeBps ?? market.creatorTaxBps),
    metadataUri: asString(raw.metadataUri ?? market.metadataUri),
    descriptionSource: asString(raw.descriptionSource),
    curveAddress: asString(market.curveAddress),
    poolAddress: asString(market.poolAddress),
    totalSupply: asNumber(market.totalSupply),
    circulatingSupply: asNumber(market.circulatingSupply),
    nativeSymbol: asString(market.nativeSymbol),
    athMarketCapUsd: asNumber(market.athMarketCapUsd),
    lastTradeAt: asString(market.lastTradeAt),
    status: asString(raw.status),
    transactionId: asString(raw.transactionId),
    sparkline: asSparkline(
      raw.sparkline ?? raw.chart ?? raw.candles ?? market.sparkline ?? market.chart,
    ),
  };
}

export function normalizeToken(raw: unknown): Token | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const tokenId = asString(t.tokenId ?? t.id ?? t.address);
  const name = asString(t.name);
  const symbol = asString(t.symbol);
  if (!tokenId || !name || !symbol) return null;

  const creator =
    t.creator && typeof t.creator === "object"
      ? (t.creator as Token["creator"])
      : null;

  const market = pickMarket(t);
  const nestedMarket =
    t.market && typeof t.market === "object" ? (t.market as Record<string, unknown>) : {};
  const images = resolveTokenImages({
    imageUrl: asString(t.imageUrl ?? t.logo ?? t.image),
    imageUrlFallback: asString(t.imageUrlFallback),
    imageCid: asString(t.imageCid),
    marketImageUrl: asString(nestedMarket.imageUrl),
  });

  return {
    tokenId,
    name,
    symbol,
    chain: asString(t.chain) ?? "unknown",
    chainId: asNumber(t.chainId),
    address: asString(t.address),
    caip2: asString(t.caip2),
    tradeUrl: asString(t.tradeUrl),
    imageUrl: images.imageUrl,
    imageUrlFallback: images.imageUrlFallback,
    imageCid: asString(t.imageCid),
    description: asString(t.description) ?? "",
    launchedAt: asString(t.launchedAt),
    launchedAtMs: asNumber(t.launchedAtMs),
    creator,
    deployrBadge: asString(t.deployrBadge),
    launchNarrative: asString(t.launchNarrative),
    sourceTweetUrl: asString(t.sourceTweetUrl),
    originType: asString(t.originType),
    profile: asString(t.profile),
    launchSource: asString(t.launchSource),
    deploymentEnrichmentStatus: asString(t.deploymentEnrichmentStatus),
    freshnessRank: asNumber(t.freshnessRank),
    ...market,
  };
}

async function fetchTokensPage(
  limit: number,
  cursor: string | number | null,
  chain: string | null,
): Promise<TokenListResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor != null && cursor !== "") {
    params.set("cursor", String(cursor));
  }
  const chainKey = chainParam(chain);
  if (chainKey) params.set("chain", chainKey);

  const res = await fetch(`${DEPLOYR_API}/v1/tokens?${params.toString()}`, {
    next: { revalidate: 15 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Token feed unavailable (${res.status})`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const tokens = Array.isArray(data.tokens)
    ? data.tokens.map(normalizeToken).filter((t): t is Token => t != null)
    : [];

  return {
    ok: Boolean(data.ok),
    tokens,
    nextCursor: (data.nextCursor as string | number | null) ?? null,
    count: asNumber(data.count) ?? tokens.length,
    total: asNumber(data.total) ?? tokens.length,
  };
}

export async function fetchTokensList(
  limit = 40,
  cursor: string | number | null = null,
  chain: string | null = null,
): Promise<TokenListResponse> {
  return fetchTokensPage(limit, cursor, chain);
}

export const fetchTokens = cache(fetchTokensList);

export const fetchToken = cache(async function fetchToken(id: string): Promise<Token | null> {
  const res = await fetch(
    `${DEPLOYR_API}/v1/tokens/${encodeURIComponent(id)}`,
    {
      next: { revalidate: 20 },
      headers: { Accept: "application/json" },
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Token lookup failed (${res.status})`);
  const data = (await res.json()) as Record<string, unknown>;
  return normalizeToken(data.token ?? data);
});
