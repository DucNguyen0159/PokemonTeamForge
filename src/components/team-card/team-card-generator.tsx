"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Tag, Type } from "lucide-react";

import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_DETAIL_ICON_OPTIONS,
  TEAM_CARD_SLOT_FORM_OPTIONS,
  TEAM_CARD_SLOT_ICON_OPTIONS,
  TEAM_CARD_TRAINER_CHARACTERS,
  TEAM_CARD_TRAINER_VARIANTS,
} from "@/data/team-card-assets";
import {
  createDefaultTeamCardConfig,
  deserializeTeamCardConfig,
  normalizeTeamCardConfig,
  serializeTeamCardConfig,
} from "@/lib/team-card/config";
import { useTeamStore } from "@/store/team-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import type { TeamCardDetailRow, TeamCardSpriteMode } from "@/types/team-card";

import { TeamCardPreview } from "./team-card-preview";
import { BackgroundSelector } from "./background-selector";
import { TrainerSelector } from "./trainer-selector";
import { SpriteModeToggle } from "./sprite-mode-toggle";
import { ExportButton } from "./export-button";
import { BackgroundPickerModal } from "./background-picker-modal";
import { TrainerPickerModal } from "./trainer-picker-modal";
import { TrainerInfoPanel } from "./trainer-info-panel";
import { SlotCustomizationPanel } from "./slot-customization-panel";

const TEAM_CARD_CONFIG_STORAGE_KEY = "ptf:team-card:v1";

export function TeamCardGenerator() {
  const team = useTeamStore((s) => s.team);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasLoadedPersistedConfigRef = useRef(false);

  const [config, setConfig] = useState(() => createDefaultTeamCardConfig(team.name));
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [isTrainerPickerOpen, setIsTrainerPickerOpen] = useState(false);

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

  const filledSlotCount = useMemo(
    () => team.pokemon.filter((s) => s.pokemon !== null).length,
    [team.pokemon],
  );
  const hasTeam = filledSlotCount > 0;

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
    if (typeof window === "undefined" || hasLoadedPersistedConfigRef.current) {
      return;
    }

    hasLoadedPersistedConfigRef.current = true;
    const fallback = createDefaultTeamCardConfig(team.name);
    const parsed = deserializeTeamCardConfig(localStorage.getItem(TEAM_CARD_CONFIG_STORAGE_KEY));
    const hydrated = parsed ? normalizeTeamCardConfig(parsed, fallback) : fallback;

    const timeoutId = window.setTimeout(() => {
      setConfig(hydrated);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [team.name]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedPersistedConfigRef.current) {
      return;
    }
    localStorage.setItem(TEAM_CARD_CONFIG_STORAGE_KEY, serializeTeamCardConfig(config));
  }, [config]);

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

  function handleSlotCustomizationChange(slot: number, patch: { formSlug?: string; iconSlug?: string }) {
    setConfig((current) => ({
      ...current,
      slotCustomizations: current.slotCustomizations.map((entry) =>
        entry.slot === slot ? { ...entry, ...patch } : entry,
      ),
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

  function setShowNames(value: boolean) {
    setConfig((current) => ({
      ...current,
      showNames: value,
    }));
  }

  function setShowTypes(value: boolean) {
    setConfig((current) => ({
      ...current,
      showTypes: value,
    }));
  }

  function setGlobalSpriteMode(value: TeamCardSpriteMode) {
    setConfig((current) => ({
      ...current,
      globalSpriteMode: value,
    }));
  }

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Team Card Generator
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Shareable Team Visuals
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your team card and export it as a PNG.
        </p>
      </div>

      {/* Empty team notice */}
      {!hasTeam ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-foreground">No Pokémon in your team yet.</p>
          <p className="text-xs text-muted-foreground">
            Build your team first, then come back here to generate a card.
          </p>
          <Button asChild className="rounded-xl gap-2">
            <Link href="/builder">
              Open Team Builder
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        {/* Preview column */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Card preview */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-3 sm:p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Preview</p>
            <TeamCardPreview
              ref={cardRef}
              teamSlots={team.pokemon}
              teamName={team.name}
              trainerName={config.trainerName}
              trainerDetails={config.detailRows}
              format={team.format}
              background={selectedBackground}
              trainer={selectedTrainerVariant}
              spriteMode={config.globalSpriteMode}
              slotCustomizations={config.slotCustomizations}
              detailIconOptions={TEAM_CARD_DETAIL_ICON_OPTIONS}
              formOptions={TEAM_CARD_SLOT_FORM_OPTIONS}
              slotIconOptions={TEAM_CARD_SLOT_ICON_OPTIONS}
              showNames={config.showNames}
              showTypes={config.showTypes}
            />
          </div>

          {/* Export controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
            <div className="text-xs text-muted-foreground">
              {hasTeam
                ? `${filledSlotCount} / 6 Pokémon · ${team.name}`
                : "Build a team first"}
            </div>
            <ExportButton cardRef={cardRef} teamName={team.name} />
          </div>
        </div>

        {/* Controls sidebar */}
        <aside className="flex w-full flex-col gap-5 xl:w-[320px] xl:flex-shrink-0">
          {/* Background picker */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <BackgroundSelector
              selected={selectedBackground}
              onOpenPicker={() => setIsBackgroundPickerOpen(true)}
            />
          </div>

          {/* Trainer picker */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <TrainerSelector
              selectedVariant={selectedTrainerVariant}
              selectedCharacter={selectedTrainerCharacter}
              onOpenPicker={() => setIsTrainerPickerOpen(true)}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <TrainerInfoPanel
              trainerName={config.trainerName}
              detailRows={config.detailRows}
              detailIconOptions={TEAM_CARD_DETAIL_ICON_OPTIONS}
              onTrainerNameChange={(value) =>
                setConfig((current) => ({
                  ...current,
                  trainerName: value,
                }))
              }
              onDetailRowChange={handleDetailRowChange}
            />
          </div>

          {/* Sprite mode + slot options */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-4">
            <SpriteModeToggle
              mode={config.globalSpriteMode}
              onChange={setGlobalSpriteMode}
              slots={spriteSlotOptions}
              onSlotModeChange={handleSlotSpriteModeChange}
              onClearOverrides={handleClearSpriteOverrides}
            />

            <SlotCustomizationPanel
              teamSlots={team.pokemon}
              slotCustomizations={config.slotCustomizations}
              formOptions={TEAM_CARD_SLOT_FORM_OPTIONS}
              iconOptions={TEAM_CARD_SLOT_ICON_OPTIONS}
              onSlotCustomizationChange={handleSlotCustomizationChange}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display options
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowNames(!config.showNames)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    config.showNames
                      ? "bg-primary/15 text-primary"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-pressed={config.showNames}
                >
                  {config.showNames ? (
                    <Eye className="size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <EyeOff className="size-3.5 shrink-0" aria-hidden />
                  )}
                  Pokémon names
                </button>
                <button
                  type="button"
                  onClick={() => setShowTypes(!config.showTypes)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    config.showTypes
                      ? "bg-primary/15 text-primary"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-pressed={config.showTypes}
                >
                  {config.showTypes ? (
                    <Tag className="size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <Type className="size-3.5 shrink-0" aria-hidden />
                  )}
                  Type badges
                </button>
              </div>
            </div>
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
        key={`trainer-${config.trainerVariantSlug}-${String(isTrainerPickerOpen)}`}
        isOpen={isTrainerPickerOpen}
        selectedVariantSlug={config.trainerVariantSlug}
        onClose={() => setIsTrainerPickerOpen(false)}
        onConfirm={handleTrainerVariantChange}
      />
    </div>
  );
}
