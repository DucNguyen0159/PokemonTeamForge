import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import { getSiteConfig } from "@/lib/site/site-config";
import { LEGAL_OPERATOR } from "@/lib/site/legal-meta";

export const metadata: Metadata = {
  title: "About",
  description: "About PokemonTeamForge — a fan-made Pokémon team building app.",
};

export default function AboutPage() {
  const { githubRepoUrl } = getSiteConfig();

  return (
    <InfoPageShell
      eyebrow="About"
      title="About PokemonTeamForge"
      description="A fan-made team builder focused on coverage, strategy presets, and shareable team cards."
    >
      <p>
        PokemonTeamForge is an independent fan project created by {LEGAL_OPERATOR} in Colorado.
        It helps players plan
        teams, review type coverage, browse battle-oriented Pokémon data, and export team cards
        for sharing.
      </p>

      <InfoSection title="What you can do here">
        <ul>
          <li>Build singles, doubles, or triples teams in the Builder</li>
          <li>Review defensive and offensive coverage plus role checklist signals</li>
          <li>Browse the Pokédex and Abilities browser for team decisions</li>
          <li>Load strategy presets as starting points</li>
          <li>Export polished Team Card images</li>
          <li>Save teams to your account when signed in</li>
        </ul>
      </InfoSection>

      <InfoSection title="Fan project disclaimer">
        <p>
          PokemonTeamForge is not affiliated with, endorsed by, or sponsored by Nintendo, Game
          Freak, Creatures, or The Pokémon Company. Pokémon names, sprites, and related marks
          belong to their respective owners.
        </p>
      </InfoSection>

      <InfoSection title="Source code">
        <p>
          The app is open on GitHub:{" "}
          <Link href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
            {githubRepoUrl.replace(/^https:\/\//, "")}
          </Link>
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
