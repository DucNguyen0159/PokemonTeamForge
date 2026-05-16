import type { Metadata } from "next";
import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";

export const metadata: Metadata = {
  title: "Pokédex — PokemonTeamForge",
  description:
    "Browse Pokémon by search, type, or generation. Battle-relevant stats—add contenders straight to your team.",
};

export default function PokedexPage() {
  return <PokedexExplorer />;
}
