import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/brand/eagle.png"
              alt=""
              width={22}
              height={22}
              className="size-[22px] object-cover"
            />
            <span className="text-sm font-semibold">Deployr</span>
          </Link>
          <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted">
            Treasury-funded launches on Robinhood Chain, Solana, Base, and Ethereum.
            Prepaid from the protocol. Zero markup.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-dim">Product</p>
          <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-muted">
            <Link href="/tokens" className="hover:text-ink">
              Collection
            </Link>
            <a href={LINKS.docs} target="_blank" rel="noreferrer" className="hover:text-ink">
              Documentation
            </a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-dim">Developers</p>
          <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-muted">
            <a href={LINKS.tokensFeed} target="_blank" rel="noreferrer" className="hash">
              GET /v1/tokens
            </a>
            <a href={LINKS.docs} target="_blank" rel="noreferrer" className="hover:text-ink">
              Partner API
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 font-mono text-[11px] text-dim sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Deployr</p>
          <p>Quotes via GMGN · Robinhood · Solana · Base · Ethereum</p>
        </div>
      </div>
    </footer>
  );
}
