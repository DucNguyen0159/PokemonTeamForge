import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";

type PokemonDetailPageProps = {
  params: Promise<{ pokemonName: string }>;
};

function formatName(segment: string): string {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: PokemonDetailPageProps): Promise<Metadata> {
  const { pokemonName } = await params;
  if (!pokemonName) {
    return { title: "Pokémon" };
  }

  const label = formatName(pokemonName);
  return {
    title: `${label} | PokemonTeamForge`,
    description: `Pokédex-style details for ${label}. Team-building focused, lightweight view.`,
  };
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { pokemonName } = await params;

  if (!pokemonName) {
    notFound();
  }

  const displayName = formatName(pokemonName);

  return (
    <PlaceholderPage
      eyebrow="Pokémon"
      title={displayName}
      description="Sprite, typings, base stats, abilities, and moves will appear here with an Add to Team action. URLs use readable names (e.g. /pokemon/charizard) instead of numeric IDs."
    >
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="rounded-xl" disabled>
          Add to Team (soon)
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/pokedex">Back to Pokédex</Link>
        </Button>
      </div>
    </PlaceholderPage>
  );
}
