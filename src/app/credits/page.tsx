import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import { LEGAL_OPERATOR } from "@/lib/site/legal-meta";

export const metadata: Metadata = {
  title: "Credits",
  description: "Data sources and acknowledgements for PokemonTeamForge.",
};

export default function CreditsPage() {
  return (
    <InfoPageShell
      eyebrow="Credits"
      title="Credits"
      description="PokéAPI, sprites, trainer assets, and other contributors that power this project."
    >
      <InfoSection title="Data and media">
        <ul>
          <li>
            <Link href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">
              PokéAPI
            </Link>{" "}
            — Pokémon, species, stats, types, abilities, moves, items, and related metadata.
          </li>
          <li>
            <Link
              href="https://github.com/PokeAPI/sprites"
              target="_blank"
              rel="noopener noreferrer"
            >
              PokeAPI sprites
            </Link>{" "}
            — sprite image URLs referenced by the catalog.
          </li>
          <li>
            <Link
              href="https://archives.bulbagarden.net/wiki/Category:Pok%C3%A9mon_Masters_Trainer_sprites"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bulbagarden Archives
            </Link>{" "}
            — Pokémon Masters trainer sprites for Team Card exports (CC BY-NC-SA 2.5; non-commercial
            use).
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Infrastructure">
        <ul>
          <li>
            <Link href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              Supabase
            </Link>{" "}
            — database, authentication, and saved teams.
          </li>
          <li>
            <Link href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              Vercel
            </Link>{" "}
            — application hosting.
          </li>
          <li>
            <Link href="https://resend.com" target="_blank" rel="noopener noreferrer">
              Resend
            </Link>{" "}
            — transactional auth email delivery.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Team Card design note">
        <p>
          Some Team Card background and layout ideas were explored with Google Gemini as a
          creative assistant. Final presets, styling, and exports in the app are curated and
          controlled in PokemonTeamForge.
        </p>
      </InfoSection>

      <InfoSection title="Project author">
        <p>
          {LEGAL_OPERATOR} — application code, UI, recommendation scoring, ability tags, strategy
          presets, and related curated metadata.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
