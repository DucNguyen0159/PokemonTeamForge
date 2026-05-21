"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { PokemonDetailNavigation } from "@/lib/pokemon/detail-navigation";
import { readStoredPokedexReturnHref } from "@/lib/pokemon/pokedex-return-url";

type PokemonDetailBackLinkProps = {
  navigation: PokemonDetailNavigation;
};

function resolvePrimaryHref(navigation: PokemonDetailNavigation): string {
  if (!navigation.pokedexReturnStored) {
    return navigation.primaryHref;
  }

  return readStoredPokedexReturnHref() ?? navigation.primaryHref;
}

export function PokemonDetailBackLink({ navigation }: PokemonDetailBackLinkProps) {
  const [primaryHref] = useState(() => resolvePrimaryHref(navigation));

  return (
    <Link
      href={primaryHref}
      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4 shrink-0" aria-hidden />
      {navigation.primaryLabel}
    </Link>
  );
}
