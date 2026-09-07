import { CopyButton } from "@/components/CopyButton";
import { ChainMark } from "@/components/ChainLogo";
import { chainLabel } from "@/lib/chains";

export function ContractCard({
  address,
  symbol,
  chain,
  gmgnUrl,
  explorerUrl,
  tradeUrl,
}: {
  address: string;
  symbol: string;
  chain: string;
  gmgnUrl: string | null;
  explorerUrl: string | null;
  tradeUrl: string | null;
}) {
  return (
    <section className="well p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-on-well/55">Contract</p>
        <p className="flex items-center gap-2 text-[12px] text-on-well/45">
          <ChainMark chain={chain} size={14} />
          <span>${symbol}</span>
        </p>
      </div>
      <p className="hash mt-2" title={address}>
        {address}
      </p>
      <p className="mt-1.5 text-[11px] text-on-well/40">
        {chainLabel(chain)} · verify this address before you trade
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton value={address} label="Copy" className="btn-invert btn-sm" />
        {tradeUrl ? (
          <a href={tradeUrl} target="_blank" rel="noreferrer" className="btn-ghost-well btn-sm">
            Trade
          </a>
        ) : null}
        {gmgnUrl ? (
          <a href={gmgnUrl} target="_blank" rel="noreferrer" className="btn-ghost-well btn-sm">
            GMGN
          </a>
        ) : null}
        {explorerUrl ? (
          <a href={explorerUrl} target="_blank" rel="noreferrer" className="btn-ghost-well btn-sm">
            Explorer
          </a>
        ) : null}
      </div>
    </section>
  );
}
