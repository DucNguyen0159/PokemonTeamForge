"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  applyClampedSpread,
  ChampionsSpBudgetEditor,
} from "@/components/champions/shared/champions-sp-budget-editor";
import { ChampionsSpMiniRing } from "@/components/champions/shared/champions-sp-mini-ring";
import { EmptyPokemonSlot } from "@/components/builder/empty-pokemon-slot";
import { PokemonPicker } from "@/components/builder/pokemon-picker";
import { SlotSelector, type SelectorOption } from "@/components/builder/slot-selector";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { CHAMPIONS_NATURES, formatNatureEffectMeta } from "@/data/champions-natures";
import {
  getSlotFieldErrors,
  type SlotFieldError,
} from "@/lib/champions/legality-anchors";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import { clampSpValue, slotSpTotal, CHAMPIONS_SP_BUDGET } from "@/lib/champions/sp-budget";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import { HIDDEN_ABILITY_LABEL } from "@/types/ability";
import type { ChampionsPokemon } from "@/types/champions";
import type { ChampionsLegalityIssue } from "@/lib/champions/legality";
import type { PokemonDetail } from "@/types/pokemon";
import type { PokemonType } from "@/types/shared";
import { cn } from "@/utils";

type ChampionsSlotPanel =
  | "ability"
  | "item"
  | "nature"
  | "move-1"
  | "move-2"
  | "move-3"
  | "move-4"
  | null;

function isStabMove(moveType: string, pokemonTypes: PokemonType[]): boolean {
  return pokemonTypes.some((type) => type.toLowerCase() === moveType.toLowerCase());
}

function ChampionsSlotCardSkeleton() {
  return (
    <div className="mt-3 animate-pulse space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-12 rounded bg-muted/60" />
          <div className="h-10 rounded-xl bg-muted/50" />
          <div className="h-10 rounded-xl bg-muted/50" />
          <div className="h-10 rounded-xl bg-muted/50" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted/60" />
          <div className="h-24 rounded-xl bg-muted/50" />
        </div>
      </div>
      <div className="h-28 rounded-xl bg-muted/40" />
    </div>
  );
}

