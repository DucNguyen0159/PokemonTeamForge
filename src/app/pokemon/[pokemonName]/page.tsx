import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPokemonByName } from "@/lib/services/pokemon-service";
import { PokemonAbilitySection } from "@/components/pokemon/pokemon-ability-section";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";

type PokemonDetailPageProps = {
  params: Promise<{ pokemonName: string }>;
};

function formatName(segment: string): string {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: PokemonDetailPageProps): Promise<Metadata> {
  const { pokemonName } = await params;
  if (!pokemonName) {
    return { title: "Pokémon" };
  }

  const label = formatName(pokemonName);
  return {
    title: `${label} | PokemonTeamForge`,
    description: `Pokédex-style details for ${label}. Team-building focused, lightweight view.`,
  };
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { pokemonName } = await params;

  if (!pokemonName) {
    notFound();
  }

  const pokemon = await getPokemonByName(pokemonName);

  if (!pokemon) {
    notFound();
  }

  const stats = [
    ["HP", pokemon.stats.hp],
    ["Attack", pokemon.stats.attack],
    ["Defense", pokemon.stats.defense],
    ["Sp. Atk", pokemon.stats.specialAttack],
    ["Sp. Def", pokemon.stats.specialDefense],
    ["Speed", pokemon.stats.speed],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pokémon
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {pokemon.name}
          </h1>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/pokedex">Back to Pokédex</Link>
        </Button>
      </div>

      <section className="grid gap-4 rounded-[2rem] border border-border/60 bg-card/50 p-5 shadow-sm md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:p-6">
        <div className="flex items-center justify-center rounded-3xl border border-border/50 bg-background/35 p-6">
          <PokemonSprite
            src={pokemon.spriteNormal}
            alt={pokemon.name}
            size={220}
            className="h-56 w-full object-contain"
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              National #{pokemon.id} · Generation {pokemon.generation} · {pokemon.region}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TypeBadge type={pokemon.primaryType} size="md" />
              {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} size="md" /> : null}
              {pokemon.isLegendaryOrMythical ? (
                <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-sm font-medium text-amber-200">
                  Legendary/Mythical
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/45 bg-background/35 px-3 py-2"
              >
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-primary/80">Total</p>
              <p className="mt-1 text-lg font-semibold text-primary">{pokemon.stats.total}</p>
            </div>
          </div>
        </div>
      </section>

      <PokemonAbilitySection abilities={pokemon.abilities} />

      <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Battle Moves</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing a compact move preview. Builder selection still uses the full compatible move list.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pokemon.moves.slice(0, 12).map((move) => (
            <div
              key={move.slug}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/45 bg-background/35 px-3 py-2"
            >
              <span className="truncate text-sm font-medium text-foreground">{move.name}</span>
              <TypeBadge type={move.type} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
