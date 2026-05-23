import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for PokemonTeamForge.",
};

export default function TermsPage() {
  return (
    <InfoStubPage
      eyebrow="Legal"
      title="Terms of Service"
      description="Terms for using PokemonTeamForge as a fan-made Pokémon team planning tool."
    />
  );
}
