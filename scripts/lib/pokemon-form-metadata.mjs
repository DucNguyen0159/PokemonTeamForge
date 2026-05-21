/**
 * Classifies Pokémon catalog slugs into form kinds and display-sort metadata.
 * Shared by import-pokemon-data.mjs and validate-supabase-data.mjs.
 */

export const FORM_KINDS = ["default", "mega", "gigantamax", "regional", "other"];

export const FORM_KIND_RANK = {
  default: 0,
  mega: 1,
  gigantamax: 2,
  regional: 3,
  other: 4,
};

const REGIONAL_PREFIXES = ["galarian-", "alolan-", "hisuian-", "paldean-"];
const REGIONAL_SUFFIXES = ["-galar", "-alola", "-hisui", "-paldea"];

const OTHER_FORM_SUFFIXES = ["-totem", "-cap", "-starter", "-cosplay", "-rock-star", "-belle"];

/**
 * @param {string} slug
 * @returns {{ form_kind: string, base_slug: string | null }}
 */
export function classifyPokemonForm(slug) {
  const normalized = String(slug ?? "").trim().toLowerCase();
  if (!normalized) {
    return { form_kind: "default", base_slug: null };
  }

  if (/-gmax$/.test(normalized) || /-gigantamax$/.test(normalized)) {
    return {
      form_kind: "gigantamax",
      base_slug: normalized.replace(/-(?:gmax|gigantamax)$/, ""),
    };
  }

  if (/-mega(-[xy])?$/.test(normalized)) {
    return {
      form_kind: "mega",
      base_slug: normalized.replace(/-mega(-[xy])?$/, ""),
    };
  }

  for (const prefix of REGIONAL_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return {
        form_kind: "regional",
        base_slug: normalized.slice(prefix.length),
      };
    }
  }

  for (const suffix of REGIONAL_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return {
        form_kind: "regional",
        base_slug: normalized.slice(0, -suffix.length),
      };
    }
  }

  for (const suffix of OTHER_FORM_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return {
        form_kind: "other",
        base_slug: normalized.slice(0, -suffix.length),
      };
    }
  }

  if (normalized.includes("-primal")) {
    return {
      form_kind: "other",
      base_slug: normalized.replace(/-primal$/, ""),
    };
  }

  return { form_kind: "default", base_slug: null };
}

/**
 * @param {Array<{ slug: string, id: number, species_slug?: string }>} pokemonRows
 */
export function applyPokemonFormMetadata(pokemonRows) {
  const bySlug = new Map(pokemonRows.map((row) => [row.slug, row]));

  for (const row of pokemonRows) {
    const { form_kind, base_slug: classifiedBase } = classifyPokemonForm(row.slug);
    row.form_kind = form_kind;
    row._classifiedBase = classifiedBase;
  }

  for (const row of pokemonRows) {
    if (row.form_kind === "default") {
      row.base_slug = null;
      row.pokedex_display_no = row.id;
    } else {
      const classifiedBase = row._classifiedBase;
      const baseRow =
        (classifiedBase ? bySlug.get(classifiedBase) : null) ??
        pokemonRows.find(
          (candidate) =>
            candidate.slug === row.species_slug && candidate.form_kind === "default",
        ) ??
        pokemonRows.find(
          (candidate) =>
            candidate.species_slug === row.species_slug && candidate.form_kind === "default",
        );

      row.base_slug = classifiedBase ?? baseRow?.slug ?? row.species_slug ?? row.slug;
      row.pokedex_display_no = baseRow?.id ?? row.id;
    }

    const formRank = FORM_KIND_RANK[row.form_kind] ?? FORM_KIND_RANK.other;
    row.list_sort_rank = row.pokedex_display_no * 10 + formRank;
    delete row._classifiedBase;
  }

  return pokemonRows;
}
