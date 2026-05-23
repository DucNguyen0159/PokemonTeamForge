import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";

export const metadata: Metadata = {
  title: "Help",
  description: "How to use PokemonTeamForge: builder, Pokédex, saved teams, and team cards.",
};

export default function HelpPage() {
  return (
    <InfoPageShell
      eyebrow="Help"
      title="Help"
      description="Guides for building teams, using the Pokédex, saving teams to your account, and exporting team cards."
    >
      <InfoSection title="Getting started">
        <ul>
          <li>
            <strong className="text-foreground">Builder</strong> — add up to six Pokémon, set
            format, abilities, items, and moves. Coverage, checklist, and recommendations update
            as you edit.
          </li>
          <li>
            <strong className="text-foreground">Pokédex</strong> — search and filter Pokémon, open
            detail pages, and add Pokémon to your current team.
          </li>
          <li>
            <strong className="text-foreground">Saved teams</strong> — create an account, confirm
            your email, then save and load teams from Profile.
          </li>
          <li>
            <strong className="text-foreground">Team Card</strong> — customize layout and export a
            PNG to share your team.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Accounts and sign-in">
        <ul>
          <li>Register with email and password, then confirm via the link in your inbox.</li>
          <li>Use Forgot password if you need a reset link; set a new password on the reset page.</li>
          <li>Profile lists your cloud-saved teams. Guest mode still works without an account.</li>
          <li>
            Change password from Profile when signed in (current password required).
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="ROM hacks and fan games">
        <p>
          Catalog data is imported from official-generation Pokémon sources (via PokéAPI) and
          curated for standard formats. ROM hacks, fangames, and custom dexes may include Pokémon,
          moves, or mechanics that do not match this database.
        </p>
        <p>
          Use official games as your baseline. PokemonTeamForge does not guarantee accuracy for
          hacked or modified games.
        </p>
      </InfoSection>

      <InfoSection title="Still need help?">
        <p>
          Visit the <Link href="/contact">Contact</Link> page for support and feedback.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
