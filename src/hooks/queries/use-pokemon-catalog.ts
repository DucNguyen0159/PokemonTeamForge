"use client";

import { useMemo } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchCompetitiveItemsFromApi } from "@/lib/items/data-access";
import {
  fetchPokemonDetailFromApi,
  fetchPokemonSummariesFromApi,
} from "@/lib/pokemon/data-access";
import {
  buildSummariesBySlugMap,
  mapSummariesBySlot,
} from "@/lib/pokemon/pokemon-catalog-utils";
import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import {
  normalizeSummarySlugBatch,
  POKEMON_DETAIL_STALE_MS,
  POKEMON_SUMMARY_STALE_MS,
  pokemonKeys,
} from "@/lib/pokemon/query-keys";
import type { ChampionsPokemon } from "@/types/champions";
import type { PokemonDetail, PokemonSummary } from "@/types/pokemon";

function seedSummaryCache(
  queryClient: ReturnType<typeof useQueryClient>,
  summaries: PokemonSummary[],
): void {
  summaries.forEach((summary) => {
    queryClient.setQueryData(pokemonKeys.summary(summary.slug), summary);
  });
}

function rosterSlotSlug(slot: ChampionsPokemon): string {
  if (slot.pokemonId) {
    return String(slot.pokemonId);
  }
  return resolvePokemonSlug(slot.pokemonName);
}

export function useCompetitiveItems(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["competitive-items"],
    queryFn: fetchCompetitiveItemsFromApi,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60,
  });
}

export function usePokemonSummary(slug: string, options?: { enabled?: boolean }) {
  const resolvedSlug = resolvePokemonSlug(slug);

  return useQuery({
    queryKey: pokemonKeys.summary(resolvedSlug),
    queryFn: async () => {
      const payload = await fetchPokemonSummariesFromApi([resolvedSlug]);
      const summary = payload.summaries.find((entry) => entry.slug === resolvedSlug);
      if (!summary) {
        throw new Error(`Could not load summary for ${resolvedSlug}.`);
      }
      return summary;
    },
    enabled: (options?.enabled ?? true) && Boolean(resolvedSlug),
    staleTime: POKEMON_SUMMARY_STALE_MS,
  });
}

export function usePokemonSummaries(slugs: string[], options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const normalizedSlugs = useMemo(() => normalizeSummarySlugBatch(slugs), [slugs]);

  const query = useQuery({
    queryKey: pokemonKeys.summariesBatch(normalizedSlugs),
    queryFn: async () => {
      const payload = await fetchPokemonSummariesFromApi(normalizedSlugs);
      seedSummaryCache(queryClient, payload.summaries);
      return payload;
    },
    enabled: (options?.enabled ?? true) && normalizedSlugs.length > 0,
    staleTime: POKEMON_SUMMARY_STALE_MS,
  });

  const summariesBySlug = useMemo(
    () => buildSummariesBySlugMap(query.data?.summaries ?? []),
    [query.data?.summaries],
  );

  return {
    ...query,
    summaries: query.data?.summaries ?? [],
    missingSlugs: query.data?.missingSlugs ?? [],
    summariesBySlug,
    isLoading: query.isLoading,
  };
}

export function usePokemonSummariesBySlot<
  T extends { slot: number; pokemonName: string },
>(slots: T[], options?: { enabled?: boolean }) {
  const slugs = useMemo(
    () =>
      slots
        .map((slot) => slot.pokemonName.trim())
        .filter(Boolean)
        .map(resolvePokemonSlug),
    [slots],
  );

  const query = usePokemonSummaries(slugs, options);

  const summariesBySlot = useMemo(
    () => mapSummariesBySlot(slots, query.summariesBySlug, resolvePokemonSlug),
    [query.summariesBySlug, slots],
  );

  return {
    ...query,
    summariesBySlot,
  };
}

export function usePokemonDetail(slug: string, options?: { enabled?: boolean }) {
  const resolvedSlug = resolvePokemonSlug(slug);

  return useQuery({
    queryKey: pokemonKeys.detail(resolvedSlug),
    queryFn: () => fetchPokemonDetailFromApi(resolvedSlug),
    enabled: (options?.enabled ?? true) && Boolean(resolvedSlug),
    staleTime: POKEMON_DETAIL_STALE_MS,
  });
}

export function useChampionsRosterCatalog(
  slots: ChampionsPokemon[],
  options?: {
    loadDetails?: boolean | "focused" | "all" | "none";
    focusedSlot?: number;
    enabled?: boolean;
  },
) {
  const loadDetailsMode = options?.loadDetails ?? true;
  const focusedSlot = options?.focusedSlot;
  const enabled = options?.enabled ?? true;

  const filledSlots = useMemo(
    () => slots.filter((slot) => slot.pokemonName.trim() || slot.pokemonId),
    [slots],
  );

  const summariesQuery = usePokemonSummariesBySlot(filledSlots, { enabled });

  const detailQueries = useQueries({
    queries: filledSlots.map((slot) => {
      const slug = rosterSlotSlug(slot);
      const shouldLoadDetail =
        loadDetailsMode !== false &&
        loadDetailsMode !== "none" &&
        (loadDetailsMode === true ||
          loadDetailsMode === "all" ||
          (loadDetailsMode === "focused" &&
            focusedSlot !== undefined &&
            Math.abs(focusedSlot - slot.slot) <= 1));
      return {
        queryKey: pokemonKeys.detail(slug),
        queryFn: () => fetchPokemonDetailFromApi(slug),
        enabled: enabled && shouldLoadDetail && Boolean(slug),
        staleTime: POKEMON_DETAIL_STALE_MS,
      };
    }),
  });

  const detailsBySlot = useMemo(() => {
    const map: Record<number, PokemonDetail> = {};
    filledSlots.forEach((slot, index) => {
      const detail = detailQueries[index]?.data;
      if (detail) {
        map[slot.slot] = detail;
      }
    });
    return map;
  }, [detailQueries, filledSlots]);

  const detailErrorsBySlot = useMemo(() => {
    const map: Record<number, boolean> = {};
    filledSlots.forEach((slot, index) => {
      if (detailQueries[index]?.isError) {
        map[slot.slot] = true;
      }
    });
    return map;
  }, [detailQueries, filledSlots]);

  const isDetailsLoading =
    loadDetailsMode !== false &&
    loadDetailsMode !== "none" &&
    detailQueries.some((query) => query.isLoading || query.isFetching);

  return {
    summariesBySlot: summariesQuery.summariesBySlot,
    detailsBySlot,
    detailErrorsBySlot,
    missingSlugs: summariesQuery.missingSlugs,
    isLoading: summariesQuery.isLoading || isDetailsLoading,
    isSummariesLoading: summariesQuery.isLoading,
    isDetailsLoading,
  };
}
