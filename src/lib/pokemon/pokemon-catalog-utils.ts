import type { PokemonDetail, PokemonListItem, PokemonSummary } from "@/types/pokemon";

export function buildSummariesBySlugMap(
  summaries: PokemonSummary[],
): Record<string, PokemonSummary> {
  return Object.fromEntries(summaries.map((summary) => [summary.slug, summary]));
}

export function summaryFromListItem(item: PokemonListItem): PokemonSummary {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    primaryType: item.primaryType,
    secondaryType: item.secondaryType,
    spriteNormal: item.spriteNormal,
  };
}

export function summaryFromDetail(detail: PokemonDetail): PokemonSummary {
  return {
    id: detail.id,
    name: detail.name,
    slug: detail.slug,
    primaryType: detail.primaryType,
    secondaryType: detail.secondaryType,
    spriteNormal: detail.spriteNormal,
  };
}

export function mapSummariesBySlot<T extends { slot: number; pokemonName: string }>(
  slots: T[],
  summariesBySlug: Record<string, PokemonSummary>,
  resolveSlug: (name: string) => string,
): Record<number, PokemonSummary> {
  const bySlot: Record<number, PokemonSummary> = {};
  slots.forEach((entry) => {
    const name = entry.pokemonName.trim();
    if (!name) {
      return;
    }
    const summary = summariesBySlug[resolveSlug(name)];
    if (summary) {
      bySlot[entry.slot] = summary;
    }
  });
  return bySlot;
}
