/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import {
  TEAM_CARD_TRAINER_CHARACTERS,
  TEAM_CARD_TRAINER_VARIANTS,
  type TeamCardTrainerCharacter,
  type TeamCardTrainerVariant,
} from "@/data/team-card-assets";
import { PickerModal } from "./picker-modal";

type TrainerPickerModalProps = {
  isOpen: boolean;
  selectedVariantSlug: string;
  onClose: () => void;
  onConfirm: (trainerVariantSlug: string) => void;
};

type Step = "characters" | "variants";

function getCharacterBySlug(slug: string): TeamCardTrainerCharacter | null {
  return TEAM_CARD_TRAINER_CHARACTERS.find((entry) => entry.slug === slug) ?? null;
}

function variantsForCharacterSorted(characterSlug: string): TeamCardTrainerVariant[] {
  return TEAM_CARD_TRAINER_VARIANTS.filter((v) => v.characterSlug === characterSlug).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
}

function representativeVariant(characterSlug: string): TeamCardTrainerVariant | null {
  const list = variantsForCharacterSorted(characterSlug);
  return list[0] ?? null;
}

function groupLabel(entry: TeamCardTrainerCharacter): string {
  return entry.group === "masters" ? "Pokémon Masters" : entry.group;
}

export function TrainerPickerModal({
  isOpen,
  selectedVariantSlug,
  onClose,
  onConfirm,
}: TrainerPickerModalProps) {
  const selectedVariant =
    TEAM_CARD_TRAINER_VARIANTS.find((entry) => entry.slug === selectedVariantSlug) ??
    TEAM_CARD_TRAINER_VARIANTS[0];

  const [query, setQuery] = useState("");
  const [step, setStep] = useState<Step>("characters");
  const [selectedCharacterSlug, setSelectedCharacterSlug] = useState(selectedVariant.characterSlug);
  const [pendingVariantSlug, setPendingVariantSlug] = useState(selectedVariant.slug);

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return TEAM_CARD_TRAINER_CHARACTERS;
    }
    return TEAM_CARD_TRAINER_CHARACTERS.filter((entry) => {
      const variants = TEAM_CARD_TRAINER_VARIANTS.filter((v) => v.characterSlug === entry.slug);
      const haystack = `${entry.name} ${entry.group} ${entry.searchTerms.join(" ")} ${variants.map((v) => v.name).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  const variantsForCharacter = variantsForCharacterSorted(selectedCharacterSlug);
  const activeCharacter = getCharacterBySlug(selectedCharacterSlug);
  const summaryThumb =
    TEAM_CARD_TRAINER_VARIANTS.find((v) => v.slug === pendingVariantSlug)?.imagePath ??
    representativeVariant(selectedCharacterSlug)?.imagePath ??
    "";

  function openCharacter(entry: TeamCardTrainerCharacter) {
    setSelectedCharacterSlug(entry.slug);
    const first = representativeVariant(entry.slug);
    if (first) {
      setPendingVariantSlug(first.slug);
    }
    setStep("variants");
  }

  function handleConfirm() {
    onConfirm(pendingVariantSlug);
    onClose();
  }

  return (
    <PickerModal title="Select Trainer" isOpen={isOpen} onClose={onClose}>
      <div className="relative flex min-h-0 flex-col gap-4 pb-2">
        {/* Decorative backdrop (Pokecharms-style faint focal area) */}
        <div
          className="pointer-events-none absolute left-1/2 top-24 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden
        />

        {step === "characters" ? (
          <>
            <div className="relative z-[1] space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Select character
              </p>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search characters by name..."
                  className="h-10 w-full rounded-lg border border-border/60 bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="relative z-[1] min-h-0 flex-1">
              <p className="mb-3 text-sm font-semibold text-foreground">Pokémon Masters</p>
              {filteredCharacters.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No characters match your search.</p>
              ) : (
                <div className="grid max-h-[min(52vh,520px)] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 sm:gap-3">
                  {filteredCharacters.map((entry) => {
                    const rep = representativeVariant(entry.slug);
                    const count = variantsForCharacterSorted(entry.slug).length;
                    return (
                      <button
                        key={entry.slug}
                        type="button"
                        onClick={() => openCharacter(entry)}
                        className="group flex flex-col items-stretch overflow-hidden rounded-xl border border-border/60 bg-card/50 text-left transition-colors hover:border-primary/50 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex aspect-[4/5] items-end justify-center border-b border-border/40 bg-gradient-to-b from-card/30 to-[#0a0f18] px-1.5 pt-2">
                          {rep ? (
                            <img
                              src={rep.imagePath}
                              alt={entry.name}
                              className="h-[88px] w-full object-contain object-bottom transition-transform group-hover:scale-[1.02] sm:h-[100px]"
                              loading="lazy"
                            />
                          ) : (
                            <span className="mb-4 text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="px-2 py-2">
                          <p className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                            {entry.name}
                          </p>
                          <p className="mt-0.5 text-center text-[10px] text-muted-foreground tabular-nums">
                            {count} {count === 1 ? "sprite" : "sprites"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative z-[1] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("characters")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                All characters
              </button>
            </div>

            {activeCharacter ? (
              <div className="relative z-[1] flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-3 sm:px-4">
                <div className="flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-lg border border-border/50 bg-[#0a0f18] sm:size-16">
                  {summaryThumb ? (
                    <img
                      src={summaryThumb}
                      alt={activeCharacter.name}
                      className="max-h-full w-full object-contain object-bottom"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{activeCharacter.name}</p>
                  <p className="mt-1 inline-flex rounded-md border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {groupLabel(activeCharacter)}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="relative z-[1] min-h-0">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Choose outfit / variant</p>
              <div className="grid max-h-[min(48vh,440px)] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 sm:gap-3">
                {variantsForCharacter.map((variant: TeamCardTrainerVariant) => (
                  <button
                    key={variant.slug}
                    type="button"
                    onClick={() => setPendingVariantSlug(variant.slug)}
                    className={`flex flex-col overflow-hidden rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-3 ${
                      pendingVariantSlug === variant.slug
                        ? "border-primary bg-primary/15 ring-1 ring-primary/40"
                        : "border-border/60 bg-card/50 hover:border-border hover:bg-card/70"
                    }`}
                  >
                    <div className="flex h-28 items-end justify-center rounded-lg border border-border/50 bg-[#0a0f18] px-1 py-1 sm:h-32">
                      <img
                        src={variant.imagePath}
                        alt={variant.name}
                        className="h-full w-full object-contain object-bottom"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-center text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                      {variant.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-center text-[10px] text-muted-foreground">
                      {variant.source}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="relative z-[1] mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          {step === "variants" ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Apply
            </button>
          ) : null}
        </div>
      </div>
    </PickerModal>
  );
}
