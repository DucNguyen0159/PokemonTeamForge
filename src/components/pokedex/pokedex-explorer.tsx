"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ArrowUp, LayoutGrid, List, Loader2, Plus, Search, X } from "lucide-react";

import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { HIDDEN_ABILITY_LABEL } from "@/types/ability";
import type { PokemonListItem } from "@/types/pokemon";
import type { PokemonType } from "@/types/shared";
import {
  fetchPokemonDetailFromApi,
  fetchPokemonListFromApi,
} from "@/lib/pokemon/data-access";
import {
  buildPokedexHref,
  buildPokemonDetailHref,
  parsePokedexReturnState,
  storePokedexReturnHref,
  type PokedexExplorerReturnState,
} from "@/lib/pokemon/pokedex-return-url";
import { formatPokedexDisplayNumber } from "@/lib/pokemon/pokemon-list-display";
import { fetchAbilitiesFromApi } from "@/lib/abilities/data-access";
import { cn } from "@/utils";
import { TypeBadge, TYPE_COLORS } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { useAppToast } from "@/providers/toast-provider";
import { ErrorMessage } from "@/components/error/error-message";
import { PageIntro, PageIntroChip } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/store/team-store";

const PAGE_SIZE = 24;
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type ViewMode = "cards" | "table";

const SORT_SELECT_OPTIONS: ReadonlyArray<{ value: PokemonListSortKey; label: string }> = [
  { value: "id", label: "National #" },
  { value: "name", label: "Name" },
  { value: "total", label: "Total" },
  { value: "hp", label: "HP" },
  { value: "attack", label: "Attack" },
  { value: "defense", label: "Defense" },
  { value: "specialAttack", label: "Sp. Atk" },
  { value: "specialDefense", label: "Sp. Def" },
  { value: "speed", label: "Speed" },
];

const SORT_CARD_PRIMARY_LABEL = Object.fromEntries(
  SORT_SELECT_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<PokemonListSortKey, string>;

function formatPokemonCardSubtitle(pokemon: PokemonListItem, sortBy: PokemonListSortKey): string {
  const dexLabel = `#${formatPokedexDisplayNumber(pokemon.pokedexDisplayNo)}`;

  if (sortBy === "id" || sortBy === "name") {
    return dexLabel;
  }

  const primaryLabel = SORT_CARD_PRIMARY_LABEL[sortBy];
  let primaryValue: string | number;

  switch (sortBy) {
    case "total":
      primaryValue = pokemon.total;
      break;
    case "hp":
      primaryValue = pokemon.hp;
      break;
    case "attack":
      primaryValue = pokemon.attack;
      break;
    case "defense":
      primaryValue = pokemon.defense;
      break;
    case "specialAttack":
      primaryValue = pokemon.specialAttack;
      break;
    case "specialDefense":
      primaryValue = pokemon.specialDefense;
      break;
    case "speed":
      primaryValue = pokemon.speed;
      break;
  }

  return `${primaryLabel} ${primaryValue} · ${dexLabel}`;
}

function defaultSortDirection(sortBy: PokemonListSortKey): PokemonListSortDirection {
  return sortBy === "id" || sortBy === "name" ? "asc" : "desc";
}

function sortKeyNeedsFullResultHydration(sortKey: PokemonListSortKey): boolean {
  return sortKey !== "id" && sortKey !== "name";
}

type SortableColumnHeaderProps = {
  label: ReactNode;
  column: PokemonListSortKey;
  activeColumn: PokemonListSortKey;
  direction: PokemonListSortDirection;
  onActivate: (column: PokemonListSortKey) => void;
  className?: string;
  buttonClassName?: string;
};

function SortableColumnHeader({
  label,
  column,
  activeColumn,
  direction,
  onActivate,
  className,
  buttonClassName,
}: SortableColumnHeaderProps) {
  const active = activeColumn === column;

  return (
    <th scope="col" className={cn("min-w-0 overflow-hidden px-3 py-3 font-medium whitespace-nowrap", className)}>
      <button
        type="button"
        onClick={() => onActivate(column)}
        className={cn(
          "-mx-1 inline-flex min-h-8 w-full items-center gap-1 rounded-md px-1 text-left text-xs uppercase tracking-wide transition-colors",
          "hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          buttonClassName,
        )}
      >
        <span>{label}</span>
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0 opacity-80" aria-hidden />
          )
        ) : null}
      </button>
    </th>
  );
}

