const CID_RE =
  /(?:ipfs:\/\/|\/ipfs\/)(bafy[a-z0-9]{20,}|bafk[a-z0-9]{20,}|Qm[1-9A-HJ-NP-Za-km-z]{44})/i;

export const IPFS_CID_RE =
  /^(bafy[a-z0-9]{20,}|bafk[a-z0-9]{20,}|Qm[1-9A-HJ-NP-Za-km-z]{44})$/i;

export const IPFS_GATEWAYS = [
  { base: "https://ipfs.filebase.io/ipfs/", timeoutMs: 2000 },
  { base: "https://gateway.pinata.cloud/ipfs/", timeoutMs: 8000 },
] as const;

export function isIpfsCid(value: string | null | undefined): value is string {
  return Boolean(value && IPFS_CID_RE.test(value));
}

export function ipfsCid(url: string | null | undefined): string | null {
  if (!url) return null;
  if (isIpfsCid(url)) return url;
  const match = url.match(CID_RE);
  return match?.[1] ?? null;
}

export function pinataUrl(cid: string) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export function filebaseUrl(cid: string) {
  return `https://ipfs.filebase.io/ipfs/${cid}`;
}

export function localImagePath(cid: string) {
  return `/api/img/${encodeURIComponent(cid)}`;
}

function isCdnUrl(url: string) {
  return (
    url.includes("cdn.printr.money") ||
    url.includes("gmgn.ai") ||
    url.includes("printr.money")
  );
}

export function resolveTokenImages(input: {
  imageUrl?: string | null;
  imageUrlFallback?: string | null;
  imageCid?: string | null;
  marketImageUrl?: string | null;
}): { imageUrl: string | null; imageUrlFallback: string | null } {
  const cid =
    (isIpfsCid(input.imageCid) ? input.imageCid : null) ??
    ipfsCid(input.imageUrl) ??
    ipfsCid(input.imageUrlFallback) ??
    ipfsCid(input.marketImageUrl);

  const http = [input.imageUrl, input.imageUrlFallback, input.marketImageUrl].filter(
    (url): url is string => Boolean(url) && !ipfsCid(url),
  );
  const cdn = http.find(isCdnUrl) ?? http[0] ?? null;

  if (cid) {
    return {
      imageUrl: cdn ?? filebaseUrl(cid),
      imageUrlFallback: cdn ? filebaseUrl(cid) : pinataUrl(cid),
    };
  }

  return {
    imageUrl: http[0] ?? null,
    imageUrlFallback: http[1] ?? null,
  };
}
