"use client";

import { memo, useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/utils";
import type { Pokemon } from "@/types/pokemon";
import { MOCK_POKEMON } from "@/data/mock-pokemon";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";

type PokemonPickerProps = {
  onSelect: (pokemon: Pokemon) => void;
  onCancel: () => void;
};

const SEARCHABLE_POKEMON = MOCK_POKEMON.map((pokemon) => ({
  pokemon,
  searchableText: [
    pokemon.name,
    pokemon.primaryType,
    pokemon.secondaryType ?? "",
  ]
    .join(" ")
    .toLowerCase(),
}));

function PokemonPickerComponent({ onSelect, onCancel }: PokemonPickerProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      normalizedSearch
        ? SEARCHABLE_POKEMON.filter((entry) =>
            entry.searchableText.includes(normalizedSearch),
          ).map((entry) => entry.pokemon)
        : MOCK_POKEMON,
    [normalizedSearch],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Select Pokémon</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel selection"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-2.5 py-1.5">
        <Search className="size-3.5 flex-shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or type…"
          autoFocus
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No Pokemon found. Try another name or type.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 overflow-y-auto" style={{ maxHeight: "280px" }}>
          {filtered.map((pokemon) => (
            <button
              key={pokemon.id}
              type="button"
              onClick={() => onSelect(pokemon)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/30 px-2.5 py-2",
                "text-left transition-colors",
                "hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-background/60">
                <PokemonSprite
                  src={pokemon.spriteNormal}
                  alt={pokemon.name}
                  size={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold capitalize text-foreground">
                  {pokemon.name}
                </p>
                <div className="mt-0.5 flex gap-1">
                  <TypeBadge type={pokemon.primaryType} />
                  {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const PokemonPicker = memo(PokemonPickerComponent);
