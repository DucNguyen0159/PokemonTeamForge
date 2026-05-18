import type { Metadata } from "next";

import { AbilityBrowser } from "@/components/abilities/ability-browser";

export const metadata: Metadata = {
  title: "Abilities | PokemonTeamForge",
  description:
    "Browse Pokémon abilities by battle-focused tags, inspect effects, and find Pokémon with each ability.",
  openGraph: {
    title: "Abilities | PokemonTeamForge",
    description:
      "Search battle-focused Pokémon ability data, filter by competitive tags, and jump to matching Pokémon.",
    type: "website",
    siteName: "PokemonTeamForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abilities | PokemonTeamForge",
    description:
      "Browse ability effects, competitive tags, hidden ability markers, and Pokémon matches.",
  },
};

type AbilitiesPageProps = {
  searchParams?: Promise<{
    ability?: string;
  }>;
};

export default async function AbilitiesPage({ searchParams }: AbilitiesPageProps) {
  const params = await searchParams;
  return <AbilityBrowser initialAbility={params?.ability ?? ""} />;
}
