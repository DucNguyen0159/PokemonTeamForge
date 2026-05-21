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
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <Link
        href={secondaryHref}
        className="font-medium text-primary/90 underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        {secondaryLabel}
      </Link>
      <span className="text-border/80" aria-hidden>
        ·
      </span>
      <Link
        href="/builder"
        className="transition-colors hover:text-foreground hover:underline underline-offset-4"
      >
        Builder
      </Link>
      <span className="text-border/80" aria-hidden>
        ·
      </span>
      <Link
        href="/pokedex"
        className="transition-colors hover:text-foreground hover:underline underline-offset-4"
      >
        Pokédex
      </Link>
    </p>
  );
}
