import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/site/site-config";
import { buildTrackedSupportUrl, SUPPORT_MONTHLY_TARGET_LABEL } from "@/lib/site/support-links";

const SUPPORT_COST_LABELS = ["Domain", "Hosting", "Database/Auth", "Email"] as const;

export function HomeSupportSection() {
  const { kofiUrl, githubSponsorsUrl } = getSiteConfig();
  const supportHref = buildTrackedSupportUrl(kofiUrl, {
    source: "poketeamforge",
    medium: "homepage",
    campaign: "support_card",
  });
  const hasSupportLink = Boolean(supportHref || githubSponsorsUrl);

  if (!hasSupportLink) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-primary/10 to-background/45 p-6 shadow-xl shadow-black/10 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_16%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_10%_84%,rgba(59,130,246,0.1),transparent_36%)]"
      />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Optional Support
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Keep PokemonTeamForge free and online
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              PokemonTeamForge is a free fan-made team builder. Optional tips help cover recurring
              costs and build a maintenance fund for future updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUPPORT_COST_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                {label}
              </span>
            ))}
            <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
              {SUPPORT_MONTHLY_TARGET_LABEL}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground/85">
            No paywall and no premium unlocks. Fan-made project, not affiliated with Nintendo,
            Game Freak, Creatures, or The Pokemon Company.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {supportHref ? (
            <Button asChild size="lg" className="h-11 rounded-xl px-6">
              <Link href={supportHref} target="_blank" rel="noopener noreferrer">
                <HeartHandshake className="size-4" aria-hidden />
                Support on Ko-fi
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="lg" className="h-11 rounded-xl border-border/70 px-6">
            <Link href="/support">
              Why support?
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
