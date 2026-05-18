"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LayoutGrid, List, Loader2, Search, X } from "lucide-react";

import { ABILITY_TAG_DEFINITIONS, ABILITY_TAG_DEFINITION_BY_ID } from "@/data/ability-tags";
import {
  fetchAbilitiesFromApi,
  fetchAbilityDetailFromApi,
} from "@/lib/abilities/data-access";
import { HIDDEN_ABILITY_LABEL, type AbilityListItem, type AbilityTag } from "@/types/ability";
import { cn } from "@/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error/error-message";

type AbilityViewMode = "cards" | "list";

function tagLabel(tag: AbilityTag): string {
  return ABILITY_TAG_DEFINITION_BY_ID.get(tag)?.label ?? tag.replaceAll("_", " ");
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function abilityMatchesSearch(ability: AbilityListItem, search: string): boolean {
  if (!search) {
    return true;
  }

  return (
    ability.name.toLowerCase().includes(search) ||
    ability.slug.toLowerCase().includes(search) ||
    ability.description.toLowerCase().includes(search)
  );
}

type AbilityBrowserProps = {
  initialAbility?: string;
};

export function AbilityBrowser({ initialAbility = "" }: AbilityBrowserProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<AbilityTag[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [view, setView] = useState<AbilityViewMode>("cards");

  const abilityListQuery = useQuery({
    queryKey: ["abilities", "browser"],
    queryFn: () => fetchAbilitiesFromApi({ limit: 1000 }),
    staleTime: 1000 * 60 * 10,
  });

  const abilities = useMemo(
    () => abilityListQuery.data?.abilities ?? [],
    [abilityListQuery.data],
  );
  const normalizedSearch = normalizeSearch(search);
  const filteredAbilities = useMemo(
    () =>
      abilities.filter((ability) => {
        if (!abilityMatchesSearch(ability, normalizedSearch)) {
          return false;
        }
        return selectedTags.every((tag) => ability.tags.includes(tag));
      }),
    [abilities, normalizedSearch, selectedTags],
  );

  const initialSlug = initialAbility.trim() || null;
  const activeSlug = selectedSlug ?? initialSlug ?? filteredAbilities[0]?.slug ?? null;

  const selectedAbilitySummary =
    filteredAbilities.find((ability) => ability.slug === activeSlug) ??
    abilities.find((ability) => ability.slug === activeSlug) ??
    null;

  const abilityDetailQuery = useQuery({
    queryKey: ["ability-detail", activeSlug],
    queryFn: () => fetchAbilityDetailFromApi(activeSlug ?? ""),
    enabled: Boolean(activeSlug),
    staleTime: 1000 * 60 * 10,
  });

  const tagCounts = useMemo(() => {
    const counts = new Map<AbilityTag, number>();
    abilities.forEach((ability) => {
      ability.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return counts;
  }, [abilities]);

  function toggleTag(tag: AbilityTag) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((entry) => entry !== tag)
        : [...current, tag],
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedTags([]);
  }

  function selectAbility(slug: string) {
    setSelectedSlug(slug);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("ability", slug);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  const hasActiveFilters = Boolean(search.trim() || selectedTags.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Abilities
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Battle Ability Browser
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Search abilities by battle purpose, filter by competitive tags, inspect effect text,
              and open Pokémon detail pages for species that can use each ability.
            </p>
          </div>
          <Button asChild variant="secondary" className="w-fit rounded-xl">
            <Link href="/pokedex">Open Pokédex</Link>
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/45 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2">
            <Search className="size-4 flex-shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ability name or effect..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
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
                <LayoutGrid className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  view === "list"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List layout"
              >
                <List className="size-4" aria-hidden />
              </button>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="size-3.5" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ABILITY_TAG_DEFINITIONS.map((definition) => {
            const active = selectedTags.includes(definition.id);
            const count = tagCounts.get(definition.id) ?? 0;

            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => toggleTag(definition.id)}
                title={definition.description}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/55 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                )}
              >
                {definition.label}
                {count > 0 ? <span className="ml-1 opacity-70">({count})</span> : null}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredAbilities.length}</span>{" "}
          of <span className="font-medium text-foreground">{abilities.length}</span> abilities
        </p>
      </section>

      {abilityListQuery.isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading abilities...
        </div>
      ) : abilityListQuery.isError ? (
        <ErrorMessage
          title="Abilities unavailable"
          message={
            abilityListQuery.error instanceof Error
              ? abilityListQuery.error.message
              : "Unable to load abilities right now."
          }
          onRetry={() => {
            void abilityListQuery.refetch();
          }}
          isRetrying={abilityListQuery.isFetching}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
          <section
            className={cn(
              view === "cards"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                : "space-y-2",
            )}
            aria-label="Ability results"
          >
            {filteredAbilities.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2">
                No abilities match these filters. Try clearing search or removing a tag.
              </p>
            ) : (
              filteredAbilities.map((ability) => {
                const active = activeSlug === ability.slug;

                return (
                  <button
                    key={ability.slug}
                    type="button"
                    onClick={() => selectAbility(ability.slug)}
                    className={cn(
                      "group rounded-2xl border bg-card/45 p-4 text-left shadow-sm transition-colors",
                      "hover:border-primary/40 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      active ? "border-primary/50 bg-primary/10" : "border-border/55",
                      view === "list" && "flex items-start justify-between gap-4",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-foreground">
                          {ability.name}
                        </h2>
                        <span className="rounded-full bg-background/55 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{ability.id}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {ability.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {ability.tags.length > 0 ? (
                          ability.tags.slice(0, view === "list" ? 4 : 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border/45 bg-background/45 px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {tagLabel(tag)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground/70">
                            Untagged
                          </span>
                        )}
                      </div>
                    </div>
                    {view === "list" ? (
                      <span className="mt-1 shrink-0 text-xs font-medium text-primary">
                        Details
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:overflow-hidden">
            {!selectedAbilitySummary ? (
              <p className="text-sm text-muted-foreground">
                Select an ability to view its battle details and Pokémon.
              </p>
            ) : (
              <div className="flex min-h-0 flex-col gap-5">
                <div className="shrink-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ability Detail
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">
                    {selectedAbilitySummary.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {selectedAbilitySummary.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedAbilitySummary.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {tagLabel(tag)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-border/45 bg-background/30 p-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Want to compare this ability across the full Pokédex? Open the Pokédex with{" "}
                    <span className="font-medium text-foreground">
                      {selectedAbilitySummary.name}
                    </span>{" "}
                    already selected as the ability filter.
                  </p>
                  <Button asChild variant="secondary" size="sm" className="mt-3 rounded-xl">
                    <Link href={`/pokedex?ability=${encodeURIComponent(selectedAbilitySummary.slug)}`}>
                      Open Pokédex Filter
                    </Link>
                  </Button>
                </div>

                <div className="flex min-h-0 flex-col border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Pokémon That Can Have {selectedAbilitySummary.name}
                    </h3>
                    {abilityDetailQuery.data ? (
                      <span className="text-xs text-muted-foreground">
                        {abilityDetailQuery.data.pokemon.length}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Select a row to open that Pokémon&apos;s detail page.{" "}
                    {HIDDEN_ABILITY_LABEL} means the ability is available only as a hidden ability.
                  </p>

                  {abilityDetailQuery.isPending ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Loading Pokémon...
                    </p>
                  ) : abilityDetailQuery.isError ? (
                    <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      Unable to load Pokémon for this ability.
                    </p>
                  ) : abilityDetailQuery.data?.pokemon.length ? (
                    <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                      {abilityDetailQuery.data.pokemon.map((pokemon) => (
                        <Link
                          key={`${pokemon.slug}-${pokemon.isHidden ? "hidden" : "standard"}`}
                          href={`/pokemon/${pokemon.slug}?from=abilities&ability=${encodeURIComponent(selectedAbilitySummary.slug)}`}
                          className="group flex items-center gap-3 rounded-xl border border-border/45 bg-background/35 p-2 transition-colors hover:border-primary/35 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted/50">
                            <PokemonSprite
                              src={pokemon.spriteNormal}
                              alt={pokemon.name}
                              size={40}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {pokemon.name}{" "}
                              {pokemon.isHidden ? (
                                <span className="font-normal text-muted-foreground">
                                  {HIDDEN_ABILITY_LABEL}
                                </span>
                              ) : null}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              <TypeBadge type={pokemon.primaryType} />
                              {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
                            </div>
                          </div>
                          <span className="hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary/10 sm:inline-flex">
                            View Details
                            <ArrowRight className="size-3.5" aria-hidden />
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No Pokémon references are available for this ability yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
