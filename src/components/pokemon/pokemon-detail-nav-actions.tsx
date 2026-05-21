"use client";

import { useState } from "react";
import Link from "next/link";

import type { PokemonDetailNavigation } from "@/lib/pokemon/detail-navigation";
import { readStoredPokedexReturnHref } from "@/lib/pokemon/pokedex-return-url";
import { Button } from "@/components/ui/button";

type PokemonDetailNavActionsProps = {
  navigation: PokemonDetailNavigation;
};

function resolvePrimaryHref(navigation: PokemonDetailNavigation): string {
  if (!navigation.pokedexReturnStored) {
    return navigation.primaryHref;
  }

  return readStoredPokedexReturnHref() ?? navigation.primaryHref;
}

export function PokemonDetailNavActions({ navigation }: PokemonDetailNavActionsProps) {
  const [primaryHref] = useState(() => resolvePrimaryHref(navigation));

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="ghost" size="sm" className="rounded-xl">
        <Link href={primaryHref}>{navigation.primaryLabel}</Link>
      </Button>
      <Button asChild variant="secondary" size="sm" className="rounded-xl">
        <Link href={navigation.secondaryHref}>{navigation.secondaryLabel}</Link>
      </Button>
    </div>
  );
}
