import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";

export const POKEMON_SUMMARY_STALE_MS = 1000 * 60 * 60 * 24;
export const POKEMON_DETAIL_STALE_MS = 1000 * 60 * 60;
export const POKEMON_SUMMARIES_BATCH_MAX = 120;

export const pokemonKeys = {
  all: ["pokemon"] as const,
  summaries: () => [...pokemonKeys.all, "summaries"] as const,
  summary: (slug: string) =>
    [...pokemonKeys.all, "summary", resolvePokemonSlug(slug)] as const,
  summariesBatch: (slugs: string[]) => {
    const normalized = normalizeSummarySlugBatch(slugs);
    return [...pokemonKeys.summaries(), normalized.join(",")] as const;
  },
  detail: (slug: string) =>
    [...pokemonKeys.all, "detail", resolvePokemonSlug(slug)] as const,
};

export function normalizeSummarySlugBatch(slugs: string[]): string[] {
  return [...new Set(slugs.map(resolvePokemonSlug).filter(Boolean))].sort();
}
