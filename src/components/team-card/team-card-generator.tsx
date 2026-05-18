"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_DETAIL_ICON_OPTIONS,
  TEAM_CARD_TRAINER_CHARACTERS,
  TEAM_CARD_TRAINER_VARIANTS,
} from "@/data/team-card-assets";
import {
  getTeamCardExportPreset,
  getTeamCardLayoutPreset,
  TEAM_CARD_EXPORT_PRESETS,
  TEAM_CARD_LAYOUT_PRESETS,
  TEAM_CARD_STYLE_PRESETS,
} from "@/data/team-card-presets";
import {
  clampTeamCardTitle,
  clampTeamCardTrainerName,
  createDefaultTeamCardConfig,
  defaultTeamCardTitle,
  hydrateTeamCardConfigFromStorage,
  serializeTeamCardConfig,
} from "@/lib/team-card/config";
import { useTeamStore } from "@/store/team-store";
import { PageIntro, PageIntroChip } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import type {
  TeamCardBorderStyle,
  TeamCardDetailRow,
  TeamCardLabelStyle,
  TeamCardOverlayIntensity,
  TeamCardSpriteGlow,
  TeamCardSpriteMode,
  TeamCardVisualStyle,
  TeamCardStylePreset,
  TeamCardLayoutPresetId,
  TeamCardExportPresetId,
} from "@/types/team-card";

import { TeamCardPreview } from "./team-card-preview";
import { BackgroundSelector } from "./background-selector";
import { TrainerSelector } from "./trainer-selector";
import { SpriteModeToggle } from "./sprite-mode-toggle";
import { ExportButton } from "./export-button";
import { BackgroundPickerModal } from "./background-picker-modal";
import { TrainerPickerModal } from "./trainer-picker-modal";
import { TrainerInfoPanel } from "./trainer-info-panel";

const TEAM_CARD_CONFIG_STORAGE_KEY = "ptf:team-card:v1";

type StudioTab = "style" | "trainer" | "pokemon" | "export";
type PreviewZoom = "fit" | "full";

const STUDIO_TABS: Array<{ id: StudioTab; label: string; description: string }> = [
  { id: "style", label: "Style", description: "Full card themes, background override, and treatment." },
  { id: "trainer", label: "Trainer", description: "Card title, trainer art, headline, and subtitle." },
  { id: "pokemon", label: "Pokemon", description: "Global and per-slot sprite mode." },
  { id: "export", label: "Export", description: "Review output and save your PNG." },
];

const PREVIEW_ZOOM_OPTIONS: Array<{ id: PreviewZoom; label: string }> = [
  { id: "fit", label: "Fit" },
  { id: "full", label: "100%" },
];

const SUBTITLE_PRESETS = [
  "Pokemon Trainer",
  "Champion",
  "Gym Leader",
  "Battle Strategist",
  "Rain Specialist",
  "Doubles Specialist",
] as const;

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-background/35 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              value === option.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const STYLE_SWATCHES: Record<string, string> = {
  "neon-city": "from-cyan-400/70 via-violet-500/50 to-slate-950",
  "storm-battle": "from-slate-100/35 via-sky-500/30 to-slate-950",
  "cosmic-arena": "from-fuchsia-400/70 via-violet-700/50 to-slate-950",
  "classic-league": "from-amber-300/70 via-slate-500/40 to-slate-950",
  "volcanic-core": "from-orange-400/80 via-red-700/50 to-slate-950",
  "minimal-focus": "from-slate-300/40 via-slate-700/35 to-slate-950",
};

function PresetMetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border/40 bg-background/35 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function TeamCardGenerator() {
  const team = useTeamStore((s) => s.team);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasStartedConfigHydrationRef = useRef(false);

  const [config, setConfig] = useState(() => createDefaultTeamCardConfig(team.name));
  const [isConfigHydrated, setIsConfigHydrated] = useState(false);
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [isTrainerPickerOpen, setIsTrainerPickerOpen] = useState(false);
  const [trainerPickerInstance, setTrainerPickerInstance] = useState(0);
  const [activeTab, setActiveTab] = useState<StudioTab>("style");
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>("fit");

  const selectedBackground =
    TEAM_CARD_BACKGROUND_ASSETS.find((entry) => entry.slug === config.backgroundSlug) ??
    TEAM_CARD_BACKGROUND_ASSETS[0];
  const selectedTrainerVariant =
    TEAM_CARD_TRAINER_VARIANTS.find((entry) => entry.slug === config.trainerVariantSlug) ??
    TEAM_CARD_TRAINER_VARIANTS[0];
  const selectedTrainerCharacter =
    TEAM_CARD_TRAINER_CHARACTERS.find(
      (entry) => entry.slug === selectedTrainerVariant.characterSlug,
    ) ?? null;
  const selectedLayoutPreset = getTeamCardLayoutPreset(config.layoutPresetId);
  const selectedExportPreset = getTeamCardExportPreset(config.exportPresetId);

  const filledSlotCount = useMemo(
    () => team.pokemon.filter((s) => s.pokemon !== null).length,
    [team.pokemon],
  );
  const hasTeam = filledSlotCount > 0;
  const isTrainerReady = config.trainerName.trim().length > 0;
  const isSubtitleReady = Boolean(config.detailRows[0]?.text?.trim());
  const previewStatusItems = [
    { label: `${filledSlotCount}/6 Pokemon`, isReady: filledSlotCount === 6 },
    { label: isTrainerReady ? "Trainer set" : "Trainer missing", isReady: isTrainerReady },
    { label: selectedBackground ? "Background set" : "Background missing", isReady: Boolean(selectedBackground) },
    { label: isSubtitleReady ? "Subtitle set" : "Subtitle optional", isReady: true },
  ];

  const spriteSlotOptions = useMemo(
    () =>
      team.pokemon.map((slot) => ({
        slot: slot.slot,
        name: slot.pokemon?.name ?? "Empty slot",
        hasPokemon: Boolean(slot.pokemon),
        mode:
          config.slotCustomizations.find((entry) => entry.slot === slot.slot)?.spriteMode ??
          config.globalSpriteMode,
      })),
    [config.globalSpriteMode, config.slotCustomizations, team.pokemon],
  );

  useEffect(() => {
    if (typeof window === "undefined" || hasStartedConfigHydrationRef.current) {
      return;
    }

    hasStartedConfigHydrationRef.current = true;
    const fallback = createDefaultTeamCardConfig(team.name);
    const hydrated = hydrateTeamCardConfigFromStorage(
      localStorage.getItem(TEAM_CARD_CONFIG_STORAGE_KEY),
      fallback,
    );

    setConfig(hydrated);
    setIsConfigHydrated(true);
  }, [team.name]);

  useEffect(() => {
    if (typeof window === "undefined" || !isConfigHydrated) {
      return;
    }
    localStorage.setItem(TEAM_CARD_CONFIG_STORAGE_KEY, serializeTeamCardConfig(config));
  }, [config, isConfigHydrated]);

  useEffect(() => {
    if (!isConfigHydrated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setConfig((current) => {
        if (current.isCardTitleCustom) {
          return current;
        }

        const nextTitle = defaultTeamCardTitle(team.name);
        return current.cardTitle === nextTitle ? current : { ...current, cardTitle: nextTitle };
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isConfigHydrated, team.name]);

  function handleSlotSpriteModeChange(slot: number, mode: TeamCardSpriteMode) {
    setConfig((current) => ({
      ...current,
      slotCustomizations: current.slotCustomizations.map((entry) =>
        entry.slot === slot ? { ...entry, spriteMode: mode } : entry,
      ),
    }));
  }

  function handleClearSpriteOverrides() {
    setConfig((current) => ({
      ...current,
      slotCustomizations: current.slotCustomizations.map((entry) => ({
        ...entry,
        spriteMode: undefined,
      })),
    }));
  }

  function handleDetailRowChange(id: TeamCardDetailRow["id"], patch: Partial<TeamCardDetailRow>) {
    setConfig((current) => ({
      ...current,
      detailRows: current.detailRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function handleCardTitleChange(value: string) {
    setConfig((current) => ({
      ...current,
      cardTitle: clampTeamCardTitle(value),
      isCardTitleCustom: true,
    }));
  }

  function handleBackgroundChange(backgroundSlug: string) {
    setConfig((current) => ({
      ...current,
      backgroundSlug,
    }));
  }

  function handleTrainerVariantChange(trainerVariantSlug: string) {
    setConfig((current) => ({
      ...current,
      trainerVariantSlug,
    }));
  }

  function setGlobalSpriteMode(value: TeamCardSpriteMode) {
    setConfig((current) => ({
      ...current,
      globalSpriteMode: value,
    }));
  }

  function updateVisualStyle(patch: Partial<TeamCardVisualStyle>) {
    setConfig((current) => ({
      ...current,
      visualStyle: {
        ...current.visualStyle,
        ...patch,
      },
    }));
  }

  function applyPreset(preset: TeamCardStylePreset) {
    setConfig((current) => ({
      ...current,
      backgroundSlug: preset.backgroundSlug,
      layoutPresetId: preset.layoutPresetId,
      exportPresetId: preset.exportPresetId,
      visualStyle: {
        presetId: preset.id,
        ...preset.visualStyle,
      },
    }));
  }

  function setLayoutPreset(layoutPresetId: TeamCardLayoutPresetId) {
    setConfig((current) => ({
      ...current,
      layoutPresetId,
    }));
  }

  function setExportPreset(exportPresetId: TeamCardExportPresetId) {
    setConfig((current) => ({
      ...current,
      exportPresetId,
    }));
  }

  function setSubtitlePreset(text: string) {
    const row = config.detailRows[0] ?? { id: "detail-1" as const, iconSlug: "instagram", text: "" };
    handleDetailRowChange(row.id, { text });
  }

  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 px-4 py-6">
      <PageIntro
        eyebrow="Team Card Studio"
        title="Create a Shareable Team Card"
        description="Customize your trainer, background, sprites, and card identity, then export a polished PNG for sharing."
        chips={
          <>
            <PageIntroChip>{filledSlotCount}/6 Pokémon loaded</PageIntroChip>
            <PageIntroChip>{selectedExportPreset.format.toUpperCase()} export</PageIntroChip>
            <PageIntroChip className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              PNG ready
            </PageIntroChip>
          </>
        }
      />

      {/* Empty team notice */}
      {!hasTeam ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-card/60 p-6 text-center shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(155,181,209,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]"
          />
          <div className="relative mx-auto flex max-w-md flex-col items-center space-y-3">
            <span className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <ArrowRight className="size-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">No Pokémon in your team yet.</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Build your roster first, then return here to turn it into a polished export card.
            </p>
            <Button asChild className="rounded-xl gap-2">
              <Link href="/builder">
                Open Team Builder
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-xl shadow-black/10 transition-shadow duration-300 hover:shadow-black/20">
            <div className="flex flex-col gap-3 border-b border-border/50 bg-background/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Preview
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5">
                    {selectedLayoutPreset.composition.aspectRatio.replace(" / ", ":")}
                  </span>
                  <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5">
                    {selectedExportPreset.format.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5">
                    {selectedExportPreset.width}x{selectedExportPreset.height}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex justify-center rounded-xl border border-border/60 bg-background/45 p-1">
                  {PREVIEW_ZOOM_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPreviewZoom(option.id)}
                      aria-pressed={previewZoom === option.id}
                      className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        previewZoom === option.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <ExportButton
                  cardRef={cardRef}
                  teamName={config.cardTitle}
                  pixelRatio={selectedExportPreset.pixelRatio}
                  exportWidth={selectedExportPreset.width}
                  exportHeight={selectedExportPreset.height}
                />
              </div>
            </div>

            <div className="relative overflow-auto bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.72),rgba(3,7,18,0.56))] p-4 sm:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"
              />
              <div
                className={cn(
                  "relative mx-auto transition-[width,transform] duration-200",
                  previewZoom === "fit" ? "w-full" : "w-[960px]",
                )}
              >
                <TeamCardPreview
                  ref={cardRef}
                  teamSlots={team.pokemon}
                  teamName={config.cardTitle}
                  trainerName={config.trainerName}
                  trainerDetails={config.detailRows}
                  background={selectedBackground}
                  trainer={selectedTrainerVariant}
                  spriteMode={config.globalSpriteMode}
                  slotCustomizations={config.slotCustomizations}
                  visualStyle={config.visualStyle}
                  composition={selectedLayoutPreset.composition}
                  detailIconOptions={TEAM_CARD_DETAIL_ICON_OPTIONS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/50 bg-background/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5 text-xs text-muted-foreground">
                <p className="truncate font-medium text-foreground">{config.cardTitle}</p>
                <p>
                  {hasTeam
                    ? `${selectedBackground.name} · ${selectedLayoutPreset.label}`
                    : "Build a team first"}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {previewStatusItems.map((item) => (
                  <span
                    key={item.label}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                      item.isReady
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300",
                    )}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full rounded-2xl border border-border/60 bg-card/60 p-3 shadow-md xl:sticky xl:top-24">
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-background/30 p-1 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            {STUDIO_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-4 rounded-xl border border-border/40 bg-background/20 px-3 py-2">
            <p className="text-xs font-medium text-foreground">
              {STUDIO_TABS.find((tab) => tab.id === activeTab)?.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {STUDIO_TABS.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>

          <div className="max-h-none space-y-4 xl:max-h-[calc(100dvh-13rem)] xl:overflow-y-auto xl:pr-1">
            {activeTab === "style" ? (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Style Presets
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/75">
                      Full card themes that set the background, labels, slot frames, glow, border, and
                      recommended layout together.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                    {TEAM_CARD_STYLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "group overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          config.visualStyle.presetId === preset.id
                            ? "border-primary/60 bg-primary/10"
                            : "border-border/50 bg-background/25 hover:border-border/80 hover:bg-background/45",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "block h-12 bg-gradient-to-br opacity-90 transition-opacity group-hover:opacity-100",
                            STYLE_SWATCHES[preset.id],
                          )}
                        />
                        <span className="block space-y-2 p-3">
                          <span className="block text-sm font-semibold text-foreground">{preset.label}</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            {preset.description}
                          </span>
                          <span className="flex flex-wrap gap-1.5">
                            <PresetMetaPill>{preset.visualStyle.labelStyle} labels</PresetMetaPill>
                            <PresetMetaPill>{preset.visualStyle.pokemonFrameStyle}</PresetMetaPill>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/20 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Layout Presets
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/75">
                      Change how the trainer and team are composed in the exported card.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {TEAM_CARD_LAYOUT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setLayoutPreset(preset.id)}
                        aria-pressed={config.layoutPresetId === preset.id}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          config.layoutPresetId === preset.id
                            ? "border-primary/60 bg-primary/10"
                            : "border-border/50 bg-background/25 hover:border-border/80 hover:bg-background/45",
                        )}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block text-sm font-semibold text-foreground">{preset.label}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {preset.description}
                            </span>
                          </span>
                          <span className="rounded-full border border-border/50 bg-background/45 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {preset.composition.aspectRatio.replace(" / ", ":")}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                  <BackgroundSelector
                    selected={selectedBackground}
                    onOpenPicker={() => setIsBackgroundPickerOpen(true)}
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Visual Treatment
                  </p>
                  <SegmentedControl<TeamCardOverlayIntensity>
                    label="Overlay"
                    value={config.visualStyle.overlayIntensity}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                    ]}
                    onChange={(overlayIntensity) => updateVisualStyle({ overlayIntensity })}
                  />
                  <SegmentedControl<TeamCardSpriteGlow>
                    label="Sprite Glow"
                    value={config.visualStyle.spriteGlow}
                    options={[
                      { value: "off", label: "Off" },
                      { value: "soft", label: "Soft" },
                      { value: "strong", label: "Strong" },
                    ]}
                    onChange={(spriteGlow) => updateVisualStyle({ spriteGlow })}
                  />
                  <SegmentedControl<TeamCardLabelStyle>
                    label="Labels"
                    value={config.visualStyle.labelStyle}
                    options={[
                      { value: "minimal", label: "Minimal" },
                      { value: "badge", label: "Badge" },
                      { value: "pill", label: "Pill" },
                    ]}
                    onChange={(labelStyle) => updateVisualStyle({ labelStyle })}
                  />
                  <SegmentedControl<TeamCardBorderStyle>
                    label="Border"
                    value={config.visualStyle.borderStyle}
                    options={[
                      { value: "none", label: "None" },
                      { value: "subtle", label: "Subtle" },
                      { value: "neon", label: "Neon" },
                    ]}
                    onChange={(borderStyle) => updateVisualStyle({ borderStyle })}
                  />
                </div>
              </>
            ) : null}

            {activeTab === "trainer" ? (
              <>
                <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                  <TrainerSelector
                    selectedVariant={selectedTrainerVariant}
                    selectedCharacter={selectedTrainerCharacter}
                    onOpenPicker={() => {
                      setTrainerPickerInstance((k) => k + 1);
                      setIsTrainerPickerOpen(true);
                    }}
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                  <TrainerInfoPanel
                    cardTitle={config.cardTitle}
                    isCardTitleCustom={config.isCardTitleCustom}
                    trainerName={config.trainerName}
                    detailRows={config.detailRows}
                    detailIconOptions={TEAM_CARD_DETAIL_ICON_OPTIONS}
                    onCardTitleChange={handleCardTitleChange}
                    onTrainerNameChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        trainerName: clampTeamCardTrainerName(value),
                      }))
                    }
                    onDetailRowChange={handleDetailRowChange}
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {SUBTITLE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSubtitlePreset(preset)}
                        className="rounded-full border border-border/50 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "pokemon" ? (
              <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                <SpriteModeToggle
                  mode={config.globalSpriteMode}
                  onChange={setGlobalSpriteMode}
                  slots={spriteSlotOptions}
                  onSlotModeChange={handleSlotSpriteModeChange}
                  onClearOverrides={handleClearSpriteOverrides}
                />
              </div>
            ) : null}

            {activeTab === "export" ? (
              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/20 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Export Size
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/75">
                      Pick the PNG size before exporting. All options keep the card&apos;s 5:3 composition.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {TEAM_CARD_EXPORT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setExportPreset(preset.id)}
                        aria-pressed={config.exportPresetId === preset.id}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          config.exportPresetId === preset.id
                            ? "border-primary/60 bg-primary/10"
                            : "border-border/50 bg-background/25 hover:border-border/80 hover:bg-background/45",
                        )}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block text-sm font-semibold text-foreground">{preset.label}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {preset.description}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full border border-border/50 bg-background/45 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {preset.width}x{preset.height}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              <div className="space-y-4 rounded-2xl border border-border/60 bg-background/20 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Export Summary
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Card Title</dt>
                      <dd className="truncate text-foreground">{config.cardTitle}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Builder Team</dt>
                      <dd className="truncate text-foreground">{team.name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Loaded Pokémon</dt>
                      <dd className="text-foreground">{filledSlotCount} / 6</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Preset</dt>
                      <dd className="capitalize text-foreground">
                        {config.visualStyle.presetId.replaceAll("-", " ")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Layout</dt>
                      <dd className="text-foreground">{selectedLayoutPreset.label}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Output</dt>
                      <dd className="text-foreground">
                        {selectedExportPreset.format.toUpperCase()} · {selectedExportPreset.width}x
                        {selectedExportPreset.height}
                      </dd>
                    </div>
                  </dl>
                </div>
                <ExportButton
                  cardRef={cardRef}
                  teamName={config.cardTitle}
                  pixelRatio={selectedExportPreset.pixelRatio}
                  exportWidth={selectedExportPreset.width}
                  exportHeight={selectedExportPreset.height}
                  className="w-full [&_button]:w-full"
                />
                <p className="text-xs text-muted-foreground/70">
                  Export uses the live preview exactly as shown. Local assets are used for reliable PNG output.
                </p>
              </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <BackgroundPickerModal
        key={`bg-${config.backgroundSlug}-${String(isBackgroundPickerOpen)}`}
        isOpen={isBackgroundPickerOpen}
        selectedSlug={config.backgroundSlug}
        onClose={() => setIsBackgroundPickerOpen(false)}
        onConfirm={handleBackgroundChange}
      />
      <TrainerPickerModal
        key={trainerPickerInstance}
        isOpen={isTrainerPickerOpen}
        selectedVariantSlug={config.trainerVariantSlug}
        onClose={() => setIsTrainerPickerOpen(false)}
        onConfirm={handleTrainerVariantChange}
      />
    </div>
  );
}
