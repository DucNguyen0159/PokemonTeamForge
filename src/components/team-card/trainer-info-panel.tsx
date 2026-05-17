"use client";

import type { TeamCardIconOption } from "@/data/team-card-assets";
import {
  type TeamCardDetailRow,
  TEAM_CARD_TITLE_MAX_LENGTH,
  TEAM_CARD_TRAINER_NAME_MAX_LENGTH,
} from "@/types/team-card";

type TrainerInfoPanelProps = {
  cardTitle: string;
  isCardTitleCustom: boolean;
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  detailIconOptions: TeamCardIconOption[];
  onCardTitleChange: (value: string) => void;
  onTrainerNameChange: (value: string) => void;
  onDetailRowChange: (id: TeamCardDetailRow["id"], patch: Partial<TeamCardDetailRow>) => void;
};

export function TrainerInfoPanel({
  cardTitle,
  isCardTitleCustom,
  trainerName,
  detailRows,
  detailIconOptions,
  onCardTitleChange,
  onTrainerNameChange,
  onDetailRowChange,
}: TrainerInfoPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trainer Information
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="card-title" className="text-xs font-medium text-muted-foreground">
            Card Title
            <span className="ml-1 font-normal normal-case text-muted-foreground/80">
              ({TEAM_CARD_TITLE_MAX_LENGTH} max)
            </span>
          </label>
          <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {isCardTitleCustom ? "Custom" : "From Builder"}
          </span>
        </div>
        <input
          id="card-title"
          value={cardTitle}
          onChange={(event) => onCardTitleChange(event.target.value)}
          maxLength={TEAM_CARD_TITLE_MAX_LENGTH}
          placeholder="Team card title"
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground/75">
          Defaults to your Builder team name and controls the title on exports only. Editing it
          will not rename the Builder team.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="trainer-name" className="text-xs font-medium text-muted-foreground">
          Trainer Name
          <span className="ml-1 font-normal normal-case text-muted-foreground/80">
            ({TEAM_CARD_TRAINER_NAME_MAX_LENGTH} max)
          </span>
        </label>
        <input
          id="trainer-name"
          value={trainerName}
          onChange={(event) => onTrainerNameChange(event.target.value)}
          maxLength={TEAM_CARD_TRAINER_NAME_MAX_LENGTH}
          placeholder="Enter trainer name"
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground/75">
          Short headline shown at the top of the card.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Subtitle (icon + line on card)</p>
        {(() => {
          const row = detailRows[0] ?? { id: "detail-1" as const, iconSlug: "instagram", text: "" };
          return (
            <div className="grid gap-2 sm:grid-cols-[130px,1fr]">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Icon</label>
                <select
                  value={row.iconSlug}
                  onChange={(event) => onDetailRowChange(row.id, { iconSlug: event.target.value })}
                  className="h-9 w-full rounded-lg border border-border/60 bg-background/50 px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {detailIconOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Text</label>
                <input
                  value={row.text}
                  onChange={(event) => onDetailRowChange(row.id, { text: event.target.value })}
                  placeholder="e.g. @trainer or Pokemon Trainer"
                  className="h-9 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
