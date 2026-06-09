import type { Metadata } from "next";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import { SupportDonationActions } from "@/components/site/support-donation-actions";
import { SUPPORT_MONTHLY_TARGET_AMOUNT } from "@/lib/site/support-links";

export const metadata: Metadata = {
  title: "Support the site",
  description: "Support PokemonTeamForge and help keep it free and online.",
};

export default function SupportPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Support the site"
      description="PokemonTeamForge is a free fan project. Optional support helps keep it online and fund future maintenance."
    >
      <p>
        PokemonTeamForge is free to use. It is not affiliated with Nintendo, Game Freak, Creatures,
        or The Pokémon Company.
      </p>

      <InfoSection title="Why support?">
        <p>
          Optional contributions help cover costs like domain, hosting, Supabase database/auth, and
          email delivery. Support is voluntary, with no paywall and no premium unlocks.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Current goal:{" "}
          <span className="font-semibold text-foreground">
            ${SUPPORT_MONTHLY_TARGET_AMOUNT}/month
          </span>{" "}
          to help keep PokemonTeamForge free, online, and actively maintained.
        </p>
      </InfoSection>

      <InfoSection title="Ways to support">
        <SupportDonationActions />
      </InfoSection>
    </InfoPageShell>
  );
}
