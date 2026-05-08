"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Tag, Type } from "lucide-react";

import { BACKGROUND_PRESETS, TRAINER_PRESETS } from "@/data/team-card-assets";
import { useTeamStore } from "@/store/team-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

import { TeamCardPreview, type SpriteMode } from "./team-card-preview";
import { BackgroundSelector } from "./background-selector";
import { TrainerSelector } from "./trainer-selector";
import { SpriteModeToggle } from "./sprite-mode-toggle";
import { ExportButton } from "./export-button";

export function TeamCardGenerator() {
  const team = useTeamStore((s) => s.team);
  const cardRef = useRef<HTMLDivElement>(null);

  const [selectedBackground, setSelectedBackground] = useState(BACKGROUND_PRESETS[0]);
  const [selectedTrainer, setSelectedTrainer] = useState(TRAINER_PRESETS[0]);
  const [spriteMode, setSpriteMode] = useState<SpriteMode>("normal");
  const [showNames, setShowNames] = useState(true);
  const [showTypes, setShowTypes] = useState(true);

  const filledSlotCount = useMemo(
    () => team.pokemon.filter((s) => s.pokemon !== null).length,
    [team.pokemon],
  );
  const hasTeam = filledSlotCount > 0;

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
              format={team.format}
              background={selectedBackground}
              trainer={selectedTrainer}
              spriteMode={spriteMode}
              showNames={showNames}
              showTypes={showTypes}
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
              onChange={setSelectedBackground}
            />
          </div>

          {/* Trainer picker */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <TrainerSelector
              selected={selectedTrainer}
              onChange={setSelectedTrainer}
            />
          </div>

          {/* Sprite mode + display options */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-4">
            <SpriteModeToggle mode={spriteMode} onChange={setSpriteMode} />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display options
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowNames((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    showNames
                      ? "bg-primary/15 text-primary"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-pressed={showNames}
                >
                  {showNames ? (
                    <Eye className="size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <EyeOff className="size-3.5 shrink-0" aria-hidden />
                  )}
                  Pokémon names
                </button>
                <button
                  type="button"
                  onClick={() => setShowTypes((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    showTypes
                      ? "bg-primary/15 text-primary"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-pressed={showTypes}
                >
                  {showTypes ? (
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
    </div>
  );
}
