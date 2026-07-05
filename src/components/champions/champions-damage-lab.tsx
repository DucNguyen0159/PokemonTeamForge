"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Calculator, Loader2, Plus, RefreshCw, Settings2, Trash2 } from "lucide-react";

import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsActiveTeamBar } from "@/components/champions/shared/champions-active-team-bar";
import { ChampionsEmptyState } from "@/components/champions/shared/champions-empty-state";
import { ChampionsSpBudgetEditor } from "@/components/champions/shared/champions-sp-budget-editor";
import { PokemonPicker } from "@/components/builder/pokemon-picker";
import { SlotSelector, type SelectorOption } from "@/components/builder/slot-selector";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { CHAMPIONS_NATURES, formatNatureOptionLabel } from "@/data/champions-natures";
import {
  CHAMPIONS_META_DEFENDERS,
  type MetaDefenderPreset,
} from "@/data/champions-meta-defenders";
import { useCompetitiveItems } from "@/hooks/queries/use-pokemon-catalog";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import { fetchPokemonDetailFromApi } from "@/lib/pokemon/data-access";
import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import { pokemonKeys, POKEMON_DETAIL_STALE_MS } from "@/lib/pokemon/query-keys";
import {
  calculateChampionsDamage,
  type ChampionsCalcGeneration,
  type ChampionsCalcOutput,
  type ChampionsCalcSideInput,
} from "@/lib/champions/damage-calc-adapter";
import { clampSpValue, slotSpTotal } from "@/lib/champions/sp-budget";
import { HIDDEN_ABILITY_LABEL } from "@/types/ability";
import type { ChampionsSpSpread } from "@/types/champions";
import type { PokemonDetail } from "@/types/pokemon";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import { cn } from "@/utils";

type SideFormState = {
  species: string;
  ability: string;
  item: string;
  nature: string;
  status: "" | "brn" | "par" | "psn" | "tox" | "slp" | "frz";
  useMega: boolean;
  boostAtk: number;
  boostDef: number;
  boostSpA: number;
  boostSpD: number;
  boostSpe: number;
  sp: ChampionsSpSpread;
};

function createDefaultSideState(): SideFormState {
  return {
    species: "",
    ability: "",
    item: "",
    nature: "Serious",
    status: "",
    useMega: false,
    boostAtk: 0,
    boostDef: 0,
    boostSpA: 0,
    boostSpD: 0,
    boostSpe: 0,
    sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  };
}

function convertSideState(state: SideFormState): ChampionsCalcSideInput {
  return {
    species: state.species,
    ability: state.ability || undefined,
    item: state.item || undefined,
    nature: state.nature || undefined,
    status: state.status,
    useMega: state.useMega,
    megaStone: isLikelyMegaStone(state.item) ? state.item : undefined,
    boostAtk: state.boostAtk,
    boostDef: state.boostDef,
    boostSpA: state.boostSpA,
    boostSpD: state.boostSpD,
    boostSpe: state.boostSpe,
    sp: state.sp,
  };
}

function toSlotLabel(slot: { slot: number; pokemonName: string }) {
  return `Slot ${slot.slot}: ${slot.pokemonName}`;
}

function withSpCap(
  current: ChampionsSpSpread,
  stat: keyof ChampionsSpSpread,
  nextRawValue: number,
): ChampionsSpSpread {
  return clampSpValue(current, stat, nextRawValue);
}

