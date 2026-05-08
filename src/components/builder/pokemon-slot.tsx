"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";

import { cn } from "@/utils";
import { useTeamStore } from "@/store/team-store";
import type { TeamPokemon } from "@/types/team";
import type { Ability } from "@/types/ability";
import type { Move } from "@/types/move";
import { MOCK_ITEMS } from "@/data/mock-items";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { SlotSelector, type SelectorOption } from "./slot-selector";
import { PokemonPicker } from "./pokemon-picker";
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

const ITEMS_AS_OPTIONS: SelectorOption[] = MOCK_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  meta: item.tags?.[0]?.replace(/_/g, " "),
}));
const EMPTY_ABILITIES: Ability[] = [];
const EMPTY_MOVES: Move[] = [];

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

  const toggle = useCallback(
    (panel: OpenPanel) => setOpenPanel((prev) => (prev === panel ? null : panel)),
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
        meta: a.isHidden ? "hidden" : undefined,
      })),
    [pokemonAbilities],
  );

  const moveOptions: SelectorOption[] = useMemo(
    () =>
      pokemonMoves.map((m: Move) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        meta: m.type,
      })),
    [pokemonMoves],
  );

  const selectedAbilityOption = useMemo(
    () =>
      selectedAbility
        ? {
            id: selectedAbility.id,
            name: selectedAbility.name,
            slug: selectedAbility.slug,
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
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md",
        openPanel && "z-10",
        className,
      )}
    >
      {/* Header — sprite + name + types + actions */}
      {openPanel === "pokemon-search" ? (
        <PokemonPicker
          onSelect={(p) => {
            replacePokemon(slot, p);
            setOpenPanel(null);
          }}
          onCancel={() => setOpenPanel(null)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-background/60">
                <PokemonSprite
                  src={pokemon.spriteNormal}
                  alt={pokemon.name}
                  size={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold capitalize leading-tight text-foreground">
                  {pokemon.name}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <TypeBadge type={pokemon.primaryType} />
                  {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
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

          {/* Ability + Item selectors */}
          <div className="flex flex-col gap-1.5">
            <SlotSelector
              label="Ability"
              selected={selectedAbilityOption}
              options={abilityOptions}
              isOpen={openPanel === "ability"}
              onToggle={() => toggle("ability")}
              onSelect={(opt) => {
                const ability = pokemon.abilities.find((a) => a.id === opt.id) ?? null;
                setAbility(slot, ability);
                setOpenPanel(null);
              }}
              onClear={() => {
                setAbility(slot, null);
                setOpenPanel(null);
              }}
            />

            <SlotSelector
              label="Item"
              selected={selectedItemOption}
              options={ITEMS_AS_OPTIONS}
              isOpen={openPanel === "item"}
              onToggle={() => toggle("item")}
              onSelect={(opt) => {
                const item = MOCK_ITEMS.find((i) => i.id === opt.id) ?? null;
                setItem(slot, item);
                setOpenPanel(null);
              }}
              onClear={() => {
                setItem(slot, null);
                setOpenPanel(null);
              }}
            />
          </div>

          {/* Move selectors */}
          <div className="flex flex-col gap-1.5">
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
                  options={moveOptions}
                  isOpen={openPanel === panelKey}
                  onToggle={() => toggle(panelKey)}
                  onSelect={(opt) => {
                    const move = pokemon.moves.find((m) => m.id === opt.id) ?? null;
                    setMove(slot, entry.slot as 1 | 2 | 3 | 4, move);
                    setOpenPanel(null);
                  }}
                  onClear={() => {
                    setMove(slot, entry.slot as 1 | 2 | 3 | 4, null);
                    setOpenPanel(null);
                  }}
                  renderOption={(opt) => (
                    <span className="flex items-center gap-2">
                      <span>{opt.name}</span>
                      {opt.meta && <TypeBadge type={opt.meta} size="sm" />}
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
