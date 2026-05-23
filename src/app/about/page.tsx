import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "About",
  description: "About PokemonTeamForge — a fan-made Pokémon team building app.",
};

export default function AboutPage() {
  return (
    <InfoStubPage
      eyebrow="About"
      title="About PokemonTeamForge"
      description="A fan-made team builder focused on coverage, strategy presets, and shareable team cards."
    />
  );
}