type PokedexExplorerProps = {
  initialReturnState?: PokedexExplorerReturnState;
};

function applyReturnStateToExplorer(
  state: PokedexExplorerReturnState,
  setters: {
    setSearch: (value: string) => void;
    setDebouncedSearch: (value: string) => void;
    setTypeFilter: (value: PokemonType | "") => void;
    setAbilityFilter: (value: string) => void;
    setGenerationFilter: (value: number | "") => void;
    setSortBy: (value: PokemonListSortKey) => void;
    setSortDirection: (value: PokemonListSortDirection) => void;
    setView: (value: ViewMode) => void;
  },
) {
  setters.setSearch(state.q ?? "");
  setters.setDebouncedSearch(state.q ?? "");
  setters.setTypeFilter(state.type ?? "");
  setters.setAbilityFilter(state.ability ?? "");
  setters.setGenerationFilter(state.generation ?? "");
  setters.setSortBy(state.sortBy ?? "id");
  setters.setSortDirection(state.sortDirection ?? defaultSortDirection(state.sortBy ?? "id"));
  setters.setView(state.view ?? "cards");
}

type PokemonListNameDisplayProps = {
  pokemon: PokemonListItem;
  detailLink: ReturnType<typeof buildPokemonDetailHref>;
  nameClassName?: string;
  onDetailClick: () => void;
};

function PokemonListNameDisplay({
  pokemon,
  detailLink,
  nameClassName,
  onDetailClick,
}: PokemonListNameDisplayProps) {
  return (
    <div className="min-w-0">
      <Link
        href={detailLink.href}
        onClick={onDetailClick}
        className={cn(
          "font-medium leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          nameClassName,
        )}
      >
        {pokemon.name}
      </Link>
    </div>
  );
}

