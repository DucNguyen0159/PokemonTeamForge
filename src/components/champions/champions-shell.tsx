import type { ReactNode } from "react";

import { PageIntro, PageIntroChip } from "@/components/layout/page-intro";
import { CHAMPIONS_RULESET_ID } from "@/data/champions";

type ChampionsShellVariant = "full" | "compact" | "tool";

type ChampionsShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  chips?: ReactNode;
  variant?: ChampionsShellVariant;
  children: ReactNode;
};

export function ChampionsShell({
  eyebrow,
  title,
  description,
  chips,
  variant = "full",
  children,
}: ChampionsShellProps) {
  if (variant === "compact" || variant === "tool") {
    return (
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            {variant === "compact" && description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        description={description ?? ""}
        chips={
          <>
            <PageIntroChip>Mega only</PageIntroChip>
            <PageIntroChip>Singles 3v3</PageIntroChip>
            <PageIntroChip>Doubles 4v4</PageIntroChip>
            <PageIntroChip>{CHAMPIONS_RULESET_ID}</PageIntroChip>
            {chips}
          </>
        }
      />
      {children}
    </div>
  );
}
