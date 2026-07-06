"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";

import { CHAMPIONS_SUBNAV_GROUPS, CHAMPIONS_SUBNAV_ITEMS } from "@/data/champions";
import { cn } from "@/utils";

function isActivePath(pathname: string, searchParams: URLSearchParams, href: string): boolean {
  if (href.includes("?tab=plans")) {
    return pathname.startsWith("/champions/builder") && searchParams.get("tab") === "plans";
  }
  if (href === "/champions") {
    return pathname === "/champions";
  }
  if (href === "/champions/builder") {
    return pathname.startsWith("/champions/builder") && searchParams.get("tab") !== "plans";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ChampionsSubnavDesktop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const links = itemRefs.current.filter(Boolean) as HTMLAnchorElement[];
      const currentIndex = links.findIndex((link) => link === document.activeElement);
      if (currentIndex === -1) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        links[(currentIndex + 1) % links.length]?.focus();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        links[(currentIndex - 1 + links.length) % links.length]?.focus();
      }
    },
    [],
  );

  let flatIndex = 0;

  return (
    <aside className="sticky top-[4.8rem] z-20 hidden max-h-[calc(100dvh-5.5rem)] w-64 shrink-0 overflow-y-auto rounded-2xl border border-border/60 bg-card/70 p-3 lg:block">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Champions Menu
      </p>
      <nav
        ref={navRef}
        aria-label="Champions sections"
        className="space-y-3"
        onKeyDown={handleKeyDown}
      >
        {CHAMPIONS_SUBNAV_GROUPS.map((group) => {
          const items = CHAMPIONS_SUBNAV_ITEMS.filter((item) => item.group === group.id);
          return (
            <div key={group.id}>
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </p>
              <div className="grid gap-1">
                {items.map((item) => {
                  const active = isActivePath(pathname, searchParams, item.href);
                  const index = flatIndex++;
                  return (
                    <Link
                      key={item.href}
                      ref={(element) => {
                        itemRefs.current[index] = element;
                      }}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      tabIndex={active ? 0 : -1}
                      className={cn(
                        "rounded-xl border border-transparent px-3 py-2.5 transition-colors",
                        "hover:border-border/60 hover:bg-background/45",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        active && "border-primary/30 bg-primary/10",
                      )}
                    >
                      <p className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function ChampionsSubnavMobile() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav
      aria-label="Champions sections"
      className="sticky top-[3.95rem] z-30 -mx-4 overflow-x-auto border-b border-border/60 bg-background/92 px-4 py-2 backdrop-blur lg:hidden"
    >
      <div className="flex min-w-max items-center gap-2">
        {CHAMPIONS_SUBNAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, searchParams, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/60 text-muted-foreground",
              )}
            >
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
