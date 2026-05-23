import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Credits" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/support", label: "Support the site" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background/88">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:py-10">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-1 gap-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link, index) => (
              <li key={link.href} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="select-none text-border" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs leading-relaxed text-muted-foreground">
          © 2026 PokemonTeamForge. Not affiliated with Nintendo, Game Freak, Creatures, or The
          Pokémon Company.
        </p>
      </div>
    </footer>
  );
}
