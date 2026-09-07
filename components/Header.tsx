"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { LINKS } from "@/lib/site";

const NAV = [{ href: "/tokens", label: "Collection" }];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/brand/eagle.png"
            alt="Deployr"
            width={26}
            height={26}
            className="size-[26px] object-cover"
            priority
          />
          <span className="text-[15px] font-semibold">Deployr</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-medium",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-ink"
                  : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={LINKS.docs}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-muted hover:text-ink"
          >
            Docs
          </a>
          <Link href="/tokens" className="btn-invert">
            Browse launches
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-1 text-[13px] font-medium",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-ink"
                    : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={LINKS.docs}
              target="_blank"
              rel="noreferrer"
              className="py-1 text-[13px] font-medium text-muted"
            >
              Docs
            </a>
            <Link href="/tokens" onClick={() => setOpen(false)} className="btn-invert mt-1 w-full">
              Browse launches
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
