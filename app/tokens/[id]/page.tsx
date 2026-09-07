import { notFound } from "next/navigation";
import Link from "next/link";
import { ContractCard } from "@/components/ContractCard";
import { TokenAvatar } from "@/components/TokenAvatar";
import { ChainLogo, ChainMark } from "@/components/ChainLogo";
import { fetchToken } from "@/lib/api";
import { chainLabel } from "@/lib/chains";
import {
  formatAbsoluteTime,
  formatCount,
  formatPrice,
  formatShare,
  formatUsd,
  formatYesNo,
  shortenId,
} from "@/lib/format";
import { contractAddress, explorerTokenUrl, gmgnTokenUrl } from "@/lib/market";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const token = await fetchToken(decodeURIComponent(id)).catch(() => null);
  if (!token) return { title: "Token" };
  return {
    title: `${token.name} ($${token.symbol})`,
    description: token.launchNarrative || `${token.name} launched on ${chainLabel(token.chain)} through Deployr.`,
  };
}

export default async function TokenPage({ params }: Props) {
  const { id } = await params;
  const token = await fetchToken(decodeURIComponent(id));
  if (!token) notFound();

  const address = contractAddress(token);

  return (
    <div className="pb-16">
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-4">
          <p className="text-[12px] text-muted">
            <Link href="/tokens" className="text-link hover:underline">
              Collection
            </Link>
            <span className="text-dim"> / </span>
            <span className="font-medium text-ink">${token.symbol}</span>
          </p>

          <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
            <div>
              <div className="sheet overflow-hidden">
                <div className="relative aspect-square bg-card-2">
                  <TokenAvatar
                    src={token.imageUrl}
                    fallbackSrc={token.imageUrlFallback}
                    symbol={token.symbol}
                    fill
                    priority
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-dim">
                <span className="inline-flex items-center gap-1.5">
                  <ChainLogo chain={token.chain} size={14} labeled={false} />
                  {chainLabel(token.chain)}
                </span>
                <span>Deployed by Deployr</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ChainMark chain={token.chain} size={18} />
                <span className="rounded border border-volt/40 bg-volt/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-volt">
                  Live
                </span>
              </div>
              <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">${token.symbol}</h1>
              <p className="text-[14px] text-muted">{token.name}</p>
              <p className="mt-2 text-[12px] leading-5 text-dim">
                Named by {token.creator?.handle ? `@${token.creator.handle.replace(/^@/, "")}` : "the poster"} in
                a public tweet. Deployr deployed it — we don't issue this coin.
              </p>
              <p className="mt-3 max-w-xl text-[13px] leading-6 text-muted">
                {token.launchNarrative ||
                  token.description ||
                  `Launched on ${chainLabel(token.chain)} through Deployr. Copy the contract to verify.`}
              </p>

              <dl className="mt-5 grid grid-cols-3 overflow-hidden rounded-md border border-line">
                <HeroStat label="Market cap" value={formatUsd(token.marketCap)} />
                <HeroStat label="Price" value={formatPrice(token.priceUsd)} />
                <HeroStat label="Liquidity" value={formatUsd(token.liquidityUsd)} />
              </dl>

              <div className="mt-4">
                <ContractCard
                  address={address}
                  symbol={token.symbol}
                  chain={token.chain}
                  gmgnUrl={gmgnTokenUrl(token.chain, address)}
                  explorerUrl={explorerTokenUrl(token.chain, address)}
                  tradeUrl={token.tradeUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-5">
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="sheet p-5">
            <h2 className="text-[13px] font-semibold">Launch</h2>
            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-muted">
              {token.launchNarrative || token.description || "No launch note."}
            </p>
            {token.sourceTweetUrl ? (
              <a
                href={token.sourceTweetUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-[13px] font-semibold hover:underline"
              >
                Origin post
              </a>
            ) : null}
            <dl className="mt-4 text-[13px]">
              <Row k="Creator" v={token.creator?.handle ?? "anon"} />
              <Row k="Origin" v={pretty(token.originType ?? token.launchSource)} />
              <Row k="Profile" v={token.profile} />
              <Row k="Fee profile" v={token.feeProfile} />
              <Row k="Creator tax" v={token.creatorTaxBps != null ? `${token.creatorTaxBps} bps` : null} />
              <Row k="Badge" v={token.deployrBadge} />
              <Row k="Enrichment" v={token.deploymentEnrichmentStatus} />
              <Row k="Launched" v={formatAbsoluteTime(token.launchedAt)} />
            </dl>
          </article>

          <article className="sheet p-5">
            <h2 className="text-[13px] font-semibold">Market</h2>
            <dl className="mt-3 text-[13px]">
              <Row k="Source" v={token.marketSource} />
              <Row k="Price" v={formatPrice(token.priceUsd)} />
              <Row k="Price native" v={token.priceNative != null ? token.priceNative.toExponential(3) : null} />
              <Row k="Market cap" v={formatUsd(token.marketCap)} />
              <Row k="ATH market cap" v={formatUsd(token.athMarketCapUsd)} />
              <Row k="Liquidity" v={formatUsd(token.liquidityUsd)} />
              <Row k="Volume 24h" v={formatUsd(token.volume24h)} />
              <Row k="Trades 24h" v={token.trades24h != null ? formatCount(token.trades24h) : null} />
              <Row k="Holders" v={token.holders != null ? formatCount(token.holders) : null} />
              <Row k="Graduated" v={formatYesNo(token.graduated)} />
              <Row k="Bonding" v={formatShare(token.graduationPercent)} />
              <Row k="Last trade" v={token.lastTradeAt ? formatAbsoluteTime(token.lastTradeAt) : null} />
            </dl>
          </article>

          <article className="sheet p-5">
            <h2 className="text-[13px] font-semibold">On-chain</h2>
            <dl className="mt-3 text-[13px]">
              <Row k="Network" v={chainLabel(token.chain)} />
              <Row k="Chain ID" v={token.chainId != null ? String(token.chainId) : null} />
              <Row k="CAIP-2" v={token.caip2} />
              <Row k="Contract" v={address} mono />
              <Row k="Curve" v={token.curveAddress} mono />
              <Row k="Pool" v={token.poolAddress} mono />
              <Row k="Native" v={token.nativeSymbol} />
              <Row k="Total supply" v={token.totalSupply != null ? formatCount(token.totalSupply) : null} />
              <Row k="Circulating" v={token.circulatingSupply != null ? formatCount(token.circulatingSupply) : null} />
              <Row k="Tx" v={token.transactionId} mono />
              <Row k="Status" v={token.status} />
            </dl>
          </article>

          <article className="sheet p-5">
            <h2 className="text-[13px] font-semibold">Metadata</h2>
            <p className="mt-3 text-[13px] leading-6 text-muted">
              {token.description || "No description from Deployr."}
            </p>
            <dl className="mt-4 text-[13px]">
              <Row k="Description source" v={token.descriptionSource} />
              <Row k="Metadata URI" v={token.metadataUri} />
              <Row k="Image CID" v={token.imageCid} mono />
              <Row k="Freshness" v={token.freshnessRank != null ? `#${token.freshnessRank}` : null} />
            </dl>
          </article>
        </section>
      </div>
    </div>
  );
}

function pretty(value: string | null | undefined) {
  if (!value) return "—";
  return value.replaceAll("_", " ");
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line px-3 py-3 last:border-r-0">
      <dt className="text-[11px] font-semibold text-dim">{label}</dt>
      <dd className="ticker mt-1 text-base font-semibold">{value}</dd>
    </div>
  );
}

function Row({
  k,
  v,
  mono,
}: {
  k: string;
  v?: string | null;
  mono?: boolean;
}) {
  const text = v?.trim() ? v : "—";
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="shrink-0 text-dim">{k}</dt>
      <dd className={`max-w-[70%] text-right font-medium break-all ${mono ? "hash !text-[12px]" : ""}`} title={text}>
        {mono && text !== "—" ? shortenId(text, 6) : text}
      </dd>
    </div>
  );
}
