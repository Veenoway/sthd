import Image from "next/image";
import Link from "next/link";
import { ChainLogo } from "@/components/ChainLogo";
import { CopyButton } from "@/components/CopyButton";
import { Timestamp } from "@/components/Timestamp";
import { TokenAvatar } from "@/components/TokenAvatar";
import { chainLabel } from "@/lib/chains";
import { formatPrice, formatUsd } from "@/lib/format";
import { contractAddress } from "@/lib/market";
import type { Token } from "@/lib/types";

function handleOf(token: Token) {
  const raw = token.creator?.handle?.replace(/^@/, "").trim();
  return raw ? `@${raw}` : "@anon";
}

function tweetText(token: Token) {
  const written = token.launchNarrative?.trim();
  if (written) return written;
  return `launch $${token.symbol} on ${chainLabel(token.chain)}`;
}

function XMark({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 text-muted ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function HeroBrand() {
  return (
    <div className="w-[7.5rem] shrink-0 overflow-hidden rounded-md sm:w-[11rem] lg:w-[16.5rem]">
      <div className="relative aspect-square bg-volt">
        <Image
          src="/brand/eagle.png"
          alt="Deployr"
          fill
          preload
          fetchPriority="high"
          sizes="(min-width: 1024px) 16.5rem, (min-width: 640px) 11rem, 7.5rem"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function LaunchCase({ token }: { token: Token }) {
  const who = handleOf(token);
  const initials = who.replace("@", "").slice(0, 2).toUpperCase();
  const href = `/tokens/${encodeURIComponent(token.tokenId)}`;
  const address = contractAddress(token);

  return (
    <article>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">A real launch</h2>
          <p className="mt-1 text-[13px] text-muted">
            Someone tweeted a ticker. We deployed it. The coin is theirs.
          </p>
        </div>
        <p className="font-mono text-[12px] text-dim">
          <Timestamp iso={token.launchedAt} ms={token.launchedAtMs} />
          <span> · from a public tweet</span>
        </p>
      </div>

      <div className="sheet overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold tracking-wide text-dim uppercase">The tweet</p>
            <div className="mt-3 rounded-md border border-line bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-[11px] font-semibold">
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{who}</span>
                  <span className="text-[12px] text-muted">Instruction posted on X</span>
                </span>
                <XMark className="size-4" />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6">{tweetText(token)}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6">
              <Spec k="Ticker" v={`$${token.symbol}`} />
              <Spec k="Chain" v={chainLabel(token.chain)} />
              <Spec k="Creator" v={who} />
              <Spec k="Origin" v="Public tweet" />
            </dl>
            {token.sourceTweetUrl ? (
              <a
                href={token.sourceTweetUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
              >
                Open the tweet
                <XMark className="size-3" />
              </a>
            ) : null}
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-wide text-dim uppercase">The token</p>
              <span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
                Not ours
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              <TokenAvatar
                src={token.imageUrl}
                fallbackSrc={token.imageUrlFallback}
                symbol={token.symbol}
                size={72}
                priority
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold tracking-tight">${token.symbol}</p>
                <p className="truncate text-[13px] text-muted">{token.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <ChainLogo chain={token.chain} size={16} labeled={false} />
                    {chainLabel(token.chain)}
                  </span>
                  <span className="font-semibold text-volt">Live</span>
                </p>
                <p className="mt-1 text-[12px] leading-5 text-dim">
                  Named by {who}. Deployr only paid gas.
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-line">
              <Stat label="Market cap" value={formatUsd(token.marketCap)} />
              <Stat label="Price" value={formatPrice(token.priceUsd)} />
              <Stat label="Liquidity" value={formatUsd(token.liquidityUsd)} />
            </dl>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="hash truncate" title={address}>
                {address}
              </p>
              <CopyButton value={address} className="shrink-0 text-[13px] font-semibold hover:underline" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={href} className="btn-primary btn-sm">
                Open token
              </Link>
              {token.tradeUrl ? (
                <a href={token.tradeUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  Trade
                </a>
              ) : null}
              {token.sourceTweetUrl ? (
                <a
                  href={token.sourceTweetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-sm"
                >
                  Origin tweet
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid border-t border-line sm:grid-cols-3">
          <Fact k="Posted on X" v={`${who} named the ticker in public.`} />
          <Fact k="Deployr deployed it" v="Treasury paid the gas. Take is 0%." />
          <Fact k="Listed here" v={`Live on ${chainLabel(token.chain)}. Not a Deployr token.`} />
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line px-3 py-2.5 last:border-r-0">
      <dt className="text-[11px] font-semibold text-dim">{label}</dt>
      <dd className="ticker mt-1 truncate text-[13px] font-semibold">{value}</dd>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="py-2">
      <dt className="text-[11px] font-semibold text-dim">{k}</dt>
      <dd className="mt-0.5 truncate text-[13px] font-medium">{v}</dd>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-b border-line px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[12px] font-semibold">{k}</p>
      <p className="mt-0.5 text-[12px] leading-5 text-muted">{v}</p>
    </div>
  );
}

export function TweetToTokenRow({
  token,
  priority = false,
}: {
  token: Token;
  priority?: boolean;
}) {
  const href = `/tokens/${encodeURIComponent(token.tokenId)}`;
  const who = handleOf(token);
  const text = tweetText(token);

  const tweet = (
    <div className="px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        {who}
        <span className="font-normal text-dim">on X</span>
      </p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">{text}</p>
    </div>
  );

  return (
    <div className="grid border-b border-line last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_minmax(12rem,16rem)]">
      {token.sourceTweetUrl ? (
        <a href={token.sourceTweetUrl} target="_blank" rel="noreferrer" className="hover:bg-white/[0.035]">
          {tweet}
        </a>
      ) : (
        tweet
      )}
      <p className="hidden items-center px-2 font-mono text-[11px] font-semibold text-volt md:flex">→</p>
      <Link href={href} className="flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.035]">
        <TokenAvatar
          src={token.imageUrl}
          fallbackSrc={token.imageUrlFallback}
          symbol={token.symbol}
          size={32}
          priority={priority}
        />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">${token.symbol}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-dim">
            <ChainLogo chain={token.chain} size={12} labeled={false} />
            {chainLabel(token.chain)}
          </span>
        </span>
      </Link>
    </div>
  );
}
