"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/utils";
import { useTeamStore } from "@/store/team-store";
import type { TeamPokemon } from "@/types/team";
import { HIDDEN_ABILITY_LABEL, type Ability } from "@/types/ability";
import type { Move } from "@/types/move";
import type { Item } from "@/types/item";
import { fetchCompetitiveItemsFromApi } from "@/lib/items/data-access";
import { TypeBadge, TYPE_COLORS } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { SlotSelector, type SelectorOption } from "./slot-selector";
import { PokemonPicker } from "./pokemon-picker";
import { buildBuilderPokemonDetailHref } from "@/lib/pokemon/pokemon-detail-query";
import { EmptyPokemonSlot } from "./empty-pokemon-slot";

type OpenPanel =
  | "pokemon-search"
  | "ability"
  | "item"
  | "move-1"
  | "move-2"
  | "move-3"
  | "move-4"
  | null;

const EMPTY_ABILITIES: Ability[] = [];
const EMPTY_MOVES: Move[] = [];

function itemMetaLabel(value: string | undefined): string | undefined {
  return value?.replace(/_/g, " ");
}

function itemInitials(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }

  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
}

function ItemIcon({ item, className }: { item: Pick<Item, "name" | "iconUrl">; className?: string }) {
  if (item.iconUrl) {
    return (
      <span
        aria-hidden
        className={cn("size-4 shrink-0 bg-contain bg-center bg-no-repeat", className)}
        style={{ backgroundImage: `url(${item.iconUrl})` }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full",
        "border border-border/60 bg-background/70 text-[7px] font-bold leading-none text-muted-foreground",
        className,
      )}
    >
      {itemInitials(item.name)}
    </span>
  );
}

type PokemonSlotProps = {
  teamSlot: TeamPokemon;
  className?: string;
};

