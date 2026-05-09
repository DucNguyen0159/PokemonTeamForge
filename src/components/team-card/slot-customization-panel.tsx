"use client";

import type { TeamCardFormOption, TeamCardIconOption } from "@/data/team-card-assets";
import type { TeamCardSlotCustomization } from "@/types/team-card";
import type { TeamPokemon } from "@/types/team";

type SlotCustomizationPanelProps = {
  teamSlots: TeamPokemon[];
  slotCustomizations: TeamCardSlotCustomization[];
  formOptions: TeamCardFormOption[];
  iconOptions: TeamCardIconOption[];
  onSlotCustomizationChange: (
    slot: number,
    patch: Partial<Pick<TeamCardSlotCustomization, "formSlug" | "iconSlug">>,
  ) => void;
};

export function SlotCustomizationPanel({
  teamSlots,
  slotCustomizations,
  formOptions,
  iconOptions,
  onSlotCustomizationChange,
}: SlotCustomizationPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pokemon Slot Customization
      </p>
      <div className="space-y-2">
        {teamSlots.map((slot) => {
          const customization = slotCustomizations.find((entry) => entry.slot === slot.slot);
          const isFilled = Boolean(slot.pokemon);

          return (
            <div
              key={slot.slot}
              className="rounded-lg border border-border/60 bg-card/50 px-3 py-2"
            >
              <p className="mb-2 text-xs font-medium text-foreground">
                {slot.slot}. {slot.pokemon?.name ?? "Empty slot"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] text-muted-foreground">Form</label>
                  <select
                    disabled={!isFilled}
                    value={customization?.formSlug ?? "none"}
                    onChange={(event) =>
                      onSlotCustomizationChange(slot.slot, { formSlug: event.target.value })
                    }
                    className="h-8 w-full rounded-md border border-border/60 bg-background/50 px-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {formOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-muted-foreground">Icon</label>
                  <select
                    disabled={!isFilled}
                    value={customization?.iconSlug ?? "none"}
                    onChange={(event) =>
                      onSlotCustomizationChange(slot.slot, { iconSlug: event.target.value })
                    }
                    className="h-8 w-full rounded-md border border-border/60 bg-background/50 px-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
