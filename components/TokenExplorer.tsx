"use client";

import { useMemo, useRef, useState } from "react";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenTable } from "@/components/TokenTable";
import { CHAIN_FILTERS, chainParam } from "@/lib/chains";
import { cn } from "@/lib/cn";
import { hasMarketQuote } from "@/lib/market";
import type { Token } from "@/lib/types";

type FeedPage = {
  tokens: Token[];
  nextCursor: string | number | null;
  total: number;
};

export function TokenExplorer({
  initialTokens,
  initialCursor,
  total: initialTotal,
}: {
  initialTokens: Token[];
  initialCursor: string | number | null;
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState("all");
  const [tokens, setTokens] = useState(initialTokens);
  const [cursor, setCursor] = useState(initialCursor);
  const [total, setTotal] = useState(initialTotal);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => {
      const quotedOk = chain !== "all" || hasMarketQuote(token);
      if (!quotedOk) return false;
      if (!q) return true;
      return (
        token.name.toLowerCase().includes(q) ||
        token.symbol.toLowerCase().includes(q) ||
        token.tokenId.toLowerCase().includes(q) ||
        (token.creator?.handle ?? "").toLowerCase().includes(q)
      );
    });
  }, [tokens, query, chain]);

  async function loadFeed(nextChain: string, nextCursor: string | number | null, append: boolean) {
    const id = ++requestId.current;
    setPending(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "80" });
      const chainKey = chainParam(nextChain);
      if (chainKey) params.set("chain", chainKey);
      if (nextCursor != null) params.set("cursor", String(nextCursor));

      const res = await fetch(`/api/tokens?${params.toString()}`);
      if (!res.ok) throw new Error("Could not load more launches");
      const data = (await res.json()) as FeedPage;
      if (id !== requestId.current) return;

      setTokens((prev) => {
        if (!append) return data.tokens;
        const seen = new Set(prev.map((t) => t.tokenId));
        return [...prev, ...data.tokens.filter((t) => !seen.has(t.tokenId))];
      });
      setCursor(data.nextCursor);
      setTotal(data.total);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      if (id === requestId.current) setPending(false);
    }
  }

  function selectChain(id: string) {
    if (id === chain) return;
    setChain(id);
    setQuery("");
    setTokens([]);
    setCursor(null);
    void loadFeed(id, null, false);
  }

  function loadMore() {
    if (cursor == null || pending) return;
    void loadFeed(chain, cursor, true);
  }

  const quotedView = chain === "all";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CHAIN_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectChain(item.id)}
              className={cn("chip", chain === item.id && "chip-on")}
            >
              {item.id !== "all" ? <ChainLogo chain={item.id} size={16} labeled={false} /> : null}
              {item.label}
            </button>
          ))}
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search launches</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker, name, creator…"
            className="field w-full px-4 py-2.5 text-sm placeholder:text-dim"
          />
        </label>
      </div>

      <p className="mt-4 font-mono text-[11px] text-dim">
        Showing {visible.length}
        {quotedView ? " with market data" : ""}
        {total ? ` · ${total.toLocaleString("en-US")} launched` : ""}
        {pending ? " · loading" : ""}
      </p>

      <div className="mt-4">
        {pending && tokens.length === 0 ? (
          <div className="sheet px-5 py-20 text-center text-sm text-muted">Loading launches…</div>
        ) : (
          <TokenTable tokens={visible} numbered={!query} />
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-down">{error}</p> : null}

      {cursor != null ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="btn-secondary disabled:opacity-50"
          >
            {pending ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
