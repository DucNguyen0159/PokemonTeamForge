import Link from "next/link";

type PokemonDetailRelatedLinksProps = {
  secondaryHref: string;
  secondaryLabel: string;
};

export function PokemonDetailRelatedLinks({
  secondaryHref,
  secondaryLabel,
}: PokemonDetailRelatedLinksProps) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
      <Link
        href={secondaryHref}
        className="rounded-lg border border-border/45 bg-background/35 px-2 py-1 font-medium text-primary/90 underline-offset-4 transition-colors hover:bg-foreground/10 hover:text-primary hover:underline sm:px-2.5"
      >
        {secondaryLabel}
      </Link>
      <Link
        href="/builder"
        className="rounded-lg border border-border/45 bg-background/35 px-2 py-1 transition-colors hover:bg-foreground/10 hover:text-foreground hover:underline underline-offset-4 sm:px-2.5"
      >
        Builder
      </Link>
      <Link
        href="/pokedex"
        className="rounded-lg border border-border/45 bg-background/35 px-2 py-1 transition-colors hover:bg-foreground/10 hover:text-foreground hover:underline underline-offset-4 sm:px-2.5"
      >
        Pokédex
      </Link>
    </p>
  );
}
