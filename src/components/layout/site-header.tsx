"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { useResilientLogout } from "@/hooks/use-resilient-logout";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "Builder" },
  { href: "/champions", label: "Champions" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/abilities", label: "Abilities" },
  { href: "/strategies", label: "Strategies" },
  { href: "/team-card", label: "Team Cards" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useAuthStore((state) => state.profile);
  const { isLoggingOut, logoutButtonLabel, runLogout } = useResilientLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <BrandMark />

        <div className="hidden flex-1 flex-wrap items-center justify-end gap-2 lg:flex">
          <ul className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-xl transition-colors",
                    isActivePath(pathname, item.href) &&
                      "border border-primary/25 bg-primary/10 text-primary",
                  )}
                >
                  <Link href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1 border-l border-border/60 pl-2 lg:border-l lg:pl-3">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href="/profile"
                    className={cn(
                      "rounded-xl",
                      isActivePath(pathname, "/profile") &&
                        "border border-primary/25 bg-primary/10 text-primary",
                    )}
                  >
                    {profile?.username || "Profile"}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    void runLogout();
                  }}
                  disabled={isLoggingOut}
                >
                  {logoutButtonLabel}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-site-navigation"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        >
          {isMenuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
        </Button>
      </nav>

      {isMenuOpen ? (
        <div
          id="mobile-site-navigation"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/70 bg-background/96 px-4 py-3 shadow-xl shadow-black/20 lg:hidden"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isActivePath(pathname, item.href) &&
                    "border-primary/30 bg-primary/10 text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-border/60 pt-3">
              {isAuthenticated ? (
                <div className="grid gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "rounded-xl border border-border/60 bg-card/45 px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActivePath(pathname, "/profile") && "border-primary/35 bg-primary/10 text-primary",
                    )}
                  >
                    {profile?.username || "Profile"}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start rounded-xl"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void runLogout();
                    }}
                    disabled={isLoggingOut}
                  >
                    {logoutButtonLabel}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="ghost" size="sm" className="rounded-xl">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-xl">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
