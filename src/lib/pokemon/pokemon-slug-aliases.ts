/**
 * Maps friendly / species display names to canonical catalog slugs.
 * PokeAPI and our Supabase import use form-specific slugs for many species.
 */
export const POKEMON_SLUG_ALIASES: Record<string, string> = {
  indeedee: "indeedee-female",
  meowstic: "meowstic-male",
  mimikyu: "mimikyu-disguised",
  basculegion: "basculegion-male",
  aegislash: "aegislash-shield",
  maushold: "maushold-family-of-four",
};

export function normalizePokemonSlugInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

export function resolvePokemonSlug(input: string): string {
  const normalized = normalizePokemonSlugInput(input);
  if (!normalized) {
    return "";
  }
  return POKEMON_SLUG_ALIASES[normalized] ?? normalized;
}
