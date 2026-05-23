import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PokemonTeamForge for support and feedback.",
};

export default function ContactPage() {
  return (
    <InfoStubPage
      eyebrow="Contact"
      title="Contact"
      description="Reach the project maintainer for questions, feedback, or privacy requests."
    />
  );
}
