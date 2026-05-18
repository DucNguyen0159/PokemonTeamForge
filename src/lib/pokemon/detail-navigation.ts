type PokemonDetailSource = "abilities" | "pokedex";

type PokemonDetailNavigationInput = {
  from?: string | string[] | null;
  ability?: string | string[] | null;
  abilityName?: string | null;
};

export type PokemonDetailNavigation = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
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
  return source === "abilities" || source === "pokedex" ? source : null;
}

export function pokemonDetailNavigation({
  from,
  ability,
  abilityName,
}: PokemonDetailNavigationInput): PokemonDetailNavigation {
  const source = sourceFromQuery(from);
  const abilitySlug = safeAbilitySlug(ability);
  const labelAbilityName = abilityName?.trim();
  const abilityQuery = abilitySlug ? `?ability=${encodeURIComponent(abilitySlug)}` : "";

  if (source === "abilities") {
    return {
      primaryHref: `/abilities${abilityQuery}`,
      primaryLabel: labelAbilityName ? `Back to ${labelAbilityName}` : "Back to Abilities",
      secondaryHref: "/pokedex",
      secondaryLabel: "Open Pokédex",
    };
  }

  return {
    primaryHref: `/pokedex${source === "pokedex" ? abilityQuery : ""}`,
    primaryLabel: source === "pokedex" && abilitySlug ? "Back to Filtered Pokédex" : "Back to Pokédex",
    secondaryHref: abilitySlug ? `/abilities?ability=${encodeURIComponent(abilitySlug)}` : "/abilities",
    secondaryLabel: abilitySlug ? "View Ability Detail" : "Open Abilities",
  };
}
