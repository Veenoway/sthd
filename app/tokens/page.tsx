import { TokenExplorer } from "@/components/TokenExplorer";
import { fetchTokens } from "@/lib/api";
import type { Metadata } from "next";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Collection",
  description: "Live index of every memecoin deployed through Deployr.",
};

export default async function TokensPage() {
  let data = {
    tokens: [] as Awaited<ReturnType<typeof fetchTokens>>["tokens"],
    nextCursor: null as string | number | null,
    total: 0,
  };
  let feedError = false;
  try {
    data = await fetchTokens(80);
  } catch {
    feedError = true;
  }

  return (
    <div className="pb-16">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <h1 className="text-xl font-semibold tracking-tight">Collection</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-6 text-muted">
            Every token Deployr has deployed. Newest first. Open a row for the
            contract, market, and origin.
          </p>
          <p className="ticker mt-3 text-[13px] text-dim">
            <span className="font-semibold text-volt">
              {data.total ? data.total.toLocaleString("en-US") : "—"}
            </span>{" "}
            launches
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-5">
        {feedError ? (
          <p className="mb-4 text-sm text-down">The collection feed is unreachable right now.</p>
        ) : null}
        <TokenExplorer
          initialTokens={data.tokens}
          initialCursor={data.nextCursor}
          total={data.total}
        />
      </div>
    </div>
  );
}
