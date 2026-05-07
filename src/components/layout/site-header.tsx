import Link from "next/link";

const NAV_ITEMS = [
  { href: "/builder", label: "Builder" },
  { href: "/pokedex", label: "Pokedex" },
  { href: "/strategies", label: "Strategies" },
  { href: "/team-card", label: "Team Card" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-wide text-slate-100">
          PokemonTeamForge
        </Link>

        <ul className="flex items-center gap-4 text-sm text-slate-300">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
