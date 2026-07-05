import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ChampionsEmptyState({
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onPrimaryClick,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 px-6 py-10 text-center">
      {Icon ? (
        <Icon className="mx-auto size-8 text-muted-foreground/60" aria-hidden />
      ) : null}
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onPrimaryClick ? (
          <Button size="sm" className="rounded-xl" onClick={onPrimaryClick}>
            {primaryLabel}
          </Button>
        ) : primaryHref ? (
          <Button asChild size="sm" className="rounded-xl">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        ) : null}
        {secondaryHref && secondaryLabel ? (
          <Button asChild size="sm" variant="secondary" className="rounded-xl">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
