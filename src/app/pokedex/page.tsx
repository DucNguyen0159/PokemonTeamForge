import type { Metadata } from "next";
import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";
import { parsePokedexReturnState } from "@/lib/pokemon/pokedex-return-url";

export const metadata: Metadata = {
  title: "Pokédex — PokemonTeamForge",
  description:
    "Browse Pokémon by search, type, or generation. Battle-relevant stats—add contenders straight to your team.",
};

type PokedexPageProps = {
  searchParams?: Promise<{
    ability?: string;
    view?: string;
    q?: string;
    sort?: string;
    dir?: string;
    gen?: string;
    type?: string;
  }>;
};

export default async function PokedexPage({ searchParams }: PokedexPageProps) {
  const params = await searchParams;
  const initialReturnState = parsePokedexReturnState(params ?? {});

  return <PokedexExplorer initialReturnState={initialReturnState} />;
}
