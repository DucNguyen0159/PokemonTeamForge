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
  title: "Privacy Policy",
  description: "Privacy policy for PokemonTeamForge.",
};

export default function PrivacyPage() {
  const { contactEmail } = getSiteConfig();
  const email = contactEmail || LEGAL_CONTACT_EMAIL;

  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="How PokemonTeamForge handles account data, saved teams, and third-party services."
    >
      <p className="text-xs text-muted-foreground/90">
        Last updated: {LEGAL_LAST_UPDATED}. Operator: {LEGAL_OPERATOR}. Contact:{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <InfoSection title="Overview">
        <p>
          PokemonTeamForge is a fan-made web app. This policy describes what we collect, how we
          use it, and your choices. By using the site, you agree to this policy.
        </p>
      </InfoSection>

      <InfoSection title="Information we collect">
        <ul>
          <li>
            <strong className="text-foreground">Account data</strong> — email address, password
            (stored by our auth provider, not in plain text), and optional username.
          </li>
          <li>
            <strong className="text-foreground">Saved teams</strong> — team names, formats, and
            Pokémon slot data you choose to store when signed in.
          </li>
          <li>
            <strong className="text-foreground">Guest builder data</strong> — your current team may
            be stored in your browser (local storage) until you clear it or sign in.
          </li>
          <li>
            <strong className="text-foreground">Technical data</strong> — standard server and
            hosting logs from our providers (for example IP address, user agent, and request
            timestamps) for security and reliability.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="How we use information">
        <p>We use data to run the service: authentication, saving teams, and keeping the app secure and available. We do not sell your personal information.</p>
      </InfoSection>

      <InfoSection title="Service providers">
        <ul>
          <li>Supabase — database and authentication</li>
          <li>Vercel — hosting the Next.js application</li>
          <li>Resend — sending sign-up, password reset, and other auth emails</li>
        </ul>
        <p>These providers process data on our behalf under their own terms and privacy policies.</p>
      </InfoSection>

      <InfoSection title="Cookies and local storage">
        <p>
          We use browser storage and session mechanisms needed for sign-in and to remember your
          current team in guest mode. We do not use third-party advertising or analytics cookies
          at launch.
        </p>
      </InfoSection>

      <InfoSection title="Advertising and analytics">
        <p>
          At launch, PokemonTeamForge does not show third-party ads and does not use third-party
          analytics products. If that changes, we will update this policy before enabling ads or
          analytics.
        </p>
      </InfoSection>

      <InfoSection title="Children">
        <p>
          The service is not directed at children under 13. We do not knowingly collect personal
          information from children.
        </p>
      </InfoSection>

      <InfoSection title="Your choices">
        <ul>
          <li>Use guest mode without an account.</li>
          <li>Delete saved teams from Profile.</li>
          <li>
            Delete your account from Profile (when available) to remove your auth record and
            associated saved data.
          </li>
          <li>
            Contact us at <a href={`mailto:${email}`}>{email}</a> for privacy questions.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Data retention">
        <p>
          We keep account and saved-team data while your account is active. If you delete your
          account, associated user data is removed subject to normal backup and log retention by
          our providers.
        </p>
      </InfoSection>

      <InfoSection title="Security">
        <p>
          We use industry-standard practices through our providers (HTTPS, row-level security for
          database access, and authenticated sessions). No method of transmission or storage is
          100% secure.
        </p>
      </InfoSection>

      <InfoSection title="Changes">
        <p>
          We may update this policy. The “Last updated” date at the top will change when we do.
          Continued use after changes means you accept the revised policy.
        </p>
      </InfoSection>

      <InfoSection title="Governing law">
        <p>This policy is governed by the laws of {LEGAL_GOVERNING_LAW}, without regard to conflict-of-law rules.</p>
      </InfoSection>

      <InfoSection title="Contact">
        <p>
          Questions: <a href={`mailto:${email}`}>{email}</a> or the{" "}
          <Link href="/contact">Contact</Link> page.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
