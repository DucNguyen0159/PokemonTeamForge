import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Help",
  description: "How to use PokemonTeamForge: builder, Pokédex, saved teams, and team cards.",
};

export default function HelpPage() {
  return (
    <InfoStubPage
      eyebrow="Help"
      title="Help"
      description="Guides for building teams, using the Pokédex, saving teams to your account, and exporting team cards."
    />
  );
}
