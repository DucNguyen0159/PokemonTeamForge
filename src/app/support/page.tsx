import type { Metadata } from "next";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import { SupportDonationActions } from "@/components/site/support-donation-actions";

export const metadata: Metadata = {
  title: "Support the site",
  description: "Support PokemonTeamForge development and hosting costs.",
};

export default function SupportPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Support the site"
      description="PokemonTeamForge is a free fan project. Optional support helps cover hosting and email costs."
    >
      <p>
        PokemonTeamForge is free to use. It is not affiliated with Nintendo, Game Freak, Creatures,
        or The Pokémon Company.
      </p>

      <InfoSection title="Why support?">
        <p>
          Optional contributions help cover recurring costs such as Vercel hosting, Supabase
          database and auth, and Resend email delivery. Support is voluntary and does not unlock
          paid features.
        </p>
      </InfoSection>

      <InfoSection title="Ways to support">
        <SupportDonationActions />
      </InfoSection>
    </InfoPageShell>
  );
}
