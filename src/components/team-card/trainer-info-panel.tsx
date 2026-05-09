"use client";

import type { TeamCardIconOption } from "@/data/team-card-assets";
import type { TeamCardDetailRow } from "@/types/team-card";

type TrainerInfoPanelProps = {
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  detailIconOptions: TeamCardIconOption[];
  onTrainerNameChange: (value: string) => void;
  onDetailRowChange: (id: TeamCardDetailRow["id"], patch: Partial<TeamCardDetailRow>) => void;
};

export function TrainerInfoPanel({
  trainerName,
  detailRows,
  detailIconOptions,
  onTrainerNameChange,
  onDetailRowChange,
}: TrainerInfoPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trainer Information
      </p>

      <div className="space-y-1.5">
        <label htmlFor="trainer-name" className="text-xs font-medium text-muted-foreground">
          Trainer Name
        </label>
        <input
          id="trainer-name"
          value={trainerName}
          onChange={(event) => onTrainerNameChange(event.target.value)}
          placeholder="Enter trainer name"
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Additional Details</p>
        {detailRows.map((row, index) => (
          <div key={row.id} className="grid gap-2 sm:grid-cols-[130px,1fr]">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Icon {index + 1}</label>
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
              <label className="text-[11px] text-muted-foreground">Text {index + 1}</label>
              <input
                value={row.text}
                onChange={(event) => onDetailRowChange(row.id, { text: event.target.value })}
                placeholder="Enter detail text"
                className="h-9 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
