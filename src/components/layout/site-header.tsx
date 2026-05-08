import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "Builder" },
  { href: "/pokedex", label: "Pokedex" },
  { href: "/strategies", label: "Strategies" },
  { href: "/team-card", label: "Team Card" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
          <Swords className="h-4 w-4 text-primary" aria-hidden />
          PokemonTeamForge
        </Link>

        <ul className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Button asChild variant="ghost" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
