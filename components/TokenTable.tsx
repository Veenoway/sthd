"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { ChainMark } from "@/components/ChainLogo";
import { Timestamp } from "@/components/Timestamp";
import { TokenAvatar } from "@/components/TokenAvatar";
import { formatPrice, formatUsd } from "@/lib/format";
import type { Token } from "@/lib/types";

export function TokenTable({
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
    <div className="sheet overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-[11px] text-dim">
            <th className="w-12 px-3 py-2.5 font-semibold md:w-14 md:px-4">#</th>
            <th className="px-3 py-2.5 font-semibold md:px-4">Token</th>
            <th className="px-3 py-2.5 font-semibold md:px-4">Chain</th>
            <th className="px-3 py-2.5 text-right font-semibold md:px-4">Price</th>
            <th className="px-3 py-2.5 text-right font-semibold md:px-4">Mcap</th>
            <th className="px-3 py-2.5 text-right font-semibold md:px-4">Liquidity</th>
            <th className="px-3 py-2.5 text-right font-semibold md:px-4">Launched</th>
            <th className="px-3 py-2.5 text-right font-semibold md:px-4" />
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <TokenRow
              key={token.tokenId}
              token={token}
              index={numbered ? index + 1 : null}
              priority={index < 12}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TokenRow({
  token,
  index,
  priority,
}: {
  token: Token;
  index: number | null;
  priority: boolean;
}) {
  const href = `/tokens/${encodeURIComponent(token.tokenId)}`;

  function go(newTab = false) {
    if (newTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.assign(href);
  }

  function onRowClick(event: MouseEvent<HTMLTableRowElement>) {
    if ((event.target as HTMLElement).closest("[data-row-action]")) return;
    event.preventDefault();
    go(event.metaKey || event.ctrlKey);
  }

  function onRowKey(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    go();
  }

  return (
    <tr
      className="group cursor-pointer border-b border-line last:border-b-0 hover:bg-white/[0.035]"
      tabIndex={0}
      aria-label={`Open $${token.symbol}`}
      onClick={onRowClick}
      onKeyDown={onRowKey}
    >
      <td className="px-3 py-3 font-mono text-xs text-dim md:px-4">
        {index != null ? String(index).padStart(3, "0") : "—"}
      </td>
      <td className="px-3 py-3 md:px-4">
        <span className="flex min-w-0 items-center gap-3">
          <TokenAvatar
            src={token.imageUrl}
            fallbackSrc={token.imageUrlFallback}
            symbol={token.symbol}
            size={36}
            priority={priority}
          />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">${token.symbol}</span>
            <span className="block truncate text-xs text-dim">{token.name}</span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 md:px-4">
        <ChainMark chain={token.chain} size={16} />
      </td>
      <td className="px-3 py-3 text-right md:px-4">
        <span className="ticker block whitespace-nowrap text-sm">
          {formatPrice(token.priceUsd)}
        </span>
      </td>
      <td className="px-3 py-3 text-right md:px-4">
        <span className="ticker block whitespace-nowrap text-sm">
          {formatUsd(token.marketCap)}
        </span>
      </td>
      <td className="px-3 py-3 text-right md:px-4">
        <span className="ticker block whitespace-nowrap text-sm">
          {formatUsd(token.liquidityUsd)}
        </span>
      </td>
      <td className="px-3 py-3 text-right md:px-4">
        <span className="flex justify-end">
          <Timestamp iso={token.launchedAt} ms={token.launchedAtMs} />
        </span>
      </td>
      <td className="relative z-[2] px-3 py-3 text-right md:px-4">
        {token.tradeUrl ? (
          <a
            href={token.tradeUrl}
            target="_blank"
            rel="noreferrer"
            data-row-action=""
            className="text-[13px] font-semibold text-link hover:underline"
          >
            Trade
          </a>
        ) : (
          <a
            href={href}
            data-row-action=""
            className="text-[13px] font-semibold text-link hover:underline"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go();
            }}
          >
            Open
          </a>
        )}
      </td>
    </tr>
  );
}
