"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { ChampionsPresetCard } from "@/components/champions/champions-preset-card";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsPresetPreviewDrawer } from "@/components/champions/shared/champions-preset-preview-drawer";
import {
  ChampionsReplaceDraftDialog,
  useConfirmReplaceDraft,
} from "@/components/champions/shared/champions-replace-draft-dialog";
import { ChampionsEmptyState } from "@/components/champions/shared/champions-empty-state";
import { ChampionsFilterChips } from "@/components/champions/shared/champions-filter-chips";
import { VirtualizedPresetGrid } from "@/components/champions/shared/virtualized-preset-grid";
import { PageIntroChip } from "@/components/layout/page-intro";
import {
  CHAMPIONS_PRESETS,
  type ChampionsPreset,
} from "@/data/champions-presets";
import {
  ARCHETYPE_FILTER_OPTIONS,
  presetMatchesArchetype,
  presetMatchesTheme,
  THEME_FILTER_OPTIONS,
  type ArchetypeFilter,
  type ThemeFilter,
} from "@/lib/champions/preset-filters";
import { filterChipClass } from "@/lib/champions/preset-ui";
import { savePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { cn } from "@/utils";

type FormatFilter = "all" | ChampionsPreset["formatSupport"];

const FORMAT_FILTERS: Array<{ value: FormatFilter; label: string }> = [
  { value: "all", label: "All formats" },
  { value: "single", label: "Singles 3v3" },
  { value: "double", label: "Doubles 4v4" },
  { value: "both", label: "Both" },
];

export function ChampionsPresetExplorer() {
  const router = useRouter();
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<ArchetypeFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [previewPreset, setPreviewPreset] = useState<ChampionsPreset | null>(null);
  const { needsConfirm, requestReplace, confirmReplace, cancelReplace } = useConfirmReplaceDraft();

  const filteredPresets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return CHAMPIONS_PRESETS.filter((preset) => {
      const themeMatch = presetMatchesTheme(preset, themeFilter);
      const archetypeMatch = presetMatchesArchetype(preset, archetypeFilter);
      const formatMatch =
        formatFilter === "all" ||
        preset.formatSupport === formatFilter ||
        (formatFilter !== "both" && preset.formatSupport === "both");
      const searchMatch =
        !normalizedSearch ||
        preset.name.toLowerCase().includes(normalizedSearch) ||
        preset.team.pokemon.some((slot) =>
          slot.pokemonName.toLowerCase().includes(normalizedSearch),
        );
      return themeMatch && archetypeMatch && formatMatch && searchMatch;
    });
  }, [archetypeFilter, formatFilter, searchQuery, themeFilter]);

  function loadPreset(preset: ChampionsPreset) {
    setLoadingPresetId(preset.id);
    savePendingLoadedChampionsTeam(
      {
        ...preset.team,
        id: undefined,
        userId: undefined,
        isPublic: false,
        createdAt: undefined,
        updatedAt: undefined,
      },
      { sourcePresetId: preset.id, sourcePresetName: preset.name },
    );
    void router.push("/champions/builder");
  }

  function handleLoadPreset(preset: ChampionsPreset) {
    requestReplace(() => loadPreset(preset));
  }

  return (
    <>
      <ChampionsReplaceDraftDialog
        open={needsConfirm}
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <ChampionsPresetPreviewDrawer
        preset={previewPreset}
        open={previewPreset !== null}
        onClose={() => setPreviewPreset(null)}
        onLoad={() => {
          if (previewPreset) {
            handleLoadPreset(previewPreset);
            setPreviewPreset(null);
          }
        }}
        isLoading={loadingPresetId === previewPreset?.id}
      />
      <ChampionsShell
      eyebrow="Strategy Presets"
      title="Champions Presets"
      description="Pick a curated 6-Pokémon Champions roster with SP spreads, items, and prebuilt 3v3/4v4 battle plans."
      variant="compact"
      chips={
        <>
          <PageIntroChip>{CHAMPIONS_PRESETS.length} curated teams</PageIntroChip>
          <PageIntroChip>Roster + battle plans</PageIntroChip>
        </>
      }
    >
      <section className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Search by Pokémon</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="e.g. Incineroar"
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          />
        </label>
        <ChampionsFilterChips
          label="Format"
          options={FORMAT_FILTERS}
          value={formatFilter}
          onChange={setFormatFilter}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            Weather and Trick Room shells — teams with no weather only appear under All themes.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filterChipClass(themeFilter === option.value)}
                onClick={() => setThemeFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Archetype</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            How the team wins — balance, offense, stall, Champions gimmicks, and fun builds.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ARCHETYPE_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filterChipClass(archetypeFilter === option.value)}
                onClick={() => setArchetypeFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Format</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FORMAT_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filterChipClass(formatFilter === option.value)}
                onClick={() => setFormatFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredPresets.length === 0 ? (
        <ChampionsEmptyState
          title="No presets match"
          description="Try clearing filters or searching for a different Pokémon."
          primaryLabel="Clear search"
          onPrimaryClick={() => {
            setSearchQuery("");
            setThemeFilter("all");
            setArchetypeFilter("all");
            setFormatFilter("all");
          }}
        />
      ) : (
        <VirtualizedPresetGrid
          items={filteredPresets}
          getKey={(preset) => preset.id}
          renderItem={(preset) => (
            <ChampionsPresetCard
              preset={preset}
              onLoad={() => handleLoadPreset(preset)}
              onPreview={() => setPreviewPreset(preset)}
              isLoading={loadingPresetId === preset.id}
            />
          )}
        />
      )}

      <p
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground/80",
          "rounded-xl border border-border/40 bg-background/30 px-3 py-2",
        )}
      >
        <Sparkles className="size-3.5 text-primary/80" aria-hidden />
        Presets are starting points. Edit roster, SP, and plans in Team Builder after loading.
      </p>
    </ChampionsShell>
    </>
  );
}
