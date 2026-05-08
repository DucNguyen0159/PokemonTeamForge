"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Loader2, Plus, Search } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { PokemonListPayload } from "@/types/api";
import type { PokemonDetail } from "@/types/pokemon";
import type { PokemonType } from "@/types/shared";
import { cn } from "@/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/store/team-store";

const PAGE_SIZE = 24;
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type ViewMode = "cards" | "table";

async function fetchPokemonList(searchParams: URLSearchParams): Promise<PokemonListPayload> {
  const response = await fetch(`/api/pokemon?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to load Pokémon right now.");
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: PokemonListPayload;
    error?: { message?: string };
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? "Unable to load Pokémon.");
  }

  return payload.data;
}

async function fetchPokemonDetail(slug: string): Promise<PokemonDetail> {
  const response = await fetch(`/api/pokemon/${encodeURIComponent(slug)}`);

  const payload = (await response.json()) as {
    success: boolean;
    data?: PokemonDetail;
    error?: { message?: string };
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? "Could not load that Pokémon.");
  }

  return payload.data;
}

export function PokedexExplorer() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokemonType | "">("");
  const [generationFilter, setGenerationFilter] = useState<number | "">("");
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

    return params;
  }, [page, debouncedSearch, typeFilter, generationFilter]);

  const listQuery = useQuery({
    queryKey: ["pokedex", queryParams.toString()],
    queryFn: () => fetchPokemonList(queryParams),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

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
      const detail = await fetchPokemonDetail(slug);
      addPokemon(slot, detail);
      setStatus(`Added ${detail.name} to slot ${slot}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add Pokémon.");
    } finally {
      setAddingSlug(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm sm:p-5">
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
            {listQuery.isFetching && !listQuery.isPending ? (
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
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {listQuery.error instanceof Error ? listQuery.error.message : "Something went wrong."}
        </p>
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
                  {pokemon.spriteNormal ? (
                    <Image
                      src={pokemon.spriteNormal}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-foreground">{pokemon.name}</p>
                  <p className="text-xs text-muted-foreground">
                    BST {pokemon.total} · Gen {pokemon.generation}
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
        <div className="overflow-x-auto rounded-2xl border border-border/50">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Pokémon</th>
                <th className="px-4 py-3 font-medium">Types</th>
                <th className="px-4 py-3 font-medium">BST</th>
                <th className="px-4 py-3 font-medium">Gen</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data?.pokemon.map((pokemon) => (
                <tr key={pokemon.slug} className="border-t border-border/40 bg-card/30 hover:bg-card/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                        {pokemon.spriteNormal ? (
                          <Image
                            src={pokemon.spriteNormal}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-contain p-1"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{pokemon.name}</p>
                        <p className="text-xs text-muted-foreground">#{pokemon.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <TypeBadge type={pokemon.primaryType} />
                      {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{pokemon.total}</td>
                  <td className="px-4 py-3 text-muted-foreground">{pokemon.generation}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={addingSlug === pokemon.slug}
                      onClick={() => handleAddToTeam(pokemon.slug)}
                    >
                      {addingSlug === pokemon.slug ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <>
                          <Plus className="size-3.5" aria-hidden />
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
  );
}
