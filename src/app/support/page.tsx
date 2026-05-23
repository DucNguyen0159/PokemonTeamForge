import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Support the site",
  description: "Support PokemonTeamForge development and hosting costs.",
};

export default function SupportPage() {
  return (
    <InfoStubPage
      eyebrow="Support"
      title="Support the site"
      description="PokemonTeamForge is a free fan project. Optional support helps cover hosting and email costs."
    />
  );
}