function SideEditor({
  title,
  side,
  pokemonDetail,
  teamSlotOptions,
  showLoadFromSlot = true,
  onLoadFromSlot,
  onSelectPokemon,
  onClearPokemon,
  itemOptions,
  onChange,
}: {
  title: string;
  side: SideFormState;
  pokemonDetail: PokemonDetail | null;
  teamSlotOptions: Array<{ slot: number; pokemonName: string }>;
  showLoadFromSlot?: boolean;
  onLoadFromSlot: (slotNumber: number) => void;
  onSelectPokemon: (detail: PokemonDetail) => void;
  onClearPokemon: () => void;
  itemOptions: string[];
  onChange: (patch: Partial<SideFormState>) => void;
}) {
  const [openPokemonPicker, setOpenPokemonPicker] = useState(false);
  const [openPanel, setOpenPanel] = useState<"ability" | "item" | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const hasPokemon = Boolean(side.species.trim());

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
  const selectedAbilityOption = useMemo(
    () =>
      abilitySelectorOptions.find((option) => option.name.toLowerCase() === side.ability.toLowerCase()) ?? null,
    [abilitySelectorOptions, side.ability],
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
    () => itemSelectorOptions.find((option) => option.name.toLowerCase() === side.item.toLowerCase()) ?? null,
    [itemSelectorOptions, side.item],
  );

  useEffect(() => {
    if (!openPanel) {
      return;
    }
    const handler = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel]);

  return (
    <article ref={cardRef} className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>

      {showLoadFromSlot ? (
        <label className="mt-3 block space-y-1">
          <span className="text-xs text-muted-foreground">Load from Champions Builder slot (optional)</span>
          <select
            defaultValue=""
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value > 0) {
                onLoadFromSlot(value);
              }
              event.currentTarget.value = "";
            }}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          >
            <option value="">Select slot</option>
            {teamSlotOptions.map((slot) => (
              <option key={`${title}-slot-${slot.slot}`} value={slot.slot}>
                {toSlotLabel(slot)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {openPokemonPicker ? (
        <div className="relative z-10 mt-3">
          <PokemonPicker
            onSelect={(detail) => {
              onSelectPokemon(detail);
              setOpenPokemonPicker(false);
            }}
            onCancel={() => setOpenPokemonPicker(false)}
            currentSelectedSlug={pokemonDetail?.slug ?? null}
          />
        </div>
      ) : !hasPokemon ? (
        <button
          type="button"
          onClick={() => setOpenPokemonPicker(true)}
          className={cn(
            "mt-3 flex min-h-[96px] w-full flex-col items-center justify-center gap-2 rounded-2xl",
            "border border-dashed border-border/50 bg-card/30 text-muted-foreground transition-colors",
            "hover:border-primary/40 hover:bg-card/60 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-current opacity-50">
            <Plus className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-medium">Select Pokémon</span>
        </button>
      ) : (
        <>
          <div className="mt-3 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {pokemonDetail ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background/60">
                  <PokemonSprite
                    src={pokemonDetail.spriteNormal}
                    alt={pokemonDetail.name}
                    size={48}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{side.species}</p>
                {pokemonDetail ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    <TypeBadge type={pokemonDetail.primaryType} />
                    {pokemonDetail.secondaryType ? <TypeBadge type={pokemonDetail.secondaryType} /> : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg px-2 text-xs text-muted-foreground"
                onClick={() => setOpenPokemonPicker(true)}
                aria-label={`Change ${side.species}`}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Change
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg px-2 text-xs text-muted-foreground"
                onClick={() => {
                  onClearPokemon();
                  setOpenPanel(null);
                }}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <SlotSelector
                label="Ability"
                selected={selectedAbilityOption}
                options={abilitySelectorOptions}
                isOpen={openPanel === "ability"}
                onToggle={() => setOpenPanel((current) => (current === "ability" ? null : "ability"))}
                onSelect={(option) => {
                  onChange({ ability: option.name });
                  setOpenPanel(null);
                }}
                searchable={false}
                selectedSuffix={
                  selectedAbilityOption?.meta ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                      {selectedAbilityOption.meta}
                    </span>
                  ) : null
                }
                noOptionsText="Loading species abilities..."
              />
              <SlotSelector
                label="Item"
                selected={selectedItemOption}
                options={itemSelectorOptions}
                isOpen={openPanel === "item"}
                onToggle={() => setOpenPanel((current) => (current === "item" ? null : "item"))}
                onSelect={(option) => {
                  onChange({ item: option.name });
                  setOpenPanel(null);
                }}
                onClear={() => {
                  onChange({ item: "", useMega: false });
                  setOpenPanel(null);
                }}
                noOptionsText="No items found"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Nature</span>
                <select
                  value={side.nature}
                  onChange={(event) => onChange({ nature: event.target.value })}
                  className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
                >
                  {CHAMPIONS_NATURES.map((nature) => (
                    <option key={`${title}-nature-${nature.name}`} value={nature.name}>
                      {formatNatureOptionLabel(nature)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <select
                  value={side.status}
                  onChange={(event) =>
                    onChange({
                      status: event.target.value as SideFormState["status"],
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  <option value="brn">Burn</option>
                  <option value="par">Paralysis</option>
                  <option value="psn">Poison</option>
                  <option value="tox">Toxic</option>
                  <option value="slp">Sleep</option>
                  <option value="frz">Freeze</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3">
            <ChampionsSpBudgetEditor
              sp={side.sp}
              onChange={(stat, value) =>
                onChange({ sp: withSpCap(side.sp, stat, value) })
              }
            />
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-xs font-medium text-foreground">Stat stage boosts (−6 to +6)</span>
            <p className="text-xs text-muted-foreground">
              In-battle stat changes from moves/abilities (e.g. Swords Dance = +2 Atk, Nasty Plot = +2 SpA,
              Intimidate = −1 Atk). Each stage is ±50%. Leave at 0 for the base spread.
            </p>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {(["Atk", "Def", "SpA", "SpD", "Spe"] as const).map((label) => {
              const key = `boost${label}` as const;
              const value = side[key];
              return (
                <label key={`${title}-${key}`} className="block space-y-1">
                  <span className="text-xs text-muted-foreground">{label} boost</span>
                  <input
                    type="number"
                    min={-6}
                    max={6}
                    value={value}
                    onChange={(event) =>
                      onChange({
                        [key]: Math.max(-6, Math.min(6, Number(event.target.value) || 0)),
                      } as Partial<SideFormState>)
                    }
                    className="w-full rounded-xl border border-border/60 bg-background/45 px-2 py-2 text-sm"
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-3">
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={side.useMega}
                onChange={(event) => onChange({ useMega: event.target.checked })}
                className="rounded border-border/60"
              />
              Use Mega form (requires compatible Mega Stone item)
            </label>
          </div>
        </>
      )}
    </article>
  );
}

export function ChampionsDamageLab() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const championsTeam = useChampionsTeamStore((state) => state.team);
  const [generation, setGeneration] = useState<ChampionsCalcGeneration>(9);
  const [attacker, setAttacker] = useState<SideFormState>(createDefaultSideState());
  const [defender, setDefender] = useState<SideFormState>(createDefaultSideState());
  const [moveName, setMoveName] = useState("");
  const [weather, setWeather] = useState<"" | "Sun" | "Rain" | "Sand" | "Snow">("");
  const [terrain, setTerrain] = useState<"" | "Electric" | "Grassy" | "Misty" | "Psychic">("");
  const [isReflect, setIsReflect] = useState(false);
  const [isLightScreen, setIsLightScreen] = useState(false);
  const [isCrit, setIsCrit] = useState(false);
  const [fieldPopoverOpen, setFieldPopoverOpen] = useState(false);
  const [attackerDetail, setAttackerDetail] = useState<PokemonDetail | null>(null);
  const [defenderDetail, setDefenderDetail] = useState<PokemonDetail | null>(null);
  const [moveSelectorOpen, setMoveSelectorOpen] = useState(false);
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);
  const { data: competitiveItems = [] } = useCompetitiveItems();
  const [result, setResult] = useState<ChampionsCalcOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const attackerMoveOptions = useMemo<SelectorOption[]>(
    () =>
      (attackerDetail?.moves ?? []).map((move) => ({
        id: move.id,
        name: move.name,
        slug: move.slug,
        meta: move.type,
      })),
    [attackerDetail?.moves],
  );
  const itemOptions = useMemo(() => competitiveItems.map((item) => item.name), [competitiveItems]);
  const selectedMoveOption = useMemo(
    () =>
      attackerMoveOptions.find((option) => option.name.toLowerCase() === moveName.toLowerCase()) ??
      null,
    [attackerMoveOptions, moveName],
  );
  const teamSlotOptions = useMemo(
    () => championsTeam.pokemon.filter((slot) => slot.pokemonName.trim().length > 0),
    [championsTeam.pokemon],
  );

  function syncDamageParams(patch: { slot?: number; move?: string; side?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (patch.slot !== undefined) {
      params.set("slot", String(patch.slot));
    }
    if (patch.move !== undefined) {
      if (patch.move) {
        params.set("move", patch.move);
      } else {
        params.delete("move");
      }
    }
    if (patch.side !== undefined) {
      if (patch.side) {
        params.set("side", patch.side);
      } else {
        params.delete("side");
      }
    }
    const query = params.toString();
    router.replace(query ? `/champions/damage?${query}` : "/champions/damage", { scroll: false });
  }

  function handleSelectSidePokemon(target: "attacker" | "defender", detail: PokemonDetail) {
    const defaultAbility = detail.abilities.find((ability) => !ability.isHidden) ?? detail.abilities[0];
    const setSide = target === "attacker" ? setAttacker : setDefender;
    const setDetail = target === "attacker" ? setAttackerDetail : setDefenderDetail;
    setSide((current) => ({
      ...current,
      species: detail.name,
      ability: defaultAbility?.name ?? "",
      item: "",
      useMega: false,
    }));
    setDetail(detail);
    if (target === "attacker") {
      setMoveName("");
      setMoveSelectorOpen(false);
    }
  }

  function handleClearSidePokemon(target: "attacker" | "defender") {
    if (target === "attacker") {
      setAttacker(createDefaultSideState());
      setAttackerDetail(null);
      setMoveName("");
      setMoveSelectorOpen(false);
    } else {
      setDefender(createDefaultSideState());
      setDefenderDetail(null);
    }
  }

  async function loadSideFromBuilderSlot(
    slotNumber: number,
    target: "attacker" | "defender",
  ): Promise<void> {
    const slot = championsTeam.pokemon.find((entry) => entry.slot === slotNumber);
    if (!slot) {
      return;
    }
    const sidePatch: SideFormState = {
      ...createDefaultSideState(),
      species: slot.pokemonName,
      ability: slot.ability,
      item: slot.item ?? "",
      nature: slot.statAlignment || "Serious",
      useMega: isLikelyMegaStone(slot.item ?? ""),
      sp: { ...slot.sp },
    };
    if (target === "attacker") {
      setAttacker(sidePatch);
      syncDamageParams({ slot: slotNumber, side: "attacker" });
    } else {
      setDefender(sidePatch);
      syncDamageParams({ slot: slotNumber, side: "defender" });
    }
    await resolveSideSpecies(slot.pokemonName, target);
  }

  async function loadMetaDefender(preset: MetaDefenderPreset): Promise<void> {
    const baseSp = createDefaultSideState().sp;
    const sp: ChampionsSpSpread = { ...baseSp, ...preset.sp };
    try {
      const slug = resolvePokemonSlug(preset.species);
      const detail = await queryClient.fetchQuery({
        queryKey: pokemonKeys.detail(slug),
        queryFn: () => fetchPokemonDetailFromApi(slug),
        staleTime: POKEMON_DETAIL_STALE_MS,
      });
      const defaultAbility =
        preset.ability ??
        detail.abilities.find((ability) => !ability.isHidden)?.name ??
        detail.abilities[0]?.name ??
        "";
      setDefender({
        ...createDefaultSideState(),
        species: detail.name,
        ability: defaultAbility,
        item: preset.item ?? "",
        nature: preset.nature ?? "Serious",
        useMega: isLikelyMegaStone(preset.item ?? ""),
        sp,
      });
      setDefenderDetail(detail);
      syncDamageParams({ side: "defender" });
    } catch {
      setDefender({
        ...createDefaultSideState(),
        species: preset.species,
        item: preset.item ?? "",
        nature: preset.nature ?? "Serious",
        sp,
      });
      setDefenderDetail(null);
    }
  }

  useEffect(() => {
    if (deepLinkApplied) {
      return;
    }
    const slotParam = Number(searchParams.get("slot"));
    const moveParam = searchParams.get("move");
    const sideParam = searchParams.get("side");
    if (slotParam >= 1 && slotParam <= 6) {
      const target = sideParam === "defender" ? "defender" : "attacker";
      void loadSideFromBuilderSlot(slotParam, target);
    }
    if (moveParam) {
      setMoveName(moveParam);
    }
    setDeepLinkApplied(true);
  }, [deepLinkApplied, searchParams]);

  async function runCalculation() {
    setError(null);
    setResult(null);
    setIsCalculating(true);
    try {
      const output = calculateChampionsDamage({
        generation,
        attacker: convertSideState(attacker),
        defender: convertSideState(defender),
        moveName,
        isCrit,
        field: {
          weather,
          terrain,
          isReflect,
          isLightScreen,
        },
      });
      setResult(output);
    } catch (calcError) {
      setError(calcError instanceof Error ? calcError.message : "Unable to calculate damage.");
    } finally {
      setIsCalculating(false);
    }
  }

  async function resolveSideSpecies(
    value: string,
    target: "attacker" | "defender",
  ): Promise<void> {
    const query = value.trim();
    if (!query) {
      if (target === "attacker") {
        setAttackerDetail(null);
      } else {
        setDefenderDetail(null);
      }
      return;
    }
    try {
      const slug = resolvePokemonSlug(query);
      const detail = await queryClient.fetchQuery({
        queryKey: pokemonKeys.detail(slug),
        queryFn: () => fetchPokemonDetailFromApi(slug),
        staleTime: POKEMON_DETAIL_STALE_MS,
      });
      if (target === "attacker") {
        setAttacker((current) => ({ ...current, species: detail.name }));
        setAttackerDetail(detail);
      } else {
        setDefender((current) => ({ ...current, species: detail.name }));
        setDefenderDetail(detail);
      }
    } catch {
      if (target === "attacker") {
        setAttackerDetail(null);
      } else {
        setDefenderDetail(null);
      }
    }
  }

  return (
    <ChampionsShell eyebrow="Damage Lab" title="Champions Damage Lab" variant="tool">
      <ChampionsActiveTeamBar
        variant="mini"
        onSlotSelect={(slotNumber) => {
          void loadSideFromBuilderSlot(slotNumber, "attacker");
        }}
      />

      {!attacker.species.trim() && teamSlotOptions.length > 0 ? (
        <ChampionsEmptyState
          title="No attacker loaded"
          description="Load a Pokémon from your active team to start calculating damage."
          primaryLabel={`Load slot ${teamSlotOptions[0]?.slot ?? 1}`}
          onPrimaryClick={() => {
            void loadSideFromBuilderSlot(teamSlotOptions[0]?.slot ?? 1, "attacker");
          }}
        />
      ) : null}

      <section className="rounded-2xl border border-border/60 bg-card/70 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Calc generation</span>
            <select
              value={generation}
              onChange={(event) => setGeneration(Number(event.target.value) as ChampionsCalcGeneration)}
              className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
            >
              <option value={9}>Gen 9</option>
              <option value={7}>Gen 7</option>
              <option value={6}>Gen 6</option>
            </select>
          </label>
          <div className="min-w-0">
            <SlotSelector
              label="Move"
              layout="stacked"
              selected={selectedMoveOption}
              selectedPrefix={
                selectedMoveOption?.meta ? (
                  <TypeBadge type={selectedMoveOption.meta} size="sm" className="px-1.5 text-[10px]" />
                ) : null
              }
              options={attackerMoveOptions}
              isOpen={moveSelectorOpen}
              onToggle={() => setMoveSelectorOpen((current) => !current)}
              onSelect={(option) => {
                setMoveName(option.name);
                setMoveSelectorOpen(false);
                syncDamageParams({ move: option.name });
              }}
              onClear={() => {
                setMoveName("");
                setMoveSelectorOpen(false);
                syncDamageParams({ move: "" });
              }}
              hideOptionMeta
              renderOption={(option) => (
                <span className="flex w-full items-center justify-between gap-3">
                  <span>{option.name}</span>
                  {option.meta ? (
                    <TypeBadge type={option.meta} size="sm" className="shrink-0 px-1.5 text-[10px]" />
                  ) : null}
                </span>
              )}
              noOptionsText={
                attacker.species.trim()
                  ? "Loading species moves..."
                  : "Select an attacker first"
              }
            />
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Weather</span>
            <select
              value={weather}
              onChange={(event) => setWeather(event.target.value as typeof weather)}
              className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
            >
              <option value="">None</option>
              <option value="Sun">Sun</option>
              <option value="Rain">Rain</option>
              <option value="Sand">Sand</option>
              <option value="Snow">Snow</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Terrain</span>
            <select
              value={terrain}
              onChange={(event) => setTerrain(event.target.value as typeof terrain)}
              className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
            >
              <option value="">None</option>
              <option value="Electric">Electric</option>
              <option value="Grassy">Grassy</option>
              <option value="Misty">Misty</option>
              <option value="Psychic">Psychic</option>
            </select>
          </label>
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-5 h-9 w-full rounded-xl text-xs"
              onClick={() => setFieldPopoverOpen((current) => !current)}
            >
              <Settings2 className="mr-1.5 size-3.5" aria-hidden />
              Advanced field
            </Button>
            {fieldPopoverOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-border/60 bg-card p-3 shadow-lg">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isReflect}
                    onChange={(event) => setIsReflect(event.target.checked)}
                    className="rounded border-border/60"
                  />
                  Defender Reflect
                </label>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isLightScreen}
                    onChange={(event) => setIsLightScreen(event.target.checked)}
                    className="rounded border-border/60"
                  />
                  Defender Light Screen
                </label>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isCrit}
                    onChange={(event) => setIsCrit(event.target.checked)}
                    className="rounded border-border/60"
                  />
                  Force critical hit
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-3">
        <p className="text-xs font-medium text-muted-foreground">Quick defender presets</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/80">
          Load common meta defensive benchmarks into the defender side.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHAMPIONS_META_DEFENDERS.map((preset) => (
            <button
              key={preset.species}
              type="button"
              onClick={() => void loadMetaDefender(preset)}
              className={cn(
                "rounded-full border border-border/60 bg-background/45 px-3 py-1.5 text-xs font-medium",
                "text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground",
                defender.species.toLowerCase() === preset.species.toLowerCase() &&
                  "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SideEditor
          title="Attacker"
          side={attacker}
          pokemonDetail={attackerDetail}
          itemOptions={itemOptions}
          teamSlotOptions={teamSlotOptions}
          onLoadFromSlot={(slot) => {
            void loadSideFromBuilderSlot(slot, "attacker");
          }}
          onSelectPokemon={(detail) => handleSelectSidePokemon("attacker", detail)}
          onClearPokemon={() => handleClearSidePokemon("attacker")}
          onChange={(patch) => setAttacker((current) => ({ ...current, ...patch }))}
        />
        <SideEditor
          title="Defender"
          side={defender}
          pokemonDetail={defenderDetail}
          itemOptions={itemOptions}
          teamSlotOptions={teamSlotOptions}
          showLoadFromSlot={false}
          onLoadFromSlot={(slot) => {
            void loadSideFromBuilderSlot(slot, "defender");
          }}
          onSelectPokemon={(detail) => handleSelectSidePokemon("defender", detail)}
          onClearPokemon={() => handleClearSidePokemon("defender")}
          onChange={(patch) => setDefender((current) => ({ ...current, ...patch }))}
        />
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-4">
        <Button onClick={() => void runCalculation()} disabled={isCalculating}>
          {isCalculating ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="size-4" aria-hidden />
              Calculate damage
            </>
          )}
        </Button>

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-border/55 bg-background/40 p-3">
                {result.isNonDamaging ? (
                  <p className="text-sm font-semibold text-foreground">Non-damaging move</p>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    Damage: {result.minDamage} - {result.maxDamage}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.isNonDamaging
                    ? "This move does not deal damage under standard calc rules."
                    : `Percent: ${result.minPercent.toFixed(1)}% - ${result.maxPercent.toFixed(1)}%`}
                </p>
                {!result.isNonDamaging ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Defender max HP: {result.maxHp}
                  </p>
                ) : null}
              </article>
              <article className="rounded-xl border border-border/55 bg-background/40 p-3">
                <p className="text-sm font-semibold text-foreground">KO chance</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.koText}</p>
              </article>
            </div>
            <article className="rounded-xl border border-border/55 bg-background/40 p-3">
              <p className="text-sm font-semibold text-foreground">Summary</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{result.fullDescription}</p>
            </article>
            {result.warnings.length > 0 ? (
              <article className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3">
                <p className="text-sm font-semibold text-amber-100">Calc notes</p>
                <ul className="mt-1 space-y-1 text-xs text-amber-100/90">
                  {result.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>
        ) : null}
      </section>
    </ChampionsShell>
  );
}
