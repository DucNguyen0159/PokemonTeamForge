"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { PageIntro, PageIntroChip } from "@/components/layout/page-intro";
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
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileSheetDragOffset, setMobileSheetDragOffset] = useState(0);
  const [isDraggingMobileSheet, setIsDraggingMobileSheet] = useState(false);
  const sheetTouchStartYRef = useRef<number | null>(null);
  const sheetDragOffsetRef = useRef(0);
  const canDragSheetRef = useRef(false);
  const mobileSheetScrollRef = useRef<HTMLDivElement | null>(null);

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

    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMobileDetailOpen(true);
    }
  }

  const hasActiveFilters = Boolean(search.trim() || selectedTags.length > 0);
  const listRowMinHeightClass = "sm:min-h-[8.25rem]";

  useEffect(() => {
    if (!mobileDetailOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileDetailOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileDetailOpen]);

  useEffect(() => {
    if (!mobileDetailOpen) {
      setMobileSheetDragOffset(0);
      setIsDraggingMobileSheet(false);
      sheetTouchStartYRef.current = null;
      sheetDragOffsetRef.current = 0;
      canDragSheetRef.current = false;
    }
  }, [mobileDetailOpen]);

  function handleMobileSheetTouchStart(event: React.TouchEvent<HTMLElement>) {
    const startY = event.touches[0]?.clientY;
    if (startY == null) {
      return;
    }

    sheetTouchStartYRef.current = startY;
    sheetDragOffsetRef.current = mobileSheetDragOffset;

    const scroller = mobileSheetScrollRef.current;
    canDragSheetRef.current = !scroller || scroller.scrollTop <= 0;
  }

  function handleMobileSheetTouchMove(event: React.TouchEvent<HTMLElement>) {
    if (!canDragSheetRef.current || sheetTouchStartYRef.current == null) {
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (currentY == null) {
      return;
    }

    const delta = Math.max(0, currentY - sheetTouchStartYRef.current);
    if (delta <= 0) {
      return;
    }

    event.preventDefault();
    setIsDraggingMobileSheet(true);

    const nextOffset = Math.min(220, delta * 0.75);
    sheetDragOffsetRef.current = nextOffset;
    setMobileSheetDragOffset(nextOffset);
  }

  function handleMobileSheetTouchEnd() {
    if (!isDraggingMobileSheet) {
      sheetTouchStartYRef.current = null;
      sheetDragOffsetRef.current = 0;
      canDragSheetRef.current = false;
      return;
    }

    const shouldClose = sheetDragOffsetRef.current > 130;
    setIsDraggingMobileSheet(false);
    setMobileSheetDragOffset(0);
    sheetTouchStartYRef.current = null;
    sheetDragOffsetRef.current = 0;
    canDragSheetRef.current = false;

    if (shouldClose) {
      setMobileDetailOpen(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageIntro
        eyebrow="Abilities"
        title="Battle Ability Browser"
        description="Search abilities by battle purpose, filter by competitive tags, inspect effect text, and open Pokémon detail pages for species that can use each ability."
        actions={
          <Button asChild variant="secondary" className="w-fit rounded-xl">
            <Link href="/pokedex">Open Pokédex</Link>
          </Button>
        }
        chips={
          <>
            <PageIntroChip>{abilities.length || "All"} abilities</PageIntroChip>
            <PageIntroChip>{selectedTags.length} active tags</PageIntroChip>
            <PageIntroChip>{view === "cards" ? "Card layout" : "List layout"}</PageIntroChip>
          </>
        }
      />

      <section className="rounded-2xl border border-border/60 bg-card/45 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
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
                  "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
                  "flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
                className="h-10 gap-1.5 rounded-xl px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="size-3.5" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1 sm:max-h-none">
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
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
          <div className="space-y-5">
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
                        "group w-full rounded-2xl border bg-card/45 p-4 text-left shadow-sm transition-colors",
                        "hover:border-primary/40 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        active ? "border-primary/50 bg-primary/10" : "border-border/55",
                        view === "list" &&
                          cn("flex items-start justify-between gap-4", listRowMinHeightClass),
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-foreground">
                            {ability.name}
                          </h2>
                          <span className="rounded-full bg-background/55 px-2 py-0.5 text-[10px] text-muted-foreground">
                            #{ability.id}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-relaxed text-muted-foreground",
                            view === "list" ? "line-clamp-2" : "line-clamp-3",
                          )}
                        >
                          {ability.description}
                        </p>
                        <div className={cn("mt-3 flex gap-1.5", view === "list" ? "flex-nowrap overflow-hidden" : "flex-wrap")}>
                          {ability.tags.length > 0 ? (
                            ability.tags.slice(0, view === "list" ? 3 : 3).map((tag) => (
                              <span
                                key={tag}
                                className="shrink-0 rounded-full border border-border/45 bg-background/45 px-2 py-0.5 text-[11px] text-muted-foreground"
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
                        <span className="mt-1 hidden w-14 shrink-0 text-right text-xs font-medium text-primary sm:block">
                          Details
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </section>

          </div>

          <aside className="hidden h-fit rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:overflow-hidden">
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

      {mobileDetailOpen && selectedAbilitySummary ? (
        <div
          className="ptf-ability-sheet-backdrop fixed inset-0 z-50 bg-background/35 lg:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMobileDetailOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-ability-detail-title"
            className="ptf-ability-sheet-panel fixed inset-x-3 bottom-3 top-16 flex flex-col rounded-3xl border border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/30"
            onTouchStart={handleMobileSheetTouchStart}
            onTouchMove={handleMobileSheetTouchMove}
            onTouchEnd={handleMobileSheetTouchEnd}
            onTouchCancel={handleMobileSheetTouchEnd}
            style={{
              transform: mobileSheetDragOffset > 0 ? `translateY(${mobileSheetDragOffset}px)` : undefined,
              transition: isDraggingMobileSheet ? "none" : "transform 160ms ease-out",
            }}
          >
            <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/35" aria-hidden />
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ability Detail
                </p>
                <h2 id="mobile-ability-detail-title" className="mt-1 text-xl font-semibold text-foreground">
                  {selectedAbilitySummary.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Close ability detail"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div ref={mobileSheetScrollRef} className="min-h-0 space-y-4 overflow-y-auto pr-1">
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
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

              <div className="rounded-2xl border border-border/45 bg-background/30 p-3">
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

              <div className="border-t border-border/50 pt-4">
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
                  Select a row to open that Pokémon&apos;s detail page. {HIDDEN_ABILITY_LABEL} means the
                  ability is available only as a hidden ability.
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
                  <div className="mt-3 space-y-2">
                    {abilityDetailQuery.data.pokemon.map((pokemon) => (
                      <Link
                        key={`${pokemon.slug}-${pokemon.isHidden ? "hidden" : "standard"}`}
                        href={`/pokemon/${pokemon.slug}?from=abilities&ability=${encodeURIComponent(selectedAbilitySummary.slug)}`}
                        className="group flex items-center gap-3 rounded-xl border border-border/45 bg-background/35 p-2 transition-colors hover:border-primary/35 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={() => setMobileDetailOpen(false)}
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
          </section>
        </div>
      ) : null}
    </div>
  );
}
