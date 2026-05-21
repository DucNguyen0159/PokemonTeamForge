const DETAIL_QUERY_KEYS = [
  "from",
  "ability",
  "pokedexReturn",
  "view",
  "q",
  "sort",
  "dir",
  "gen",
  "type",
] as const;

function firstQueryValue(value: string | string[] | null | undefined): string {
  return Array.isArray(value) ? value[0]?.trim() ?? "" : value?.trim() ?? "";
}

export function buildPokemonDetailQueryString(
  query: Record<string, string | string[] | null | undefined> | undefined,
): string {
  const params = new URLSearchParams();

  for (const key of DETAIL_QUERY_KEYS) {
    const value = firstQueryValue(query?.[key]);
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function buildPokemonDetailHref(
  slug: string,
  query: Record<string, string | string[] | null | undefined> | undefined,
): string {
  const encodedSlug = encodeURIComponent(slug);
  const queryString = buildPokemonDetailQueryString(query);
  return queryString ? `/pokemon/${encodedSlug}?${queryString}` : `/pokemon/${encodedSlug}`;
}

export function buildBuilderPokemonDetailHref(slug: string): string {
  return `/pokemon/${encodeURIComponent(slug)}?from=builder`;
}