export function PokedexExplorer({ initialReturnState = {} }: PokedexExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialReturnState.q ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialReturnState.q ?? "");
  const [typeFilter, setTypeFilter] = useState<PokemonType | "">(initialReturnState.type ?? "");
  const [abilityFilter, setAbilityFilter] = useState(initialReturnState.ability ?? "");
  const [generationFilter, setGenerationFilter] = useState<number | "">(
    initialReturnState.generation ?? "",
  );
  const [sortBy, setSortBy] = useState<PokemonListSortKey>(initialReturnState.sortBy ?? "id");
  const [sortDirection, setSortDirection] = useState<PokemonListSortDirection>(
    initialReturnState.sortDirection ?? defaultSortDirection(initialReturnState.sortBy ?? "id"),
  );
  const [view, setView] = useState<ViewMode>(initialReturnState.view ?? "cards");
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [abilityDialogPokemon, setAbilityDialogPokemon] = useState<PokemonListItem | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const addPokemon = useTeamStore((s) => s.addPokemon);
  const { showToast } = useAppToast();

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (searchParams.toString().length === 0) {
      return;
    }

    applyReturnStateToExplorer(parsePokedexReturnState(searchParams), {
      setSearch,
      setDebouncedSearch,
      setTypeFilter,
      setAbilityFilter,
      setGenerationFilter,
      setSortBy,
      setSortDirection,
      setView,
    });
  }, [searchParams]);

  const buildCurrentReturnState = useCallback((): PokedexExplorerReturnState => {
    return {
      view,
      q: debouncedSearch || undefined,
      sortBy,
      sortDirection,
      generation: generationFilter === "" ? undefined : generationFilter,
      type: typeFilter || undefined,
      ability: abilityFilter || undefined,
    };
  }, [abilityFilter, debouncedSearch, generationFilter, sortBy, sortDirection, typeFilter, view]);

  useEffect(() => {
    const nextHref = buildPokedexHref(buildCurrentReturnState());
    const currentHref =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;

    if (currentHref !== nextHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [buildCurrentReturnState, pathname, router]);

  function getPokemonDetailLink(slug: string) {
    return buildPokemonDetailHref(slug, buildCurrentReturnState());
  }

  function handleDetailLinkClick(storeReturnHrefInSession: boolean, returnHref: string) {
    if (storeReturnHrefInSession) {
      storePokedexReturnHref(returnHref);
    }
  }

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (typeFilter) {
      params.set("type", typeFilter);
    }

    if (abilityFilter) {
      params.set("ability", abilityFilter);
    }

    if (generationFilter !== "") {
      params.set("generation", String(generationFilter));
    }

    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);

    return params;
  }, [abilityFilter, debouncedSearch, typeFilter, generationFilter, sortBy, sortDirection]);

  const abilityListQuery = useQuery({
    queryKey: ["abilities", "pokedex-filter"],
    queryFn: () => fetchAbilitiesFromApi({ limit: 1000 }),
    staleTime: 1000 * 60 * 10,
  });

  const listQuery = useInfiniteQuery({
    queryKey: ["pokedex", queryParams.toString()],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPokemonListFromApi({
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        ability: abilityFilter || undefined,
        generation: generationFilter === "" ? undefined : generationFilter,
        page: pageParam,
        limit: PAGE_SIZE,
        sortBy,
        sortDirection,
      }),
    getNextPageParam: (lastPage) => {
      const loadedThroughPage = lastPage.page * lastPage.limit;
      return loadedThroughPage < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 60_000,
  });

  const abilityDetailQuery = useQuery({
    queryKey: ["pokedex-card-abilities", abilityDialogPokemon?.slug],
    queryFn: () => fetchPokemonDetailFromApi(abilityDialogPokemon?.slug ?? ""),
    enabled: Boolean(abilityDialogPokemon),
    staleTime: 1000 * 60 * 10,
  });

  const loadedPokemon = useMemo(
    () => listQuery.data?.pages.flatMap((pageData) => pageData.pokemon) ?? [],
    [listQuery.data],
  );

  const totalPokemon = listQuery.data?.pages[0]?.total ?? 0;
  const loadedCount = loadedPokemon.length;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listQuery;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        root: view === "table" ? tableScrollRef.current : null,
        rootMargin: "480px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, loadedCount, view]);

  useEffect(() => {
    if (!abilityDialogPokemon) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAbilityDialogPokemon(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abilityDialogPokemon]);

  function closeAbilityDialog() {
    setAbilityDialogPokemon(null);
  }

  function openAbilityDialog(pokemon: PokemonListItem) {
    setAbilityDialogPokemon(pokemon);
  }

  const fullStatSortPending = Boolean(
    listQuery.isFetching && loadedCount === 0 && sortKeyNeedsFullResultHydration(sortBy),
  );

  const hasActiveFilters = Boolean(search.trim() || typeFilter || abilityFilter || generationFilter !== "");

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setTypeFilter("");
    setAbilityFilter("");
    setGenerationFilter("");
  }

  async function handleAddToTeam(slug: string) {
    const slot =
      useTeamStore.getState().team.pokemon.find((entry) => !entry.pokemon)?.slot ?? null;

    if (!slot) {
      showToast("Your team is full. Open the builder to swap a Pokémon.", "error");
      return;
    }

    setAddingSlug(slug);

    try {
      const detail = await fetchPokemonDetailFromApi(slug);
      addPokemon(slot, detail);
      showToast(`Added ${detail.name} to slot ${slot}.`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not add Pokémon.", "error");
    } finally {
      setAddingSlug(null);
    }
  }

  function handleSortColumn(next: PokemonListSortKey) {
    if (sortBy === next) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(next);
      setSortDirection(defaultSortDirection(next));
    }
  }

  function getSortCellClass(column: PokemonListSortKey): string {
    return sortBy === column ? "bg-primary/5 text-primary" : "text-foreground";
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className={cn(view === "table" && "flex flex-col items-center")}>
        <div className={cn("space-y-6", view === "table" ? "w-max max-w-full" : "w-full")}>
        <PageIntro
          eyebrow="Pokédex"
          title="Browse Battle-Ready Pokémon"
          description="Search, filter by type, ability, or generation, sort by battle stats, and add contenders directly to your current team."
          chips={
            <>
              <PageIntroChip>{view === "cards" ? "Card view" : "Table view"}</PageIntroChip>
              <PageIntroChip>{sortBy} sort</PageIntroChip>
              <PageIntroChip>Team add enabled</PageIntroChip>
            </>
          }
        />

        <p className="text-sm text-muted-foreground">
          <Link
            href="/type-chart"
            className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            Open full type chart →
          </Link>
        </p>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
            <Search className="size-4 flex-shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Pokémon…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center lg:justify-end">
            <select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={(event) => setTypeFilter((event.target.value || "") as PokemonType | "")}
              className={cn(
                "h-10 min-w-0 rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground lg:min-w-[8.5rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              <option value="">All types</option>
              {ALL_POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by ability"
              value={abilityFilter}
              onChange={(event) => setAbilityFilter(event.target.value)}
              disabled={abilityListQuery.isPending}
              className={cn(
                "h-10 min-w-0 rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground lg:min-w-[10rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                abilityListQuery.isPending && "cursor-wait opacity-70",
              )}
            >
              <option value="">
                {abilityListQuery.isPending ? "Loading abilities..." : "All abilities"}
              </option>
              {abilityListQuery.data?.abilities.map((ability) => (
                <option key={ability.slug} value={ability.slug}>
                  {ability.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by generation"
              value={generationFilter === "" ? "" : String(generationFilter)}
              onChange={(event) => {
                const next = event.target.value;
                setGenerationFilter(next === "" ? "" : Number(next));
              }}
              className={cn(
                "h-10 min-w-0 rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground lg:min-w-[10rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              <option value="">All generations</option>
              {GENERATIONS.map((gen) => (
                <option key={gen} value={gen}>
                  Generation {gen}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort results by"
              value={sortBy}
              onChange={(event) => {
                const next = event.target.value as PokemonListSortKey;
                setSortBy(next);
                setSortDirection(defaultSortDirection(next));
              }}
              className={cn(
                "h-10 min-w-0 rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground lg:min-w-[9.5rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              {SORT_SELECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-10 min-w-10 rounded-xl px-2"
              aria-label={
                sortDirection === "asc" ? "Sort direction: ascending. Click for descending." : "Sort direction: descending. Click for ascending."
              }
              onClick={() => {
                setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
              }}
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="mx-auto size-4" aria-hidden />
              ) : (
                <ArrowDown className="mx-auto size-4" aria-hidden />
              )}
            </Button>

            <div className="flex h-10 items-center justify-center rounded-xl border border-border/50 bg-background/40 p-0.5">
              <button
                type="button"
                aria-pressed={view === "cards"}
                onClick={() => setView("cards")}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  view === "cards"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Card layout"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Table layout"
              >
                <List className="size-4" />
              </button>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 gap-1.5 rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="size-3.5" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {fullStatSortPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading sorted results…
              </span>
            ) : listQuery.isFetching && !listQuery.isPending && !listQuery.isFetchingNextPage ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Updating results…
              </span>
            ) : totalPokemon > 0 ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {loadedCount === 0 ? 0 : 1}
                  –
                  {loadedCount}
                </span>{" "}
                of <span className="font-medium text-foreground">{totalPokemon}</span> Pokémon
              </>
            ) : (
              " "
            )}
          </p>
        </div>
      </div>

      {listQuery.isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading Pokémon…
        </div>
      ) : listQuery.isError ? (
        <ErrorMessage
          title="Pokédex unavailable"
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Something went wrong."
          }
          onRetry={() => {
            void listQuery.refetch();
          }}
          isRetrying={listQuery.isFetching}
        />
      ) : loadedCount === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground">
          No Pokémon match these filters. Try clearing search or widening your filters.
        </p>
      ) : view === "cards" ? (
        <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loadedPokemon.map((pokemon) => {
            const primaryTypeColor = TYPE_COLORS[pokemon.primaryType] ?? "#9ca3af";
            const detailLink = getPokemonDetailLink(pokemon.slug);
            const cardStyle = {
              "--pokedex-card-accent": primaryTypeColor,
              borderColor: `${primaryTypeColor}33`,
            } as CSSProperties;

            return (
              <article
                key={pokemon.slug}
                style={cardStyle}
                className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card/50 p-4 shadow-sm transition-colors hover:border-[var(--pokedex-card-accent)] hover:bg-card/80"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--pokedex-card-accent)] opacity-70"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-8 -top-8 size-20 rounded-full bg-[var(--pokedex-card-accent)] opacity-10 blur-2xl"
                />
                <div className="relative flex items-start gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border/35 bg-muted/50">
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[var(--pokedex-card-accent)] opacity-10"
                    />
                    <PokemonSprite
                      src={pokemon.spriteNormal}
                      alt={pokemon.name}
                      size={64}
                      className="relative h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <PokemonListNameDisplay
                      pokemon={pokemon}
                      detailLink={detailLink}
                      nameClassName="truncate text-sm font-semibold"
                      onDetailClick={() =>
                        handleDetailLinkClick(
                          detailLink.storeReturnHrefInSession,
                          detailLink.returnHref,
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatPokemonCardSubtitle(pokemon, sortBy)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <TypeBadge type={pokemon.primaryType} />
                      {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => openAbilityDialog(pokemon)}
                      className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={`Show ${pokemon.name} abilities`}
                    >
                      Abilities
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link
                      href={detailLink.href}
                      onClick={() =>
                        handleDetailLinkClick(
                          detailLink.storeReturnHrefInSession,
                          detailLink.returnHref,
                        )
                      }
                    >
                      View details
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="relative h-9"
                    disabled={addingSlug === pokemon.slug}
                    onClick={() => handleAddToTeam(pokemon.slug)}
                  >
                    {addingSlug === pokemon.slug ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <>
                        <Plus className="size-4" aria-hidden />
                        Add to Team
                      </>
                    )}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
        <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-2 text-xs text-muted-foreground">
          {listQuery.isFetchingNextPage ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Loading more Pokémon…
            </span>
          ) : null}
        </div>
        </>
      ) : (
        <div ref={tableScrollRef} className="max-h-[min(72vh,calc(100dvh-10rem))] max-w-full overflow-auto overscroll-contain rounded-2xl border border-border/50">
          <table className="w-max border-collapse text-sm">
            {/* thead is sticky inside this scroll pane (shared vertical + horizontal overflow) so headers track horizontal scroll and stay visible while scrolling rows. */}
            <thead className="sticky top-0 z-20 text-[0.65rem] uppercase tracking-wide text-muted-foreground [&_th]:bg-muted">
              <tr className="border-b border-border/40">
                <SortableColumnHeader
                  label="#"
                  column="id"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="w-14 text-left tabular-nums normal-case"
                  buttonClassName="justify-start"
                />
                <SortableColumnHeader
                  label="Pokémon"
                  column="name"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="max-w-[22rem] min-w-[11rem] overflow-visible normal-case tracking-normal"
                  buttonClassName="normal-case tracking-normal"
                />
                <th
                  scope="col"
                  className="min-w-0 whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Types
                </th>
                <SortableColumnHeader
                  label="Total"
                  column="total"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="HP"
                  column="hp"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="Atk"
                  column="attack"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="Def"
                  column="defense"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="SpA"
                  column="specialAttack"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="SpD"
                  column="specialDefense"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <SortableColumnHeader
                  label="Speed"
                  column="speed"
                  activeColumn={sortBy}
                  direction={sortDirection}
                  onActivate={handleSortColumn}
                  className="text-center tabular-nums"
                  buttonClassName="justify-center"
                />
                <th
                  scope="col"
                  className="whitespace-nowrap border-l border-border/45 px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loadedPokemon.map((pokemon) => {
                const detailLink = getPokemonDetailLink(pokemon.slug);

                return (
                <tr
                  key={pokemon.slug}
                  className="group border-t border-border/40 bg-card/30 hover:bg-card/60"
                >
                  <td className={cn("w-14 shrink-0 px-3 py-3 text-left tabular-nums text-muted-foreground", sortBy === "id" && "bg-primary/5 text-primary")}>
                    {formatPokedexDisplayNumber(pokemon.pokedexDisplayNo)}
                  </td>
                  <td className={cn("max-w-[22rem] px-3 py-3 align-middle", sortBy === "name" && "bg-primary/5")}>
                    <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                      <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/50 sm:mt-0">
                        <PokemonSprite
                          src={pokemon.spriteNormal}
                          alt={pokemon.name}
                          size={40}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <PokemonListNameDisplay
                        pokemon={pokemon}
                        detailLink={detailLink}
                        nameClassName={cn(
                          "break-words text-sm",
                          sortBy === "name" && "text-primary",
                        )}
                        onDetailClick={() =>
                          handleDetailLinkClick(
                            detailLink.storeReturnHrefInSession,
                            detailLink.returnHref,
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="min-w-0 max-w-[11rem] px-3 py-3 align-middle">
                    <div className="flex flex-wrap gap-1">
                      <TypeBadge type={pokemon.primaryType} />
                      {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                    </div>
                  </td>
                  <td className={cn("px-3 py-3 text-center text-sm font-semibold tabular-nums whitespace-nowrap", getSortCellClass("total"))}>
                    {pokemon.total}
                  </td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("hp"))}>{pokemon.hp}</td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("attack"))}>{pokemon.attack}</td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("defense"))}>{pokemon.defense}</td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("specialAttack"))}>{pokemon.specialAttack}</td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("specialDefense"))}>{pokemon.specialDefense}</td>
                  <td className={cn("px-3 py-3 text-center tabular-nums whitespace-nowrap", getSortCellClass("speed"))}>{pokemon.speed}</td>
                  <td
                    className={cn(
                      "border-l border-border/45 bg-card/30 px-3 py-3 text-right align-middle whitespace-nowrap",
                      "group-hover:bg-card/60",
                    )}
                  >
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" className="h-8 gap-1 px-3 text-sm">
                        <Link
                          href={detailLink.href}
                          onClick={() =>
                            handleDetailLinkClick(
                              detailLink.storeReturnHrefInSession,
                              detailLink.returnHref,
                            )
                          }
                        >
                          Details
                          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 shrink-0 gap-1 whitespace-nowrap px-3 text-sm"
                        aria-label={addingSlug === pokemon.slug ? undefined : `Add ${pokemon.name} to team`}
                        disabled={addingSlug === pokemon.slug}
                        onClick={() => handleAddToTeam(pokemon.slug)}
                      >
                        {addingSlug === pokemon.slug ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <>
                            <Plus className="size-3.5 shrink-0" aria-hidden />
                            Add to Team
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-2 text-xs text-muted-foreground">
            {listQuery.isFetchingNextPage ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading more Pokémon…
              </span>
            ) : null}
          </div>
        </div>
      )}
      {abilityDialogPokemon ? (
        <div
          className="fixed inset-0 z-50 bg-background/25 sm:bg-background/10"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAbilityDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pokemon-abilities-title"
            className={cn(
              "fixed inset-x-3 bottom-3 flex max-h-[min(72vh,32rem)] flex-col rounded-3xl border border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/30",
              "sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-24 sm:w-[22rem] sm:rounded-2xl sm:p-4",
              "lg:right-[max(1rem,calc((100vw-72rem)/2+1rem))] lg:w-[24rem]",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Abilities
                </p>
                <h2 id="pokemon-abilities-title" className="mt-1 text-lg font-semibold text-foreground">
                  {abilityDialogPokemon.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeAbilityDialog}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Close abilities"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto pr-1">
              {abilityDetailQuery.isPending ? (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading abilities...
                </p>
              ) : abilityDetailQuery.isError ? (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Unable to load abilities right now.
                </p>
              ) : abilityDetailQuery.data?.abilities.length ? (
                abilityDetailQuery.data.abilities.map((ability) => (
                  <article
                    key={ability.slug}
                    className="rounded-xl border border-border/55 bg-background/55 p-3"
                  >
                    <h3 className="text-sm font-semibold text-foreground">
                      {ability.name}{" "}
                      {ability.isHidden ? (
                        <span className="font-medium text-muted-foreground">
                          {HIDDEN_ABILITY_LABEL}
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {ability.description}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ability details are available for this Pokémon.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
        </div>
      </div>
    </div>
  );
}
