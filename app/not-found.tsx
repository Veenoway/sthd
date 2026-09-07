import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <p className="font-mono text-[12px] text-dim">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">This token isn’t here</h1>
      <p className="mt-3 text-[14px] leading-6 text-muted">
        Nothing at this address. The collection is still live.
      </p>
      <Link href="/tokens" className="btn-primary mt-8">
        View collection
      </Link>
    </div>
  );
}
