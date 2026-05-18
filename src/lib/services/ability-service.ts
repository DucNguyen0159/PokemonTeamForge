import "server-only";

import { createClient } from "@supabase/supabase-js";

import { abilityTagsForSlug } from "@/data/ability-tags";
import {
  HIDDEN_ABILITY_LABEL,
  type AbilityDetail,
  type AbilityListItem,
  type AbilityPokemonReference,
  type AbilityTag,
} from "@/types/ability";
import type { PokemonType } from "@/types/shared";

type AbilityRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

type AbilityPokemonJoinRow = {
  is_hidden: boolean;
  pokemon: PokemonReferenceRow | PokemonReferenceRow[] | null;
};

type PokemonReferenceRow = {
  id: number;
  slug: string;
  name: string;
  primary_type: PokemonType;
  secondary_type: PokemonType | null;
  sprite_normal_url: string | null;
};

export interface AbilityListQuery {
  search?: string;
  tag?: AbilityTag;
  limit?: number;
}

const DEFAULT_ABILITY_LIMIT = 500;
const FALLBACK_ABILITIES: AbilityListItem[] = [
  {
    id: 22,
    name: "Intimidate",
    slug: "intimidate",
    description: "Lowers opposing Attack on switch-in.",
    tags: abilityTagsForSlug("intimidate"),
  },
  {
    id: 26,
    name: "Levitate",
    slug: "levitate",
    description: "Immune to Ground-type moves.",
    tags: abilityTagsForSlug("levitate"),
  },
  {
    id: 2,
    name: "Drizzle",
    slug: "drizzle",
    description: "Summons rain on switch-in.",
    tags: abilityTagsForSlug("drizzle"),
  },
  {
    id: 144,
    name: "Regenerator",
    slug: "regenerator",
    description: "Restores HP when switching out.",
    tags: abilityTagsForSlug("regenerator"),
  },
];

let cachedAbilities: AbilityListItem[] | null = null;

function hasSupabaseServerEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function relatedOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function toAbilityListItem(row: AbilityRow): AbilityListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "No description available.",
    tags: abilityTagsForSlug(row.slug),
  };
}

function toAbilityPokemonReference(
  row: PokemonReferenceRow,
  isHidden: boolean,
): AbilityPokemonReference {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    spriteNormal: row.sprite_normal_url ?? "",
    isHidden,
    hiddenLabel: isHidden ? HIDDEN_ABILITY_LABEL : undefined,
  };
}

function normalizeSearch(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function filterAndSortAbilities(
  abilities: AbilityListItem[],
  query: AbilityListQuery,
): AbilityListItem[] {
  const search = normalizeSearch(query.search);
  const tag = query.tag;
  const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_ABILITY_LIMIT, 1000));

  return abilities
    .filter((ability) => {
      if (tag && !ability.tags.includes(tag)) {
        return false;
      }
      if (!search) {
        return true;
      }
      return (
        ability.name.toLowerCase().includes(search) ||
        ability.slug.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function getAbilities(
  query: AbilityListQuery = {},
): Promise<{ abilities: AbilityListItem[]; total: number }> {
  if (!hasSupabaseServerEnv()) {
    const abilities = filterAndSortAbilities(FALLBACK_ABILITIES, query);
    return { abilities, total: abilities.length };
  }

  if (!cachedAbilities) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("abilities")
      .select("id, slug, name, description")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      const abilities = filterAndSortAbilities(FALLBACK_ABILITIES, query);
      return { abilities, total: abilities.length };
    }

    cachedAbilities = (data as AbilityRow[]).map(toAbilityListItem);
  }

  const abilities = filterAndSortAbilities(cachedAbilities, query);
  return { abilities, total: abilities.length };
}

export async function getAbilityBySlug(slug: string): Promise<AbilityDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  if (!hasSupabaseServerEnv()) {
    const ability = FALLBACK_ABILITIES.find((entry) => entry.slug === normalizedSlug);
    return ability ? { ...ability, pokemon: [] } : null;
  }

  const supabase = getSupabaseServerClient();
  const { data: abilityData, error: abilityError } = await supabase
    .from("abilities")
    .select("id, slug, name, description")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (abilityError || !abilityData) {
    return null;
  }

  const ability = toAbilityListItem(abilityData as AbilityRow);
  const { data: joinData, error: joinError } = await supabase
    .from("pokemon_abilities")
    .select(
      "is_hidden, pokemon:pokemon_id(id, slug, name, primary_type, secondary_type, sprite_normal_url)",
    )
    .eq("ability_id", ability.id);

  if (joinError || !joinData) {
    return { ...ability, pokemon: [] };
  }

  const pokemon = (joinData as AbilityPokemonJoinRow[])
    .map((entry) => {
      const pokemonRow = relatedOne(entry.pokemon);
      return pokemonRow ? toAbilityPokemonReference(pokemonRow, entry.is_hidden) : null;
    })
    .filter((entry): entry is AbilityPokemonReference => Boolean(entry))
    .sort((a, b) => a.id - b.id);

  return {
    ...ability,
    pokemon,
  };
}
