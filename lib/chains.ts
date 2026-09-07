export type ChainKey = "robinhood" | "solana" | "base" | "eth" | "ethereum";

export const CHAIN_META: Record<
  string,
  { label: string; name: string; short: string; tone: string }
> = {
  robinhood: { label: "Robinhood Chain", name: "Robinhood", short: "HOOD", tone: "hood" },
  solana: { label: "Solana", name: "Solana", short: "SOL", tone: "sol" },
  base: { label: "Base", name: "Base", short: "BASE", tone: "base" },
  eth: { label: "Ethereum", name: "Ethereum", short: "ETH", tone: "eth" },
  ethereum: { label: "Ethereum", name: "Ethereum", short: "ETH", tone: "eth" },
};

export const CHAIN_FILTERS = [
  { id: "all", label: "All" },
  { id: "robinhood", label: "Robinhood" },
  { id: "solana", label: "Solana" },
  { id: "base", label: "Base" },
  { id: "eth", label: "Ethereum" },
] as const;

export function chainParam(chain: string | null | undefined) {
  if (!chain || chain === "all") return null;
  const key = chain.toLowerCase();
  if (key === "ethereum") return "eth";
  return key;
}

export function chainLabel(chain: string | null | undefined) {
  if (!chain) return "Unknown";
  return CHAIN_META[chain.toLowerCase()]?.label ?? chain;
}

export function chainName(chain: string | null | undefined) {
  if (!chain) return "Unknown";
  return CHAIN_META[chain.toLowerCase()]?.name ?? chainLabel(chain);
}

export function chainShort(chain: string | null | undefined) {
  if (!chain) return "—";
  return CHAIN_META[chain.toLowerCase()]?.short ?? chain.toUpperCase();
}

export function chainTone(chain: string | null | undefined) {
  if (!chain) return "eth";
  return CHAIN_META[chain.toLowerCase()]?.tone ?? "eth";
}
