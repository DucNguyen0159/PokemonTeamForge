"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResilientLogout } from "@/hooks/use-resilient-logout";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "Builder" },
  { href: "/pokedex", label: "Pokedex" },
  { href: "/abilities", label: "Abilities" },
  { href: "/strategies", label: "Strategies" },
  { href: "/team-card", label: "Team Cards" },
];

export function SiteHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useAuthStore((state) => state.profile);
  const { isLoggingOut, runLogout } = useResilientLogout();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
          <Swords className="h-4 w-4 text-primary" aria-hidden />
          PokemonTeamForge
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <ul className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Button asChild variant="ghost" size="sm">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1 border-l border-border/60 pl-2 lg:border-l lg:pl-3">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/profile">{profile?.username || "Profile"}</Link>
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
                  {isLoggingOut ? "Signing out..." : "Log out"}
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
      </nav>
    </header>
  );
}
