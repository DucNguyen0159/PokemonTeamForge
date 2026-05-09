/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

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

function getCharacterBySlug(slug: string): TeamCardTrainerCharacter | null {
  return TEAM_CARD_TRAINER_CHARACTERS.find((entry) => entry.slug === slug) ?? null;
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
  const [selectedCharacterSlug, setSelectedCharacterSlug] = useState(selectedVariant.characterSlug);
  const [pendingVariantSlug, setPendingVariantSlug] = useState(selectedVariant.slug);

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return TEAM_CARD_TRAINER_CHARACTERS;
    }
    return TEAM_CARD_TRAINER_CHARACTERS.filter((entry) => {
      const haystack = `${entry.name} ${entry.group} ${entry.searchTerms.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  const variantsForCharacter = TEAM_CARD_TRAINER_VARIANTS.filter(
    (entry) => entry.characterSlug === selectedCharacterSlug,
  );

  function handleConfirm() {
    onConfirm(pendingVariantSlug);
    onClose();
  }

  return (
    <PickerModal
      title="Select Trainer"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search characters by name..."
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />

        <div className="grid gap-4 lg:grid-cols-[1.2fr,2fr]">
          <div className="rounded-xl border border-border/60 bg-card/40 p-3">
            <p className="mb-2 text-sm font-medium text-foreground">Characters</p>
            <div className="space-y-2 overflow-y-auto pr-1 lg:max-h-[420px]">
              {filteredCharacters.map((entry) => (
                <button
                  key={entry.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCharacterSlug(entry.slug);
                    const firstVariant = TEAM_CARD_TRAINER_VARIANTS.find(
                      (variant) => variant.characterSlug === entry.slug,
                    );
                    if (firstVariant) {
                      setPendingVariantSlug(firstVariant.slug);
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    selectedCharacterSlug === entry.slug
                      ? "border-primary bg-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-white/5"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{entry.group}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              Variants · {getCharacterBySlug(selectedCharacterSlug)?.name ?? "Unknown"}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {variantsForCharacter.map((variant: TeamCardTrainerVariant) => (
                <button
                  key={variant.slug}
                  type="button"
                  onClick={() => setPendingVariantSlug(variant.slug)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    pendingVariantSlug === variant.slug
                      ? "border-primary bg-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-white/5"
                  }`}
                >
                  <div className="flex h-28 items-end justify-center rounded-lg border border-border/60 bg-card/60 px-2 py-2">
                    <img src={variant.imagePath} alt={variant.name} className="h-full object-contain" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{variant.name}</p>
                  <p className="text-xs text-muted-foreground">{variant.source}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Apply
          </button>
        </div>
      </div>
    </PickerModal>
  );
}
