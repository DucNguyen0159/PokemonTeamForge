import type { Metadata } from "next";
import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";

export const metadata: Metadata = {
  title: "Pokédex — PokemonTeamForge",
  description:
    "Browse Pokémon by search, type, or generation. Battle-relevant stats—add contenders straight to your team.",
};

type PokedexPageProps = {
  searchParams?: Promise<{
    ability?: string;
  }>;
};

export default async function PokedexPage({ searchParams }: PokedexPageProps) {
  const params = await searchParams;
  return <PokedexExplorer initialAbility={params?.ability ?? ""} />;
}
