import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/site/site-config";

export function SupportDonationActions() {
  const { kofiUrl, githubSponsorsUrl } = getSiteConfig();
  const hasKofi = Boolean(kofiUrl);
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
          <Link href={kofiUrl} target="_blank" rel="noopener noreferrer">
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
