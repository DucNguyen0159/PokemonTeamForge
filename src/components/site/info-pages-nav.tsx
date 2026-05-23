"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { INFO_LEGAL_LINKS, INFO_PAGE_LINKS } from "@/lib/site/info-nav";
import { cn } from "@/utils";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-card/55 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function InfoPagesNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Site information" className={className}>
      <p className="mb-2 hidden px-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground lg:block">
        Information
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {INFO_PAGE_LINKS.map((item) => (
          <li key={item.href} className="shrink-0 lg:shrink">
            <NavLink href={item.href} label={item.label} />
          </li>
        ))}
      </ul>
      <p className="mb-2 mt-4 hidden px-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground lg:block">
        Legal
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {INFO_LEGAL_LINKS.map((item) => (
          <li key={item.href} className="shrink-0 lg:shrink">
            <NavLink href={item.href} label={item.label} />
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden border-t border-border/60 pt-4 lg:block">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground"
        >
          ← Back to app
        </Link>
      </div>
    </nav>
  );
}
