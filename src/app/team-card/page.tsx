import type { Metadata } from "next";
import { TeamCardGenerator } from "@/components/team-card/team-card-generator";

export const metadata: Metadata = {
  title: "Team Card Generator — PokemonTeamForge",
  description: "Customize your Pokémon team card with backgrounds and trainer art, then export as PNG.",
};

export default function TeamCardPage() {
  return <TeamCardGenerator />;
}
