import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Credits",
  description: "Data sources and acknowledgements for PokemonTeamForge.",
};

export default function CreditsPage() {
  return (
    <InfoStubPage
      eyebrow="Credits"
      title="Credits"
      description="PokéAPI, sprites, trainer assets, and other contributors that power this project."
    />
  );
}
