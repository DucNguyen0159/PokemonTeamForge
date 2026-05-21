import type { EvolutionStage } from "@/types/pokemon";
import type { PokemonType } from "@/types/shared";

export type EvolutionStageMeta = {
  pokemonId: number;
  name: string;
  slug: string;
  spriteNormal: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
};

export type PokeApiEvolutionChainNode = {
  species: { name: string };
  evolves_to?: PokeApiEvolutionChainNode[];
};

const POKEMON_TYPES = new Set<string>([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

function formatSpeciesName(speciesSlug: string): string {
  return speciesSlug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function asPokemonType(value: unknown): PokemonType {
  const normalized = String(value ?? "normal").toLowerCase();
  return POKEMON_TYPES.has(normalized) ? (normalized as PokemonType) : "normal";
}

function isEvolutionStage(value: unknown): value is EvolutionStage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const stage = value as EvolutionStage;
  return (
    typeof stage.pokemonId === "number" &&
    typeof stage.name === "string" &&
    typeof stage.slug === "string" &&
    typeof stage.spriteNormal === "string" &&
    typeof stage.speciesSlug === "string" &&
    typeof stage.primaryType === "string"
  );
}

export function parseEvolutionChainId(chainUrl: string | null | undefined): number | null {
  if (!chainUrl) {
    return null;
  }

  const match = String(chainUrl).match(/evolution-chain\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

export function normalizeEvolutionNode(
  node: PokeApiEvolutionChainNode,
  resolveMeta: (speciesSlug: string) => EvolutionStageMeta | null,
): EvolutionStage {
  const speciesSlug = node.species.name;
  const meta = resolveMeta(speciesSlug);

  return {
    speciesSlug,
    pokemonId: meta?.pokemonId ?? 0,
    name: meta?.name ?? formatSpeciesName(speciesSlug),
    slug: meta?.slug ?? speciesSlug,
    spriteNormal: meta?.spriteNormal ?? "",
    primaryType: meta?.primaryType ?? "normal",
    secondaryType: meta?.secondaryType ?? null,
    evolvesTo: (node.evolves_to ?? []).map((child) => normalizeEvolutionNode(child, resolveMeta)),
  };
}

export function buildEvolutionRootsFromPokeApiChain(
  chainRoot: PokeApiEvolutionChainNode,
  resolveMeta: (speciesSlug: string) => EvolutionStageMeta | null,
): EvolutionStage[] {
  return [normalizeEvolutionNode(chainRoot, resolveMeta)];
}

export function parseStoredEvolutionChain(chainJson: unknown): EvolutionStage[] {
  if (!Array.isArray(chainJson)) {
    return [];
  }

  return chainJson.filter(isEvolutionStage);
}

export function findStageBySlug(stages: EvolutionStage[], slug: string): EvolutionStage | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  function walk(stage: EvolutionStage): EvolutionStage | null {
    if (stage.slug === normalized || stage.speciesSlug === normalized) {
      return stage;
    }

    for (const child of stage.evolvesTo ?? []) {
      const match = walk(child);
      if (match) {
        return match;
      }
    }

    return null;
  }

  for (const root of stages) {
    const match = walk(root);
    if (match) {
      return match;
    }
  }

  return null;
}

/** Stored chains are rooted at the family base; return roots for UI rendering. */
export function getDisplayEvolutionChain(stages: EvolutionStage[]): EvolutionStage[] {
  return stages;
}

export function countEvolutionStages(stages: EvolutionStage[]): number {
  let count = 0;

  function walk(stage: EvolutionStage) {
    count += 1;
    for (const child of stage.evolvesTo ?? []) {
      walk(child);
    }
  }

  for (const root of stages) {
    walk(root);
  }

  return count;
}

export function evolutionStageMetaFromPokemonRow(row: {
  id: number;
  slug: string;
  name: string;
  species_slug: string;
  primary_type: string;
  secondary_type?: string | null;
  sprite_normal_url?: string | null;
}): EvolutionStageMeta {
  return {
    pokemonId: row.id,
    name: row.name,
    slug: row.slug,
    spriteNormal: row.sprite_normal_url ?? "",
    primaryType: asPokemonType(row.primary_type),
    secondaryType: row.secondary_type ? asPokemonType(row.secondary_type) : null,
  };
}

export function collectSpeciesSlugsFromPokeApiChain(node: PokeApiEvolutionChainNode): string[] {
  const slugs = [node.species.name];

  for (const child of node.evolves_to ?? []) {
    slugs.push(...collectSpeciesSlugsFromPokeApiChain(child));
  }

  return slugs;
}

export function buildSpeciesMetaMap(
  rows: Array<{
    id: number;
    slug: string;
    name: string;
    species_slug: string;
    primary_type: string;
    secondary_type?: string | null;
    sprite_normal_url?: string | null;
  }>,
): Map<string, EvolutionStageMeta> {
  const map = new Map<string, EvolutionStageMeta>();

  for (const row of rows) {
    const meta = evolutionStageMetaFromPokemonRow(row);
    map.set(row.species_slug, meta);
    map.set(row.slug, meta);
  }

  return map;
}
