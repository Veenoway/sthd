import Link from "next/link";
import { ChainLogo } from "@/components/ChainLogo";
import { Timestamp } from "@/components/Timestamp";
import { TokenAvatar } from "@/components/TokenAvatar";
import type { Token } from "@/lib/types";

export function LiveFeed({ tokens }: { tokens: Token[] }) {
  return (
    <div className="sheet overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-white/[0.02] px-3 py-2.5">
        <p className="text-[12px] font-semibold">Live launches</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-dim">
          <span className="size-1.5 rounded-full bg-volt" />
          on-chain
        </span>
      </div>
      <ul>
        {tokens.map((token) => {
          const href = `/tokens/${encodeURIComponent(token.tokenId)}`;
          return (
            <li key={token.tokenId} className="border-b border-line last:border-b-0">
              <Link href={href} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.035]">
                <TokenAvatar src={token.imageUrl} fallbackSrc={token.imageUrlFallback} symbol={token.symbol} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">
                    ${token.symbol}
                  </span>
                  <span className="block truncate text-[11px] text-dim">{token.name}</span>
                </span>
                <ChainLogo chain={token.chain} size={16} />
                <Timestamp iso={token.launchedAt} ms={token.launchedAtMs} />
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/tokens"
        className="block border-t border-line px-3 py-2.5 text-[12px] font-semibold text-link hover:underline"
      >
        Open the full index
      </Link>
    </div>
  );
}
