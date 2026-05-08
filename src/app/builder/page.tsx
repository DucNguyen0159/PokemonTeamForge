import type { Metadata } from "next";
import { TeamBuilder } from "@/components/builder/team-builder";

export const metadata: Metadata = {
  title: "Team Builder — PokemonTeamForge",
  description: "Build and analyze your Pokémon team with real-time coverage, checklist, and recommendations.",
};

export default function BuilderPage() {
  return <TeamBuilder />;
}
