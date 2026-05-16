"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, LayoutGrid, List, Loader2, Plus, Search } from "lucide-react";

import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import { ROUTES } from "@/constants/routes";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { PokemonListItem } from "@/types/pokemon";
import type { PokemonType } from "@/types/shared";
import { fetchPokemonDetailFromApi, fetchPokemonListFromApi } from "@/lib/pokemon/data-access";
import { cn } from "@/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { ErrorMessage } from "@/components/error/error-message";
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
  if (sortBy === "id" || sortBy === "name") {
    return `National #${pokemon.id}`;
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

  return `${primaryLabel} ${primaryValue} · #${pokemon.id}`;
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
          active ? "text-foreground" : "text-muted-foreground",
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

export function PokedexExplorer() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokemonType | "">("");
  const [generationFilter, setGenerationFilter] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<PokemonListSortKey>("id");
  const [sortDirection, setSortDirection] = useState<PokemonListSortDirection>("asc");
  const [view, setView] = useState<ViewMode>("cards");
  const [page, setPage] = useState(1);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const addPokemon = useTeamStore((s) => s.addPokemon);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (typeFilter) {
      params.set("type", typeFilter);
    }

    if (generationFilter !== "") {
      params.set("generation", String(generationFilter));
    }

    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);

    return params;
  }, [page, debouncedSearch, typeFilter, generationFilter, sortBy, sortDirection]);

  const listQuery = useQuery({
    queryKey: ["pokedex", queryParams.toString()],
    queryFn: () =>
      fetchPokemonListFromApi({
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        generation: generationFilter === "" ? undefined : generationFilter,
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortDirection,
      }),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const fullStatSortPending = Boolean(
    listQuery.isFetching && sortKeyNeedsFullResultHydration(sortBy),
  );

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.limit))
    : 1;

  async function handleAddToTeam(slug: string) {
    const slot =
      useTeamStore.getState().team.pokemon.find((entry) => !entry.pokemon)?.slot ?? null;

    if (!slot) {
      setStatus("Your team is full. Open the builder to swap a Pokémon.");
      return;
    }

    setAddingSlug(slug);
    setStatus(null);

    try {
      const detail = await fetchPokemonDetailFromApi(slug);
      addPokemon(slot, detail);
      setStatus(`Added ${detail.name} to slot ${slot}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add Pokémon.");
    } finally {
      setAddingSlug(null);
    }
  }

  function handleSortColumn(next: PokemonListSortKey) {
    setPage(1);
    if (sortBy === next) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(next);
      setSortDirection(defaultSortDirection(next));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className={cn(view === "table" && "flex flex-col items-center")}>
        <div className={cn("space-y-6", view === "table" ? "w-max max-w-full" : "w-full")}>
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pokédex</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Browse Pokémon</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Browse Pokémon in card or list view, then search, filter by type or generation, and sort by National #,
            name, BST, or battle stats. Add contenders directly to your team without lore dumps or training noise.
          </p>
        </header>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2">
            <Search className="size-4 flex-shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or slug…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter((event.target.value || "") as PokemonType | "");
                setPage(1);
              }}
              className={cn(
                "h-10 min-w-[8.5rem] rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground",
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
              aria-label="Filter by generation"
              value={generationFilter === "" ? "" : String(generationFilter)}
              onChange={(event) => {
                const next = event.target.value;
                setGenerationFilter(next === "" ? "" : Number(next));
                setPage(1);
              }}
              className={cn(
                "h-10 min-w-[10rem] rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground",
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
                setPage(1);
              }}
              className={cn(
                "h-10 min-w-[9.5rem] rounded-xl border border-border/50 bg-background/60 px-3 text-sm text-foreground",
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
              className="h-10 min-w-10 px-2"
              aria-label={
                sortDirection === "asc" ? "Sort direction: ascending. Click for descending." : "Sort direction: descending. Click for ascending."
              }
              onClick={() => {
                setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="mx-auto size-4" aria-hidden />
              ) : (
                <ArrowDown className="mx-auto size-4" aria-hidden />
              )}
            </Button>

            <div className="flex items-center rounded-xl border border-border/50 bg-background/40 p-0.5">
              <button
                type="button"
                aria-pressed={view === "cards"}
                onClick={() => setView("cards")}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
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
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Table layout"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {fullStatSortPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Sorting the full filtered list (one-time fetch per filter)…
              </span>
            ) : listQuery.isFetching && !listQuery.isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Updating results…
              </span>
            ) : listQuery.data ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {listQuery.data.total === 0 ? 0 : (listQuery.data.page - 1) * listQuery.data.limit + 1}
                  –
                  {(listQuery.data.page - 1) * listQuery.data.limit + listQuery.data.pokemon.length}
                </span>{" "}
                of <span className="font-medium text-foreground">{listQuery.data.total}</span> Pokémon
              </>
            ) : (
              " "
            )}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9"
              disabled={page >= totalPages || listQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {status ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            status.startsWith("Added")
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-border/60 bg-muted/40 text-muted-foreground",
          )}
          role="status"
        >
          {status}{" "}
          {status.startsWith("Added") ? (
            <Link href={ROUTES.builder} className="font-medium text-primary underline-offset-4 hover:underline">
              Open team builder
            </Link>
          ) : null}
        </p>
      ) : null}

      {listQuery.isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading Pokémon…
        </div>
      ) : listQuery.isError ? (
        <ErrorMessage
          title="Pokedex unavailable"
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
      ) : listQuery.data?.pokemon.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground">
          No Pokémon match these filters. Try clearing search or widening your filters.
        </p>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listQuery.data?.pokemon.map((pokemon) => (
            <article
              key={pokemon.slug}
              className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
                  <PokemonSprite
                    src={pokemon.spriteNormal}
                    alt={pokemon.name}
                    size={64}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-foreground">{pokemon.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPokemonCardSubtitle(pokemon, sortBy)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <TypeBadge type={pokemon.primaryType} />
                    {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-9 w-full"
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
            </article>
          ))}
        </div>
      ) : (
        <div className="max-h-[min(72vh,calc(100dvh-10rem))] max-w-full overflow-auto overscroll-contain rounded-2xl border border-border/50">
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
              {listQuery.data?.pokemon.map((pokemon) => (
                <tr
                  key={pokemon.slug}
                  className="group border-t border-border/40 bg-card/30 hover:bg-card/60"
                >
                  <td className="w-14 shrink-0 px-3 py-3 text-left tabular-nums text-muted-foreground">
                    {String(pokemon.id).padStart(4, "0")}
                  </td>
                  <td className="max-w-[22rem] px-3 py-3 align-middle">
                    <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                      <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/50 sm:mt-0">
                        <PokemonSprite
                          src={pokemon.spriteNormal}
                          alt={pokemon.name}
                          size={40}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 max-w-full">
                        <p className="break-words font-medium leading-snug text-foreground">{pokemon.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-0 max-w-[11rem] px-3 py-3 align-middle">
                    <div className="flex flex-wrap gap-1">
                      <TypeBadge type={pokemon.primaryType} />
                      {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-semibold tabular-nums whitespace-nowrap text-foreground">
                    {pokemon.total}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.hp}</td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.attack}</td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.defense}</td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.specialAttack}</td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.specialDefense}</td>
                  <td className="px-3 py-3 text-center tabular-nums whitespace-nowrap text-foreground">{pokemon.speed}</td>
                  <td
                    className={cn(
                      "border-l border-border/45 bg-card/30 px-3 py-3 text-right align-middle whitespace-nowrap",
                      "group-hover:bg-card/60",
                    )}
                  >
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
