"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <p className="font-mono text-[12px] text-dim">Error</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Couldn’t load this page</h1>
      <p className="mt-3 text-[14px] leading-6 text-muted">
        The collection feed or this token failed to render.
      </p>
      <div className="mt-8 flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          Retry
        </button>
        <Link href="/" className="btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}
