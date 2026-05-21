import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPokemonByName } from "@/lib/services/pokemon-service";
import { pokemonDetailNavigation } from "@/lib/pokemon/detail-navigation";
import {
  isPokedexReturnStored,
  parsePokedexReturnState,
} from "@/lib/pokemon/pokedex-return-url";
import { PokemonAbilitySection } from "@/components/pokemon/pokemon-ability-section";
import { PokemonBaseStatsTable } from "@/components/pokemon/pokemon-base-stats-table";
import { countEvolutionStages } from "@/lib/pokemon/evolution-chain";
import { PokemonDetailActions } from "@/components/pokemon/pokemon-detail-actions";
import { PokemonDetailBackLink } from "@/components/pokemon/pokemon-detail-back-link";
import { PokemonDetailRelatedLinks } from "@/components/pokemon/pokemon-detail-related-links";
import {
  hasAlternateFormsSection,
  PokemonAlternateForms,
} from "@/components/pokemon/pokemon-alternate-forms";
import { PokemonEvolutionChart } from "@/components/pokemon/pokemon-evolution-chart";
import { PokemonFormKindPill } from "@/components/pokemon/pokemon-form-kind-pill";
import { PokemonStabOffenseSummary } from "@/components/pokemon/pokemon-stab-offense-summary";
import { PokemonTypeDefenseGrid } from "@/components/pokemon/pokemon-type-defense-grid";
import { classifyPokemonFormFromSlug } from "@/lib/pokemon/pokemon-forms";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";

type PokemonDetailPageProps = {
  params: Promise<{ pokemonName: string }>;
  searchParams?: Promise<{
    from?: string | string[];
    ability?: string | string[];
    pokedexReturn?: string | string[];
    view?: string | string[];
    q?: string | string[];
    sort?: string | string[];
    dir?: string | string[];
    gen?: string | string[];
    type?: string | string[];
  }>;
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

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PokemonDetailPageProps) {
  const { pokemonName } = await params;
  const query = await searchParams;

  if (!pokemonName) {
    notFound();
  }

  const pokemon = await getPokemonByName(pokemonName);

  if (!pokemon) {
    notFound();
  }

  const resolvedQuery = query ?? {};
  const abilitySlug = Array.isArray(resolvedQuery.ability)
    ? resolvedQuery.ability[0]
    : resolvedQuery.ability;
  const navigationAbility = abilitySlug
    ? pokemon.abilities.find((ability) => ability.slug === abilitySlug)
    : null;
  const pokedexReturn = parsePokedexReturnState(resolvedQuery);
  const navigation = pokemonDetailNavigation({
    from: resolvedQuery.from,
    ability: resolvedQuery.ability,
    abilityName: navigationAbility?.name,
    pokedexReturn,
    pokedexReturnStored: isPokedexReturnStored(resolvedQuery),
  });

  const typeDefense = pokemon.typeDefense ?? [];
  const formKind =
    pokemon.formKind ?? classifyPokemonFormFromSlug(pokemon.slug).formKind;
  const baseSlug = pokemon.baseSlug ?? classifyPokemonFormFromSlug(pokemon.slug).baseSlug;
  const nationalDexNumber = pokemon.pokedexDisplayNo ?? pokemon.id;
  const showEvolutionSection =
    (pokemon.evolutionChain?.length ?? 0) > 0 &&
    countEvolutionStages(pokemon.evolutionChain ?? []) > 1;
  const showAlternateFormsSection = hasAlternateFormsSection(
    pokemon.alternateForms,
    pokemon.alternateFormsByKind,
  );

  const evolutionSection = (
    <PokemonEvolutionChart
      pokemonName={pokemon.name}
      currentSlug={pokemon.slug}
      formKind={formKind}
      baseSlug={baseSlug}
      evolutionChain={pokemon.evolutionChain}
      detailQuery={resolvedQuery}
    />
  );

  const alternateFormsSection = showAlternateFormsSection ? (
    <PokemonAlternateForms
      currentSlug={pokemon.slug}
      currentName={pokemon.name}
      currentFormKind={formKind}
      currentPrimaryType={pokemon.primaryType}
      currentSecondaryType={pokemon.secondaryType}
      currentSprite={pokemon.spriteNormal}
      currentTotal={pokemon.stats.total}
      alternateForms={pokemon.alternateForms}
      alternateFormsByKind={pokemon.alternateFormsByKind}
      detailQuery={resolvedQuery}
    />
  ) : null;

  const typeDefenseSection = (
    <PokemonTypeDefenseGrid pokemonName={pokemon.name} typeDefense={typeDefense} />
  );

  const stabSection = (
    <PokemonStabOffenseSummary
      primaryType={pokemon.primaryType}
      secondaryType={pokemon.secondaryType}
    />
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <PokemonDetailBackLink navigation={navigation} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pokémon
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {pokemon.name}
            </h1>
            <PokemonDetailRelatedLinks
              secondaryHref={navigation.secondaryHref}
              secondaryLabel={navigation.secondaryLabel}
            />
          </div>
          <PokemonDetailActions slug={pokemon.slug} />
        </div>
      </header>

      <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/50 p-5 shadow-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-6">
        <div className="flex items-center justify-center rounded-3xl border border-border/50 bg-background/35 p-6">
          <PokemonSprite
            src={pokemon.spriteNormal}
            alt={pokemon.name}
            size={220}
            className="h-56 w-full max-w-xs object-contain"
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              National #{String(nationalDexNumber).padStart(4, "0")} · Generation {pokemon.generation}{" "}
              · {pokemon.region}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TypeBadge type={pokemon.primaryType} size="md" />
              {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} size="md" /> : null}
              <PokemonFormKindPill formKind={formKind} />
              {pokemon.isLegendaryOrMythical ? (
                <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-sm font-medium text-amber-200">
                  Legendary/Mythical
                </span>
              ) : null}
              {!pokemon.isFullyEvolved ? (
                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-sm font-medium text-sky-200">
                  Can evolve
                </span>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Base stats</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Level 100 ranges assume 0 IV / 0 EV minimum and 31 IV / 252 EV with a beneficial nature
              maximum.
            </p>
            <div className="mt-3">
              <PokemonBaseStatsTable stats={pokemon.stats} />
            </div>
          </div>
        </div>
      </section>

      {showEvolutionSection ? evolutionSection : null}
      {alternateFormsSection}
      {typeDefenseSection}
      {stabSection}

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
