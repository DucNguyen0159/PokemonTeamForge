import type { Metadata } from "next";

import { InfoPageShell, InfoSection } from "@/components/site/info-page-shell";
import { LEGAL_CONTACT_EMAIL } from "@/lib/site/legal-meta";
import { getSiteConfig } from "@/lib/site/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PokemonTeamForge for support and feedback.",
};

export default function ContactPage() {
  const { contactEmail } = getSiteConfig();
  const email = contactEmail || LEGAL_CONTACT_EMAIL;

  return (
    <InfoPageShell
      eyebrow="Contact"
      title="Contact"
      description="Reach the project maintainer for questions, feedback, or privacy requests."
    >
      <p>
        For support, feedback, bug reports, or privacy-related requests, email us at{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <InfoSection title="What to include">
        <ul>
          <li>A short description of the issue or question</li>
          <li>The page or feature you were using (for example Builder or Profile)</li>
          <li>Your browser and device if reporting a UI problem</li>
        </ul>
      </InfoSection>

      <InfoSection title="Response time">
        <p>
          PokemonTeamForge is maintained as a side project. We reply on a best-effort basis and
          appreciate your patience.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
