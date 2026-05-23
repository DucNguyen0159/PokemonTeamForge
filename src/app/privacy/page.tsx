import type { Metadata } from "next";

import { InfoStubPage } from "@/components/site/info-stub-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for PokemonTeamForge.",
};

export default function PrivacyPage() {
  return (
    <InfoStubPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="How PokemonTeamForge handles account data, saved teams, and third-party services."
    />
  );
}
