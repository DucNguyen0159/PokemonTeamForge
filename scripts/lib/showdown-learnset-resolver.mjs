import { createRequire } from "node:module";

import { classifyPokemonForm } from "./pokemon-form-metadata.mjs";

const require = createRequire(import.meta.url);
const { Dex } = require("pokemon-showdown");

function unique(values) {
  return Array.from(new Set(values));
}

function toId(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function collectShowdownLearnsetMoveIds(speciesId) {
  const moveIds = new Set();

  const fullLearnset = Dex.species.getFullLearnset(speciesId);
  for (const learnsetEntry of fullLearnset ?? []) {
    for (const moveId of Object.keys(learnsetEntry?.learnset ?? {})) {
      moveIds.add(moveId);
    }
  }

  if (moveIds.size > 0) {
    return Array.from(moveIds);
  }

  const directLearnset = Dex.species.getLearnsetData(speciesId);
  for (const moveId of Object.keys(directLearnset?.learnset ?? {})) {
    moveIds.add(moveId);
  }

  return Array.from(moveIds);
}

async function getMoveSlugMap({ caches, pokeApiGetFn }) {
  if (caches.showdownMoveSlugMapPromise) {
    return caches.showdownMoveSlugMapPromise;
  }

  caches.showdownMoveSlugMapPromise = (async () => {
    const listing = await pokeApiGetFn("/move?limit=2000&offset=0");
    const slugMap = new Map();
    for (const row of listing.results ?? []) {
      slugMap.set(toId(row.name), row.name);
    }
    return slugMap;
  })();

  return caches.showdownMoveSlugMapPromise;
}

function resolveLookupOrder({ pokemonSlug, speciesSlug }) {
  const formMeta = classifyPokemonForm(pokemonSlug);
  const baseSlug = formMeta.base_slug ?? speciesSlug ?? pokemonSlug;

  if (formMeta.form_kind === "mega" || formMeta.form_kind === "gigantamax") {
    return {
      formMeta,
      lookups: unique([
        toId(baseSlug),
        toId(speciesSlug),
        toId(pokemonSlug),
      ]).filter(Boolean),
      preferredSource: "showdown-base-inherit",
    };
  }

  return {
    formMeta,
    lookups: unique([
      toId(pokemonSlug),
      toId(speciesSlug),
      toId(baseSlug),
    ]).filter(Boolean),
    preferredSource: "showdown-form",
  };
}

/**
 * Resolve moves for all form kinds in one global rule:
 * - mega/gigantamax: inherit from base species learnset
 * - regional/default/other: use form learnset when present
 * - fallback to PokéAPI moves to keep import resilient
 */
export async function resolveEffectiveMoveSlugs({
  pokemonSlug,
  speciesSlug,
  pokeApiMoveSlugs,
  caches,
  pokeApiGetFn,
}) {
  const fallbackMoveSlugs = unique(pokeApiMoveSlugs ?? []);
  const { lookups, preferredSource } = resolveLookupOrder({ pokemonSlug, speciesSlug });
  const moveSlugMap = await getMoveSlugMap({ caches, pokeApiGetFn });

  let unresolvedShowdownMoveIds = 0;

  for (const lookupId of lookups) {
    const showdownMoveIds = collectShowdownLearnsetMoveIds(lookupId);
    if (showdownMoveIds.length === 0) {
      continue;
    }

    const resolvedMoveSlugs = [];
    for (const moveId of showdownMoveIds) {
      const mapped = moveSlugMap.get(toId(moveId));
      if (mapped) {
        resolvedMoveSlugs.push(mapped);
      } else {
        unresolvedShowdownMoveIds += 1;
      }
    }

    const uniqueResolved = unique(resolvedMoveSlugs);
    if (uniqueResolved.length > 0) {
      return {
        moveSlugs: uniqueResolved,
        source: preferredSource,
        unresolvedShowdownMoveIds,
      };
    }
  }

  return {
    moveSlugs: fallbackMoveSlugs,
    source: "pokeapi-fallback",
    unresolvedShowdownMoveIds,
  };
}
