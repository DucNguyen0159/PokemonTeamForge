import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/site/site-config";
import { buildTrackedSupportUrl } from "@/lib/site/support-links";

export function SupportDonationActions() {
  const { kofiUrl, githubSponsorsUrl } = getSiteConfig();
  const trackedKofiUrl = buildTrackedSupportUrl(kofiUrl, {
    source: "poketeamforge",
    medium: "support_page",
    campaign: "support_actions",
  });
  const hasKofi = Boolean(trackedKofiUrl);
  const hasSponsors = Boolean(githubSponsorsUrl);

  if (!hasKofi && !hasSponsors) {
    return (
      <p>
        Optional donations are not enabled yet. The app remains free to use. When support links
        are configured, they will appear on this page.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {hasKofi ? (
        <Button asChild className="h-10 rounded-xl px-5">
          <Link href={trackedKofiUrl} target="_blank" rel="noopener noreferrer">
            Support on Ko-fi
          </Link>
        </Button>
      ) : null}
      {hasSponsors ? (
        <Button asChild variant="outline" className="h-10 rounded-xl px-5">
          <Link href={githubSponsorsUrl} target="_blank" rel="noopener noreferrer">
            GitHub Sponsors
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
