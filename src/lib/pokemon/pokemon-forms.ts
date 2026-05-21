import type { PokemonType } from "@/types/shared";

export const POKEMON_FORM_KINDS = ["default", "mega", "gigantamax", "regional", "other"] as const;

export type PokemonFormKind = (typeof POKEMON_FORM_KINDS)[number];

export const FORM_KIND_RANK: Record<PokemonFormKind, number> = {
  default: 0,
  mega: 1,
  gigantamax: 2,
  regional: 3,
  other: 4,
};

const REGIONAL_PREFIXES = ["galarian-", "alolan-", "hisuian-", "paldean-"] as const;
const REGIONAL_SUFFIXES = ["-galar", "-alola", "-hisui", "-paldea"] as const;
const OTHER_FORM_SUFFIXES = [
  "-totem",
  "-cap",
  "-starter",
  "-cosplay",
  "-rock-star",
  "-belle",
] as const;

export type PokemonFormListFields = {
  formKind: PokemonFormKind;
  baseSlug: string | null;
  pokedexDisplayNo: number;
  listSortRank: number;
};

export type AlternateForm = {
  formKind: PokemonFormKind;
  slug: string;
  name: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
  total: number;
  spriteNormal: string;
  pokedexDisplayNo: number;
  listSortRank: number;
};

export type AlternateFormsByKind = Partial<Record<Exclude<PokemonFormKind, "default">, AlternateForm[]>>;

export const FORM_KIND_PILL_LABELS: Record<Exclude<PokemonFormKind, "default">, string> = {
  mega: "Mega",
  gigantamax: "G-Max",
  regional: "Regional",
  other: "Form",
};

export const ALTERNATE_FORM_GROUP_LABELS = {
  mega: "Mega Evolution",
  gigantamax: "Gigantamax",
  regionalAndOther: "Regional & other",
  base: "Standard form",
} as const;

export function resolveEvolutionHighlightSlug(
  currentSlug: string,
  formKind: PokemonFormKind | undefined,
  baseSlug: string | null | undefined,
): string {
  const normalized = currentSlug.trim().toLowerCase();

  if (formKind && formKind !== "default" && baseSlug) {
    return baseSlug.trim().toLowerCase();
  }

  return normalized;
}

export function getFormKindPillLabel(formKind: PokemonFormKind): string | null {
  if (formKind === "default") {
    return null;
  }

  return FORM_KIND_PILL_LABELS[formKind];
}

export function isPokemonFormKind(value: string): value is PokemonFormKind {
  return (POKEMON_FORM_KINDS as readonly string[]).includes(value);
}

export function classifyPokemonFormFromSlug(slug: string): {
  formKind: PokemonFormKind;
  baseSlug: string | null;
} {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return { formKind: "default", baseSlug: null };
  }

  if (/-gmax$/.test(normalized) || /-gigantamax$/.test(normalized)) {
    return {
      formKind: "gigantamax",
      baseSlug: normalized.replace(/-(?:gmax|gigantamax)$/, ""),
    };
  }

  if (/-mega(-[xy])?$/.test(normalized)) {
    return {
      formKind: "mega",
      baseSlug: normalized.replace(/-mega(-[xy])?$/, ""),
    };
  }

  for (const prefix of REGIONAL_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return {
        formKind: "regional",
        baseSlug: normalized.slice(prefix.length),
      };
    }
  }

  for (const suffix of REGIONAL_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return {
        formKind: "regional",
        baseSlug: normalized.slice(0, -suffix.length),
      };
    }
  }

  for (const suffix of OTHER_FORM_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return {
        formKind: "other",
        baseSlug: normalized.slice(0, -suffix.length),
      };
    }
  }

  if (normalized.includes("-primal")) {
    return {
      formKind: "other",
      baseSlug: normalized.replace(/-primal$/, ""),
    };
  }

  return { formKind: "default", baseSlug: null };
}

export function buildListFormFields(
  slug: string,
  id: number,
  options?: { pokedexDisplayNo?: number; formKind?: PokemonFormKind; baseSlug?: string | null },
): PokemonFormListFields {
  const classified = classifyPokemonFormFromSlug(slug);
  const formKind = options?.formKind ?? classified.formKind;
  const baseSlug = options?.baseSlug !== undefined ? options.baseSlug : classified.baseSlug;
  const pokedexDisplayNo = options?.pokedexDisplayNo ?? id;
  const listSortRank = pokedexDisplayNo * 10 + (FORM_KIND_RANK[formKind] ?? FORM_KIND_RANK.other);

  return {
    formKind,
    baseSlug,
    pokedexDisplayNo,
    listSortRank,
  };
}

export function comparePokemonListByNationalDex(
  a: { id: number; pokedexDisplayNo: number; listSortRank: number },
  b: { id: number; pokedexDisplayNo: number; listSortRank: number },
): number {
  if (a.pokedexDisplayNo !== b.pokedexDisplayNo) {
    return a.pokedexDisplayNo - b.pokedexDisplayNo;
  }

  if (a.listSortRank !== b.listSortRank) {
    return a.listSortRank - b.listSortRank;
  }

  return a.id - b.id;
}

export function groupAlternateFormsByKind(forms: AlternateForm[]): AlternateFormsByKind {
  const grouped: AlternateFormsByKind = {};

  for (const form of forms) {
    if (form.formKind === "default") {
      continue;
    }

    const bucket = grouped[form.formKind] ?? [];
    bucket.push(form);
    grouped[form.formKind] = bucket;
  }

  for (const kind of POKEMON_FORM_KINDS) {
    if (kind === "default") {
      continue;
    }

    const bucket = grouped[kind];
    if (bucket) {
      bucket.sort((left, right) => left.listSortRank - right.listSortRank || left.slug.localeCompare(right.slug));
    }
  }

  return grouped;
}
