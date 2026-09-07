import { IPFS_GATEWAYS, isIpfsCid } from "@/lib/media";

export const runtime = "nodejs";
export const revalidate = 86400;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const MAX_BYTES = 1_500_000;

type CachedImage = { body: ArrayBuffer; type: string };
const memory = new Map<string, CachedImage>();
const inflight = new Map<string, Promise<CachedImage>>();

async function fetchOne(base: string, cid: string, timeoutMs: number, parent: AbortSignal) {
  const res = await fetch(`${base}${cid}`, {
    signal: AbortSignal.any([parent, AbortSignal.timeout(timeoutMs)]),
    headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8", "User-Agent": UA },
  });
  if (!res.ok) throw new Error(String(res.status));
  const type = res.headers.get("content-type") ?? "application/octet-stream";
  if (!type.startsWith("image/") && type !== "application/octet-stream") {
    throw new Error(type);
  }
  const body = await res.arrayBuffer();
  if (body.byteLength < 24 || body.byteLength > MAX_BYTES) throw new Error("size");
  return { body, type: type.startsWith("image/") ? type : "image/jpeg" };
}

async function fetchFromGateways(cid: string): Promise<CachedImage> {
  const ac = new AbortController();
  try {
    const image = await Promise.any(
      IPFS_GATEWAYS.map((gw) => fetchOne(gw.base, cid, gw.timeoutMs, ac.signal)),
    );
    ac.abort();
    return image;
  } finally {
    if (!ac.signal.aborted) ac.abort();
  }
}

function loadImage(cid: string) {
  const hit = memory.get(cid);
  if (hit) return Promise.resolve(hit);

  let pending = inflight.get(cid);
  if (!pending) {
    pending = fetchFromGateways(cid)
      .then((image) => {
        if (memory.size > 400) {
          const first = memory.keys().next().value;
          if (first) memory.delete(first);
        }
        memory.set(cid, image);
        inflight.delete(cid);
        return image;
      })
      .catch((error) => {
        inflight.delete(cid);
        throw error;
      });
    inflight.set(cid, pending);
  }
  return pending;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cid: string }> },
) {
  const { cid: raw } = await params;
  const cid = decodeURIComponent(raw);
  if (!isIpfsCid(cid)) {
    return new Response("Invalid CID", { status: 400 });
  }

  try {
    const image = await loadImage(cid);
    return new Response(image.body.slice(0), {
      headers: {
        "Content-Type": image.type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Image unavailable", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