export function ChampionsSlotCard({
  slot,
  pokemonDetail,
  isDetailLoading = false,
  onSelectPokemon,
  onClearSlot,
  itemOptions,
  legalityIssues = [],
  isFocused = false,
  focusSp = false,
  slotIssue = null,
  hasLegalityError = false,
  navControls,
}: {
  slot: ChampionsPokemon;
  pokemonDetail: PokemonDetail | null;
  isDetailLoading?: boolean;
  onSelectPokemon: (slotNumber: number, detail: PokemonDetail) => void;
  onClearSlot: (slotNumber: number) => void;
  itemOptions: string[];
  legalityIssues?: ChampionsLegalityIssue[];
  isFocused?: boolean;
  focusSp?: boolean;
  slotIssue?: string | null;
  hasLegalityError?: boolean;
  navControls?: {
    onPrev: () => void;
    onNext: () => void;
    onToggleOverview: () => void;
    overviewMode: boolean;
    activeSlot: number;
    canGoPrev: boolean;
    canGoNext: boolean;
  };
}) {
  const setAbilityBySlot = useChampionsTeamStore((state) => state.setAbilityBySlot);
  const setItemBySlot = useChampionsTeamStore((state) => state.setItemBySlot);
  const setMoveBySlot = useChampionsTeamStore((state) => state.setMoveBySlot);
  const setStatAlignmentBySlot = useChampionsTeamStore((state) => state.setStatAlignmentBySlot);
  const setSpBySlot = useChampionsTeamStore((state) => state.setSpBySlot);
  const clearSlot = useChampionsTeamStore((state) => state.clearSlot);

  const [openPokemonPicker, setOpenPokemonPicker] = useState(false);
  const [openPanel, setOpenPanel] = useState<ChampionsSlotPanel>(null);
  const cardRef = useRef<HTMLElement>(null);
  const spSectionRef = useRef<HTMLDivElement>(null);
  const hasPokemon = Boolean(slot.pokemonId || slot.pokemonName.trim());

  const fieldErrors = useMemo(
    () => getSlotFieldErrors(legalityIssues, slot.slot),
    [legalityIssues, slot.slot],
  );

  const pokemonTypes = useMemo<PokemonType[]>(
    () =>
      pokemonDetail
        ? [pokemonDetail.primaryType, pokemonDetail.secondaryType].filter(
            (type): type is PokemonType => Boolean(type),
          )
        : [],
    [pokemonDetail],
  );

  const isMegaReady = Boolean(slot.item?.trim() && isLikelyMegaStone(slot.item));

  useEffect(() => {
    setOpenPanel(null);
  }, [slot.slot]);

  useEffect(() => {
    if (!focusSp || !spSectionRef.current) {
      return;
    }
    window.setTimeout(() => {
      spSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 150);
  }, [focusSp, slot.slot]);

  useEffect(() => {
    if (!openPokemonPicker && !openPanel) {
      return;
    }
    const handler = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOpenPokemonPicker(false);
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel, openPokemonPicker]);

  useEffect(() => {
    if (!isFocused || !hasPokemon) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      const moveSlot = Number(event.key);
      if (moveSlot >= 1 && moveSlot <= 4) {
        event.preventDefault();
        setOpenPanel(`move-${moveSlot}` as ChampionsSlotPanel);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPokemon, isFocused]);

  const abilitySelectorOptions = useMemo<SelectorOption[]>(
    () =>
      (pokemonDetail?.abilities ?? []).map((ability) => ({
        id: ability.id,
        name: ability.name,
        slug: ability.slug,
        meta: ability.isHidden ? HIDDEN_ABILITY_LABEL : undefined,
      })),
    [pokemonDetail?.abilities],
  );
  const natureSelectorOptions = useMemo<SelectorOption[]>(
    () =>
      CHAMPIONS_NATURES.map((nature, index) => ({
        id: index + 1,
        name: nature.name,
        slug: nature.name.toLowerCase(),
        meta: formatNatureEffectMeta(nature),
      })),
    [],
  );
  const selectedAbilityOption = useMemo(
    () => abilitySelectorOptions.find((o) => o.name.toLowerCase() === slot.ability.toLowerCase()) ?? null,
    [abilitySelectorOptions, slot.ability],
  );
  const selectedNatureOption = useMemo(
    () => natureSelectorOptions.find((o) => o.name === slot.statAlignment) ?? null,
    [natureSelectorOptions, slot.statAlignment],
  );
  const itemSelectorOptions = useMemo<SelectorOption[]>(
    () =>
      itemOptions.map((name, index) => ({
        id: index + 1,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })),
    [itemOptions],
  );
  const selectedItemOption = useMemo(
    () =>
      itemSelectorOptions.find((o) => o.name.toLowerCase() === (slot.item ?? "").toLowerCase()) ?? null,
    [itemSelectorOptions, slot.item],
  );
  const moveSelectorOptions = useMemo<SelectorOption[]>(
    () =>
      (pokemonDetail?.moves ?? []).map((move) => ({
        id: move.id,
        name: move.name,
        slug: move.slug,
        meta: move.type,
      })),
    [pokemonDetail?.moves],
  );

  const handleClear = useCallback(() => {
    clearSlot(slot.slot);
    onClearSlot(slot.slot);
    setOpenPokemonPicker(false);
    setOpenPanel(null);
  }, [clearSlot, onClearSlot, slot.slot]);

  const applySpread = useCallback(
    (spread: ChampionsPokemon["sp"]) => {
      const next = applyClampedSpread(slot.sp, spread);
      (Object.keys(next) as Array<keyof ChampionsPokemon["sp"]>).forEach((stat) => {
        setSpBySlot(slot.slot, stat, next[stat]);
      });
    },
    [setSpBySlot, slot.slot, slot.sp],
  );

  const fieldErrorClass = (field: SlotFieldError) =>
    fieldErrors.has(field) ? true : false;

  if (openPokemonPicker) {
    return (
      <article ref={cardRef} className="relative z-10 rounded-2xl border border-border/60 bg-card/70 p-4">
        <PokemonPicker
          onSelect={(detail) => {
            onSelectPokemon(slot.slot, detail);
            setOpenPokemonPicker(false);
          }}
          onCancel={() => setOpenPokemonPicker(false)}
          currentSelectedSlug={pokemonDetail?.slug ?? null}
        />
      </article>
    );
  }

  if (!hasPokemon) {
    return (
      <article
        id={`champions-slot-${slot.slot}`}
        ref={cardRef}
        className={cn("rounded-2xl border border-border/60 bg-card/70", isFocused && "ring-2 ring-primary/40")}
      >
        <EmptyPokemonSlot slot={slot.slot} onAdd={() => setOpenPokemonPicker(true)} />
      </article>
    );
  }

  const duplicateMoves = slot.moves.filter(Boolean).filter(
    (move, index, arr) => arr.findIndex((m) => m.toLowerCase() === move.toLowerCase()) !== index,
  );

  return (
    <article
      id={`champions-slot-${slot.slot}`}
      ref={cardRef}
      aria-label={`Editing slot ${slot.slot}, ${slot.pokemonName}`}
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 p-4 motion-safe:transition-opacity",
        isFocused && "border-foreground/25",
        hasLegalityError && "border-rose-500/35",
      )}
    >
      {/* Identity row */}
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background/60">
          {pokemonDetail ? (
            <PokemonSprite
              src={pokemonDetail.spriteNormal}
              alt={slot.pokemonName}
              size={40}
              className="h-full w-full object-contain p-0.5"
            />
          ) : isDetailLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {hasLegalityError ? (
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-card"
              aria-label="Has legality issue"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Slot {slot.slot}
          </p>
          <p className="truncate text-base font-semibold text-foreground">{slot.pokemonName}</p>
          {pokemonDetail ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <TypeBadge type={pokemonDetail.primaryType} size="sm" />
              {pokemonDetail.secondaryType ? (
                <TypeBadge type={pokemonDetail.secondaryType} size="sm" />
              ) : null}
              {isMegaReady ? (
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200">
                  Mega ready
                </span>
              ) : null}
              {slot.item?.trim() ? (
                <span className="truncate text-[10px] text-muted-foreground">@ {slot.item}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <ChampionsSpMiniRing sp={slot.sp} />
      </div>

      {/* Nav + actions row */}
      <div className="mt-2 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        {navControls ? (
          <div className="flex items-center gap-1" aria-live="polite">
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg px-2"
              disabled={!navControls.canGoPrev}
              onClick={navControls.onPrev}
              aria-label="Previous slot"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-muted-foreground">
              {navControls.activeSlot}/6
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg px-2"
              disabled={!navControls.canGoNext}
              onClick={navControls.onNext}
              aria-label="Next slot"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant={navControls.overviewMode ? "secondary" : "outline"}
              className="h-7 rounded-lg px-2"
              onClick={navControls.onToggleOverview}
              aria-label="Roster overview"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-lg px-2 text-[11px]"
            onClick={() => setOpenPokemonPicker(true)}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Change Pokémon</span>
            <span className="sm:hidden">Change</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-lg px-2 text-[11px] text-rose-300 hover:text-rose-200"
            onClick={handleClear}
          >
            <Trash2 className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Clear slot</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      </div>

      {slotIssue ? (
        <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-200">
          {slotIssue}
        </p>
      ) : null}

      {isDetailLoading && !pokemonDetail ? (
        <ChampionsSlotCardSkeleton />
      ) : (
        <>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Set</p>
              <SlotSelector
                label="Ability"
                layout="stacked"
                selected={selectedAbilityOption}
                options={abilitySelectorOptions}
                isOpen={openPanel === "ability"}
                onToggle={() => setOpenPanel((c) => (c === "ability" ? null : "ability"))}
                onSelect={(option) => {
                  setAbilityBySlot(slot.slot, option.name);
                  setOpenPanel(null);
                }}
                searchable={false}
                hasError={fieldErrorClass("ability")}
                selectedSuffix={
                  selectedAbilityOption?.meta ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                      {selectedAbilityOption.meta}
                    </span>
                  ) : null
                }
                noOptionsText={isDetailLoading ? "Loading abilities…" : "No abilities"}
              />
              <SlotSelector
                label="Item"
                layout="stacked"
                selected={selectedItemOption}
                options={itemSelectorOptions}
                isOpen={openPanel === "item"}
                onToggle={() => setOpenPanel((c) => (c === "item" ? null : "item"))}
                onSelect={(option) => {
                  setItemBySlot(slot.slot, option.name);
                  setOpenPanel(null);
                }}
                onClear={() => {
                  setItemBySlot(slot.slot, "");
                  setOpenPanel(null);
                }}
                hasError={fieldErrorClass("item")}
                noOptionsText="No items found"
              />
              <SlotSelector
                label="Nature"
                layout="stacked"
                selected={selectedNatureOption}
                options={natureSelectorOptions}
                isOpen={openPanel === "nature"}
                onToggle={() => setOpenPanel((c) => (c === "nature" ? null : "nature"))}
                onSelect={(option) => {
                  setStatAlignmentBySlot(slot.slot, option.name);
                  setOpenPanel(null);
                }}
                searchable={false}
                selectedSuffix={
                  selectedNatureOption?.meta ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                      {selectedNatureOption.meta}
                    </span>
                  ) : null
                }
                noOptionsText="No natures"
              />
            </div>

            <div ref={spSectionRef} className={cn(focusSp && "rounded-xl ring-2 ring-primary/35")}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Spread
                </p>
                <p
                  className={cn(
                    "text-[11px] tabular-nums",
                    CHAMPIONS_SP_BUDGET - slotSpTotal(slot.sp) > 0
                      ? "text-amber-200/90"
                      : "text-muted-foreground",
                  )}
                >
                  {slotSpTotal(slot.sp)}/{CHAMPIONS_SP_BUDGET}
                  {CHAMPIONS_SP_BUDGET - slotSpTotal(slot.sp) > 0
                    ? ` · ${CHAMPIONS_SP_BUDGET - slotSpTotal(slot.sp)} left`
                    : ""}
                </p>
              </div>
              <ChampionsSpBudgetEditor
                sp={slot.sp}
                layout="slot"
                showRoleChips
                onReset={() => applySpread({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 })}
                onApplySpread={applySpread}
                onChange={(stat, value) => {
                  const next = clampSpValue(slot.sp, stat, value);
                  setSpBySlot(slot.slot, stat, next[stat]);
                }}
              />
            </div>
          </div>

          <div className="mt-3 min-h-[9rem]">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Moveset
            </p>
            <div
              className={cn(
                "grid gap-1.5 rounded-xl border border-border/40 bg-background/20 p-2 md:grid-cols-2",
                fieldErrorClass("moves") && "ring-2 ring-rose-500/30",
              )}
            >
              {([1, 2, 3, 4] as const).map((moveSlot) => {
                const panelKey = `move-${moveSlot}` as ChampionsSlotPanel;
                const currentMove = slot.moves[moveSlot - 1] ?? "";
                const selectedMoveOption =
                  moveSelectorOptions.find((o) => o.name.toLowerCase() === currentMove.toLowerCase()) ?? null;
                const selectedMoveDetail = pokemonDetail?.moves.find(
                  (move) => move.name.toLowerCase() === currentMove.toLowerCase(),
                );

                return (
                  <SlotSelector
                    key={moveSlot}
                    label={`Move ${moveSlot}`}
                    layout="stacked"
                    preserveSelectedName
                    selected={selectedMoveOption}
                    selectedPrefix={
                      selectedMoveDetail ? (
                        <TypeBadge type={selectedMoveDetail.type} size="sm" className="px-1 text-[9px]" />
                      ) : null
                    }
                    options={moveSelectorOptions}
                    isOpen={openPanel === panelKey}
                    onToggle={() => setOpenPanel((c) => (c === panelKey ? null : panelKey))}
                    onSelect={(option) => {
                      setMoveBySlot(slot.slot, moveSlot, option.name);
                      setOpenPanel(null);
                    }}
                    onClear={() => {
                      setMoveBySlot(slot.slot, moveSlot, "");
                      setOpenPanel(null);
                    }}
                    hideOptionMeta
                    hasError={fieldErrorClass("moves") && !currentMove.trim()}
                    renderOption={(option) => {
                      const moveDetail = pokemonDetail?.moves.find((m) => m.id === option.id);
                      const stab = moveDetail && isStabMove(moveDetail.type, pokemonTypes);
                      return (
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className={cn(stab && "font-medium text-primary")}>
                            {option.name}
                            {stab ? (
                              <span className="ml-1 text-[9px] text-primary/80">STAB</span>
                            ) : null}
                          </span>
                          {option.meta ? (
                            <TypeBadge type={option.meta} size="sm" className="shrink-0 px-1 text-[9px]" />
                          ) : null}
                        </span>
                      );
                    }}
                    noOptionsText={isDetailLoading ? "Loading moves…" : "No moves"}
                  />
                );
              })}
            </div>
            {duplicateMoves.length > 0 ? (
              <p className="mt-1.5 text-[11px] text-amber-200">Duplicate moves are not allowed in battle.</p>
            ) : null}
          </div>
        </>
      )}
    </article>
  );
}
