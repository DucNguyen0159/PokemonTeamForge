"use client";

import { useMemo, useState } from "react";

import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_BACKGROUND_CATEGORIES,
  teamCardBackgroundCategoryLabel,
  type TeamCardBackgroundAsset,
} from "@/data/team-card-assets";
import { PickerModal } from "./picker-modal";

type BackgroundPickerModalProps = {
  isOpen: boolean;
  selectedSlug: string;
  onClose: () => void;
  onConfirm: (backgroundSlug: string) => void;
};

export function BackgroundPickerModal({
  isOpen,
  selectedSlug,
  onClose,
  onConfirm,
}: BackgroundPickerModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [pendingSelection, setPendingSelection] = useState(selectedSlug);

  const visibleBackgrounds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return TEAM_CARD_BACKGROUND_ASSETS.filter((entry) => {
      if (category !== "all" && entry.category !== category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${entry.name} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [category, query]);

  function handleConfirm() {
    onConfirm(pendingSelection);
    onClose();
  }

  return (
    <PickerModal
      title="Select Background"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr,220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search backgrounds..."
            className="h-10 rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Basic & Illustration</option>
            {TEAM_CARD_BACKGROUND_CATEGORIES.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBackgrounds.map((entry: TeamCardBackgroundAsset) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => setPendingSelection(entry.slug)}
              className={`rounded-xl border p-2 text-left transition-colors ${
                pendingSelection === entry.slug
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-card/50 hover:bg-white/5"
              }`}
            >
              <div
                className="h-24 rounded-lg border border-white/10 bg-cover bg-center"
                style={{
                  backgroundImage: entry.imagePath
                    ? `url(${entry.imagePath})`
                    : entry.css,
                }}
              />
              <p className="mt-2 text-sm font-medium text-foreground">{entry.name}</p>
              <p className="text-xs text-muted-foreground">
                {teamCardBackgroundCategoryLabel(entry.category)} · {entry.source}
              </p>
            </button>
          ))}
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
