"use client";

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/utils";
import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";
import {
  fetchPokemonDetailFromApi,
  fetchPokemonListFromApi,
} from "@/lib/pokemon/data-access";
import { formatPokedexDisplayNumber, getPokemonListNameMeta } from "@/lib/pokemon/pokemon-list-display";
import { PokemonFormKindPill } from "@/components/pokemon/pokemon-form-kind-pill";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { ErrorMessage } from "@/components/error/error-message";

type PokemonPickerProps = {
  onSelect: (pokemon: PokemonDetail) => void;
  onCancel: () => void;
  currentSelectedSlug?: string | null;
};

const PICKER_PAGE_SIZE = 60;

function PokemonPickerComponent({ onSelect, onCancel, currentSelectedSlug = null }: PokemonPickerProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedEntryRef = useRef<HTMLButtonElement | null>(null);

  const pokemonQuery = useInfiniteQuery({
    queryKey: ["builder-pokemon-picker", normalizedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPokemonListFromApi({
        search: normalizedSearch || undefined,
        page: pageParam,
        limit: PICKER_PAGE_SIZE,
        sortBy: "id",
        sortDirection: "asc",
      }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
  const {
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isPending,
    refetch,
  } = pokemonQuery;

  const filtered = useMemo<PokemonListItem[]>(
    () =>
      pokemonQuery.data?.pages.flatMap((page) => page.pokemon) ?? [],
    [pokemonQuery.data],
  );

  useEffect(() => {
    if (!selectedEntryRef.current || !listContainerRef.current || normalizedSearch) {
      return;
    }

    selectedEntryRef.current.scrollIntoView({ block: "center" });
  }, [filtered, normalizedSearch]);

  const handleListScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage || isPending) {
        return;
      }

      const target = event.currentTarget;
      const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 56;
      if (nearBottom) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isPending],
  );

  async function handleSelect(slug: string) {
    setAddingSlug(slug);
    setStatus(null);
    try {
      const detail = await fetchPokemonDetailFromApi(slug);
      onSelect(detail);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load this Pokémon.");
    } finally {
      setAddingSlug(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Select Pokémon</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel selection"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-2.5 py-1.5">
        <Search className="size-3.5 flex-shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or type…"
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {status ? <ErrorMessage title="Selection unavailable" message={status} /> : null}

      {isPending ? (
        <p className="py-4 text-center text-xs text-muted-foreground">Loading Pokémon...</p>
      ) : isError ? (
        <ErrorMessage
          title="Pokémon list unavailable"
          message={
            pokemonQuery.error instanceof Error
              ? pokemonQuery.error.message
              : "Unable to load Pokémon."
          }
          onRetry={() => {
            void refetch();
          }}
          isRetrying={isFetching}
        />
      ) : filtered.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No Pokémon found. Try another name or type.
        </p>
      ) : (
        <div
          ref={listContainerRef}
          className="grid grid-cols-1 gap-1.5 overflow-y-auto"
          style={{ maxHeight: "280px" }}
          onScroll={handleListScroll}
        >
          {filtered.map((pokemon) => {
            const { showPill } = getPokemonListNameMeta(pokemon);
            const isCurrentSelected = currentSelectedSlug === pokemon.slug;

            return (
            <button
              key={pokemon.slug}
              ref={isCurrentSelected ? selectedEntryRef : null}
              type="button"
              onClick={() => {
                void handleSelect(pokemon.slug);
              }}
              disabled={addingSlug === pokemon.slug}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/30 px-2.5 py-2",
                "text-left transition-colors",
                "hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isCurrentSelected && "border-primary/50 bg-primary/10",
                addingSlug === pokemon.slug && "opacity-70",
              )}
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-background/60">
                <PokemonSprite
                  src={pokemon.spriteNormal}
                  alt={pokemon.name}
                  size={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <p className="truncate text-xs font-semibold text-foreground">{pokemon.name}</p>
                  {showPill ? (
                    <PokemonFormKindPill
                      formKind={pokemon.formKind}
                      className="px-1.5 py-0 text-[9px]"
                    />
                  ) : null}
                </div>
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  #{formatPokedexDisplayNumber(pokemon.pokedexDisplayNo)}
                </p>
                <div className="mt-0.5 flex gap-1">
                  <TypeBadge type={pokemon.primaryType} />
                  {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
                </div>
              </div>
            </button>
          );
          })}
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
              Loading more Pokémon...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const PokemonPicker = memo(PokemonPickerComponent);