function PokemonSlotComponent({ teamSlot, className }: PokemonSlotProps) {
  const { slot, pokemon, selectedAbility, selectedItem, moves } = teamSlot;

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const addPokemon = useTeamStore((s) => s.addPokemon);
  const replacePokemon = useTeamStore((s) => s.replacePokemon);
  const removePokemon = useTeamStore((s) => s.removePokemon);
  const setAbility = useTeamStore((s) => s.setAbility);
  const setItem = useTeamStore((s) => s.setItem);
  const setMove = useTeamStore((s) => s.setMove);
  const itemQuery = useQuery({
    queryKey: ["competitive-items"],
    queryFn: fetchCompetitiveItemsFromApi,
    staleTime: 1000 * 60 * 60,
  });

  const toggle = useCallback(
    (panel: OpenPanel) => setOpenPanel((prev) => (prev === panel ? null : panel)),
    [],
  );

  const focusNextMovePanel = useCallback(
    (currentSlot: 1 | 2 | 3 | 4) => {
      const movePanelKeys: OpenPanel[] = ["move-1", "move-2", "move-3", "move-4"];
      const currentIndex = currentSlot - 1;
      const nextIndex = movePanelKeys.findIndex((key, idx) => idx > currentIndex);
      if (nextIndex === -1) {
        setOpenPanel(null);
        return;
      }
      setOpenPanel(movePanelKeys[nextIndex]);
    },
    [],
  );

  const pokemonAbilities = pokemon?.abilities ?? EMPTY_ABILITIES;
  const pokemonMoves = pokemon?.moves ?? EMPTY_MOVES;

  const abilityOptions: SelectorOption[] = useMemo(
    () =>
      pokemonAbilities.map((a: Ability) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        meta: a.isHidden ? HIDDEN_ABILITY_LABEL : undefined,
      })),
    [pokemonAbilities],
  );

  const moveOptions: SelectorOption[] = useMemo(
    () =>
      pokemonMoves
        .map((m: Move) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          meta: m.type,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [pokemonMoves],
  );

  const itemOptions: SelectorOption[] = useMemo(
    () =>
      (itemQuery.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        meta: itemMetaLabel(item.competitiveGroup ?? item.tags?.[0]),
      })),
    [itemQuery.data],
  );

  const selectedAbilityOption = useMemo(
    () =>
      selectedAbility
        ? {
            id: selectedAbility.id,
            name: selectedAbility.name,
            slug: selectedAbility.slug,
            meta: selectedAbility.isHidden ? HIDDEN_ABILITY_LABEL : undefined,
          }
        : null,
    [selectedAbility],
  );

  const selectedItemOption = useMemo(
    () =>
      selectedItem
        ? { id: selectedItem.id, name: selectedItem.name, slug: selectedItem.slug }
        : null,
    [selectedItem],
  );

  const selectedMoveCount = useMemo(
    () => moves.filter((entry) => entry.move !== null).length,
    [moves],
  );
  const completedFieldCount =
    Number(Boolean(selectedAbility)) + Number(Boolean(selectedItem)) + selectedMoveCount;
  const primaryTypeColor = TYPE_COLORS[pokemon?.primaryType ?? ""] ?? "#9ca3af";
  const slotAccentStyle = {
    "--slot-accent": primaryTypeColor,
    borderColor: `${primaryTypeColor}55`,
  } as CSSProperties;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel]);

  // --- Empty slot ---
  if (!pokemon) {
    return (
      <div
        ref={cardRef}
        className={cn(
          "rounded-2xl border border-border/60 bg-card shadow-md",
          openPanel === "pokemon-search" ? "p-4" : "",
          className,
        )}
      >
        {openPanel === "pokemon-search" ? (
          <PokemonPicker
            onSelect={(p) => {
              addPokemon(slot, p);
              setOpenPanel(null);
            }}
            onCancel={() => setOpenPanel(null)}
            currentSelectedSlug={null}
          />
        ) : (
          <EmptyPokemonSlot slot={slot} onAdd={() => setOpenPanel("pokemon-search")} />
        )}
      </div>
    );
  }

  // --- Filled slot ---
  return (
    <div
      ref={cardRef}
      style={slotAccentStyle}
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-md",
        openPanel && "z-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--slot-accent)] opacity-75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 size-28 rounded-full bg-[var(--slot-accent)] opacity-10 blur-2xl"
      />

      {openPanel === "pokemon-search" ? (
        <PokemonPicker
          onSelect={(p) => {
            replacePokemon(slot, p);
            setOpenPanel(null);
          }}
          onCancel={() => setOpenPanel(null)}
          currentSelectedSlug={pokemon.slug}
        />
      ) : (
        <>
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background/60 shadow-inner">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[var(--slot-accent)] opacity-10"
                />
                <PokemonSprite
                  src={pokemon.spriteNormal}
                  alt={pokemon.name}
                  size={56}
                  className="relative h-full w-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Slot {slot}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <CheckCircle2 className="size-3 text-[var(--slot-accent)]" aria-hidden />
                    <span title="Configured build fields: ability, item, and four moves">
                      {completedFieldCount}/6 fields
                    </span>
                  </span>
                </div>
                <Link
                  href={buildBuilderPokemonDetailHref(pokemon.slug)}
                  className="mt-1 block truncate text-base font-semibold capitalize leading-tight text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {pokemon.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  <TypeBadge type={pokemon.primaryType} />
                  {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-border/40 bg-background/40 p-1">
              <button
                type="button"
                onClick={() => toggle("pokemon-search")}
                aria-label={`Replace ${pokemon.name}`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <RefreshCw className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  removePokemon(slot);
                  setOpenPanel(null);
                }}
                aria-label={`Remove ${pokemon.name} from slot ${slot}`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-background/20 p-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Build
              </p>
            </div>
            <SlotSelector
              label="Ability"
              selected={selectedAbilityOption}
              options={abilityOptions}
              isOpen={openPanel === "ability"}
              onToggle={() => toggle("ability")}
              searchable={false}
              selectedSuffix={
                selectedAbility?.isHidden ? (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    {HIDDEN_ABILITY_LABEL}
                  </span>
                ) : null
              }
              onSelect={(opt) => {
                const ability = pokemon.abilities.find((a) => a.id === opt.id) ?? null;
                setAbility(slot, ability);
                setOpenPanel(null);
              }}
            />

            <SlotSelector
              label="Item"
              selected={selectedItemOption}
              selectedPrefix={
                selectedItem ? <ItemIcon item={selectedItem} className="size-4" /> : null
              }
              options={itemOptions}
              isOpen={openPanel === "item"}
              onToggle={() => toggle("item")}
              onSelect={(opt) => {
                const item = itemQuery.data?.find((i) => i.id === opt.id) ?? null;
                setItem(slot, item);
                setOpenPanel(null);
              }}
              onClear={() => {
                setItem(slot, null);
                setOpenPanel(null);
              }}
              renderOption={(opt) => {
                const item = itemQuery.data?.find((entry) => entry.id === opt.id);
                return (
                  <span className="flex min-w-0 items-center gap-2">
                    {item ? <ItemIcon item={item} /> : null}
                    <span className="truncate">{opt.name}</span>
                  </span>
                );
              }}
            />
          </div>

          <div className="relative flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-background/20 p-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Moveset
              </p>
              <span className="text-[10px] text-muted-foreground/70">{selectedMoveCount}/4 moves</span>
            </div>
            {moves.map((entry) => {
              const panelKey = `move-${entry.slot}` as OpenPanel;
              return (
                <SlotSelector
                  key={entry.slot}
                  label={`Move ${entry.slot}`}
                  selected={
                    entry.move
                      ? { id: entry.move.id, name: entry.move.name, slug: entry.move.slug }
                      : null
                  }
                  selectedPrefix={
                    entry.move ? <TypeBadge type={entry.move.type} size="sm" className="px-1.5 text-[10px]" /> : null
                  }
                  options={moveOptions}
                  isOpen={openPanel === panelKey}
                  onToggle={() => toggle(panelKey)}
                  hideOptionMeta
                  onSelect={(opt) => {
                    const move = pokemon.moves.find((m) => m.id === opt.id) ?? null;
                    setMove(slot, entry.slot as 1 | 2 | 3 | 4, move);
                    focusNextMovePanel(entry.slot as 1 | 2 | 3 | 4);
                  }}
                  onClear={() => {
                    setMove(slot, entry.slot as 1 | 2 | 3 | 4, null);
                    setOpenPanel(null);
                  }}
                  renderOption={(opt) => (
                    <span className="flex w-full items-center justify-between gap-3">
                      <span>{opt.name}</span>
                      {opt.meta && <TypeBadge type={opt.meta} size="sm" className="shrink-0" />}
                    </span>
                  )}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export const PokemonSlot = memo(PokemonSlotComponent);
