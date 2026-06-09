import Link from "next/link";

import { getSiteConfig } from "@/lib/site/site-config";
import { INFO_FOOTER_LINKS } from "@/lib/site/info-nav";

export function SiteFooter() {
  const { githubRepoUrl } = getSiteConfig();

  return (
    <footer suppressHydrationWarning className="mt-auto border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-9">
        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          PokemonTeamForge is a fan-made team builder. Not affiliated with Nintendo, Game Freak,
          Creatures, or The Pokémon Company.
        </p>

        <nav aria-label="Footer" className="mt-5">
          <ul className="flex flex-wrap gap-x-1 gap-y-2 text-sm text-muted-foreground">
            {INFO_FOOTER_LINKS.map((link, index) => (
              <li key={link.href} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="select-none text-border/80" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label === "Support" ? "Support the site" : link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-5 flex flex-col gap-2 text-xs text-muted-foreground/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
          <span>© 2026 PokemonTeamForge</span>
          <span className="hidden text-border/60 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-muted-foreground"
          >
            Source on GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
