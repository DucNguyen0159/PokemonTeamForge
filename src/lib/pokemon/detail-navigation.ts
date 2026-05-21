import {
  buildPokedexHref,
  hasPokedexReturnFilters,
  type PokedexExplorerReturnState,
} from "@/lib/pokemon/pokedex-return-url";

type PokemonDetailSource = "abilities" | "pokedex" | "builder";

type PokemonDetailNavigationInput = {
  from?: string | string[] | null;
  ability?: string | string[] | null;
  abilityName?: string | null;
  pokedexReturn?: PokedexExplorerReturnState | null;
  pokedexReturnStored?: boolean;
};

export type PokemonDetailNavigation = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  pokedexReturnStored: boolean;
};

function firstQueryValue(value: string | string[] | null | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeAbilitySlug(value: string | string[] | null | undefined): string {
  const slug = firstQueryValue(value).trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(slug) ? slug : "";
}

function sourceFromQuery(value: string | string[] | null | undefined): PokemonDetailSource | null {
  const source = firstQueryValue(value).trim().toLowerCase();
  return source === "abilities" || source === "pokedex" || source === "builder" ? source : null;
}

export function pokemonDetailNavigation({
  from,
  ability,
  abilityName,
  pokedexReturn,
  pokedexReturnStored = false,
}: PokemonDetailNavigationInput): PokemonDetailNavigation {
  const source = sourceFromQuery(from);
  const abilitySlug = safeAbilitySlug(ability);
  const labelAbilityName = abilityName?.trim();
  const abilityQuery = abilitySlug ? `?ability=${encodeURIComponent(abilitySlug)}` : "";
  const returnState = pokedexReturn ?? {};

  if (source === "abilities") {
    return {
      primaryHref: `/abilities${abilityQuery}`,
      primaryLabel: labelAbilityName ? `Back to ${labelAbilityName}` : "Back to Abilities",
      secondaryHref: "/pokedex",
      secondaryLabel: "Open Pokédex",
      pokedexReturnStored: false,
    };
  }

  if (source === "builder") {
    return {
      primaryHref: "/builder",
      primaryLabel: "Back to Builder",
      secondaryHref: "/pokedex",
      secondaryLabel: "Open Pokédex",
      pokedexReturnStored: false,
    };
  }

  if (source === "pokedex") {
    const mergedReturnState: PokedexExplorerReturnState = {
      ...returnState,
      ...(abilitySlug && !returnState.ability ? { ability: abilitySlug } : {}),
    };
    const linkedAbilitySlug = mergedReturnState.ability ?? abilitySlug;

    return {
      primaryHref: pokedexReturnStored ? "/pokedex" : buildPokedexHref(mergedReturnState),
      primaryLabel: hasPokedexReturnFilters(mergedReturnState)
        ? "Back to Filtered Pokédex"
        : "Back to Pokédex",
      secondaryHref: linkedAbilitySlug
        ? `/abilities?ability=${encodeURIComponent(linkedAbilitySlug)}`
        : "/abilities",
      secondaryLabel: linkedAbilitySlug ? "View Ability Detail" : "Open Abilities",
      pokedexReturnStored,
    };
  }

  return {
    primaryHref: "/pokedex",
    primaryLabel: "Back to Pokédex",
    secondaryHref: "/abilities",
    secondaryLabel: "Open Abilities",
    pokedexReturnStored: false,
  };
}
