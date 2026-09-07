import Link from "next/link";
import { ChainLogo } from "@/components/ChainLogo";
import { CopyButton } from "@/components/CopyButton";
import { LaunchCase, HeroBrand, TweetToTokenRow } from "@/components/HomeLaunch";
import { fetchTokens } from "@/lib/api";
import { hasMarketQuote } from "@/lib/market";
import { LINKS } from "@/lib/site";

export const revalidate = 15;

const NETWORKS = [
  { id: "robinhood" as const, label: "Robinhood" },
  { id: "solana" as const, label: "Solana" },
  { id: "base" as const, label: "Base" },
  { id: "eth" as const, label: "Ethereum" },
];

export default async function HomePage() {
  let tokens: Awaited<ReturnType<typeof fetchTokens>> | null = null;
  try {
    tokens = await fetchTokens(24);
  } catch {
    tokens = null;
  }

  const total = tokens?.total ?? 0;
  const listed = (tokens?.tokens ?? []).filter(hasMarketQuote);
  const latest = listed[0] ?? null;
  const rest = listed.slice(1, 9);

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-8 md:pt-14 md:pb-12">
          <div className="flex items-start gap-5 sm:gap-8">
            <div className="min-w-0 flex-1">
              <h1 className="max-w-2xl text-[2rem] font-semibold leading-[1.12] tracking-tight md:text-[2.75rem]">
                You tweet the ticker on X.
                <span className="mt-1 block">
                  Deployr deploys the <span className="text-volt">token</span>.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
                No app. No wallet. Post the name and the chain in public. We pay the
                gas from a prepaid treasury and list the coin here. Take is 0%.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link href="/tokens" className="btn-primary">
                  Tokens born from tweets
                </Link>
                {latest?.sourceTweetUrl ? (
                  <a href={latest.sourceTweetUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                    See a real tweet
                  </a>
                ) : (
                  <a href={LINKS.docs} target="_blank" rel="noreferrer" className="btn-secondary">
                    How to tweet a launch
                  </a>
                )}
              </div>
              {total ? (
                <p className="ticker mt-4 font-mono text-[12px] text-volt">
                  {total.toLocaleString("en-US")} tokens launched this way
                </p>
              ) : null}
            </div>
            <HeroBrand />
          </div>
        </div>
      </section>

      {latest ? (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-8 md:py-10">
            <LaunchCase token={latest} />
          </div>
        </section>
      ) : null}

      <section className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
          <p className="text-[13px] text-muted">Settles on</p>
          {NETWORKS.map((n) => (
            <span key={n.id} className="inline-flex items-center gap-2 text-[13px] font-medium">
              <ChainLogo chain={n.id} size={16} />
              {n.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Tweets that became tokens</h2>
            <p className="mt-1 text-[13px] text-muted">Newest first. Left is the post. Right is the coin.</p>
          </div>
          <Link href="/tokens" className="text-[13px] font-semibold text-link hover:underline">
            Full collection
          </Link>
        </div>
        {rest.length ? (
          <div className="sheet overflow-hidden">
            {rest.map((token, index) => (
              <TweetToTokenRow key={token.tokenId} token={token} priority={index < 8} />
            ))}
          </div>
        ) : (
          <div className="sheet px-5 py-16 text-center text-sm text-muted">
            The feed is quiet for a moment. Try again shortly.
          </div>
        )}
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            Building on this? Same JSON the site reads —{" "}
            <span className="font-mono">GET /v1/tokens</span>
          </p>
          <div className="flex gap-4">
            <CopyButton
              value={`${LINKS.tokensFeed}?limit=20`}
              className="text-[13px] font-semibold text-link hover:underline"
            />
            <a href={LINKS.docs} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-muted hover:text-ink">
              Docs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
