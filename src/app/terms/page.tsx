import type { Metadata } from "next";
import Link from "next/link";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_GOVERNING_LAW,
  LEGAL_LAST_UPDATED,
  LEGAL_OPERATOR,
} from "@/lib/site/legal-meta";
import { getSiteConfig } from "@/lib/site/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for PokemonTeamForge.",
};

export default function TermsPage() {
  const { contactEmail } = getSiteConfig();
  const email = contactEmail || LEGAL_CONTACT_EMAIL;

  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="Terms for using PokemonTeamForge as a fan-made Pokémon team planning tool."
    >
      <p className="text-xs text-muted-foreground/90">
        Last updated: {LEGAL_LAST_UPDATED}. Governing law: {LEGAL_GOVERNING_LAW}.
      </p>

      <InfoSection title="Agreement">
        <p>
          These Terms govern your use of PokemonTeamForge operated by {LEGAL_OPERATOR}. By
          accessing or using the site, you agree to these Terms. If you do not agree, do not use
          the service.
        </p>
      </InfoSection>

      <InfoSection title="Fan project">
        <p>
          PokemonTeamForge is an unofficial fan project. It is not affiliated with, endorsed by,
          or sponsored by Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon and
          related trademarks are property of their respective owners.
        </p>
      </InfoSection>

      <InfoSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for unlawful purposes or to harass others</li>
          <li>Attempt to break security, overload systems, or scrape the service aggressively</li>
          <li>Misrepresent affiliation with Nintendo or other rights holders</li>
          <li>Upload malicious content or interfere with other users&apos; use of the service</li>
        </ul>
      </InfoSection>

      <InfoSection title="Accounts">
        <p>
          You are responsible for your account credentials and activity under your account. Keep
          your password secure. Notify us if you suspect unauthorized access via{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </InfoSection>

      <InfoSection title="Intellectual property">
        <p>
          The PokemonTeamForge application, branding, and original curated content are owned by
          the operator unless otherwise noted. Third-party data and assets remain subject to their
          respective licenses (see <Link href="/credits">Credits</Link>).
        </p>
      </InfoSection>

      <InfoSection title="Disclaimer of warranties">
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind. We do not guarantee uninterrupted access, error-free calculations, or
          competitive accuracy of recommendations.
        </p>
      </InfoSection>

      <InfoSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {LEGAL_OPERATOR} is not liable for indirect,
          incidental, or consequential damages arising from your use of PokemonTeamForge. Our
          total liability for any claim related to the service is limited to the amount you paid
          us in the past twelve months (which is zero for the free service).
        </p>
      </InfoSection>

      <InfoSection title="Termination">
        <p>
          We may suspend or terminate access if you violate these Terms or if needed to protect
          the service. You may stop using the site at any time and may delete your account from
          Profile when that feature is available.
        </p>
      </InfoSection>

      <InfoSection title="Changes">
        <p>
          We may update these Terms. Material changes will be reflected in the “Last updated” date.
          Continued use after changes constitutes acceptance.
        </p>
      </InfoSection>

      <InfoSection title="Contact">
        <p>
          Questions about these Terms: <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
