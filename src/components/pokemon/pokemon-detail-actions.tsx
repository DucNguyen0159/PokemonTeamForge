"use client";

import { useState } from "react";
import Link from "next/link";

import { addPokemonSlugToTeam } from "@/lib/team/add-pokemon-to-team";
import { useAppToast } from "@/providers/toast-provider";
import { Button } from "@/components/ui/button";

type PokemonDetailActionsProps = {
  slug: string;
};

export function PokemonDetailActions({ slug }: PokemonDetailActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useAppToast();

  async function handleAddToTeam() {
    setIsAdding(true);
    try {
      const result = await addPokemonSlugToTeam(slug);
      if (result.ok) {
        showToast(`Added ${result.pokemonName} to slot ${result.slot}.`, "success");
      } else {
        showToast(result.message, "error");
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        className="rounded-xl"
        disabled={isAdding}
        onClick={() => void handleAddToTeam()}
      >
        {isAdding ? "Adding…" : "Add to Team"}
      </Button>
      <Button asChild variant="outline" size="sm" className="rounded-xl">
        <Link href="/builder">Open Builder</Link>
      </Button>
    </div>
  );
}
