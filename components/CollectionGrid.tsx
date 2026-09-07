import Link from "next/link";
import { ChainLogo } from "@/components/ChainLogo";
import { Timestamp } from "@/components/Timestamp";
import { TokenAvatar } from "@/components/TokenAvatar";
import type { Token } from "@/lib/types";

export function CollectionGrid({
  tokens,
  numbered = true,
}: {
  tokens: Token[];
  numbered?: boolean;
}) {
  if (tokens.length === 0) {
    return (
      <div className="sheet px-5 py-20 text-center text-sm text-muted">
        No launches in this lane yet.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {tokens.map((token, index) => (
        <li key={token.tokenId}>
          <CollectionCard token={token} index={numbered ? index + 1 : null} />
        </li>
      ))}
    </ul>
  );
}

function CollectionCard({ token, index }: { token: Token; index: number | null }) {
  const href = `/tokens/${encodeURIComponent(token.tokenId)}`;

  return (
    <Link href={href} className="group sheet block overflow-hidden hover:border-muted">
      <div className="relative aspect-square overflow-hidden bg-card-2">
        <TokenAvatar
          src={token.imageUrl}
          fallbackSrc={token.imageUrlFallback}
          symbol={token.symbol}
          fill
          priority={index != null && index <= 8}
        />
        {index != null ? (
          <span className="absolute top-2 left-2 rounded bg-card/90 px-1.5 py-0.5 font-mono text-[10px] text-dim">
            {String(index).padStart(3, "0")}
          </span>
        ) : null}
        <span className="absolute right-2 bottom-2 rounded bg-card/90 p-1">
          <ChainLogo chain={token.chain} size={16} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 px-2.5 py-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">${token.symbol}</p>
          <p className="truncate text-[11px] text-dim">{token.name}</p>
        </div>
        <Timestamp iso={token.launchedAt} ms={token.launchedAtMs} className="shrink-0" />
      </div>
    </Link>
  );
}
