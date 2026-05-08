import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/utils";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  status: "completed" | "partial" | "missing";
};

const SINGLES_CHECKLIST: ChecklistItem[] = [
  {
    id: "entry_hazard",
    label: "Entry Hazard",
    description: "Stealth Rock or Spikes",
    status: "missing",
  },
  {
    id: "hazard_removal",
    label: "Hazard Removal",
    description: "Rapid Spin or Defog",
    status: "missing",
  },
  {
    id: "recovery",
    label: "Recovery",
    description: "Reliable healing move or item",
    status: "missing",
  },
  {
    id: "pivot",
    label: "Pivot",
    description: "U-turn, Volt Switch, or Teleport",
    status: "missing",
  },
  {
    id: "setup_sweeper",
    label: "Setup Sweeper",
    description: "Swords Dance, Calm Mind, etc.",
    status: "missing",
  },
  {
    id: "speed_control",
    label: "Speed Control",
    description: "Tailwind or Trick Room",
    status: "missing",
  },
];

type ItemProps = { item: ChecklistItem };

function ChecklistRow({ item }: ItemProps) {
  const icon =
    item.status === "completed" ? (
      <CheckCircle2 className="size-4 text-green-400" aria-hidden />
    ) : item.status === "partial" ? (
      <CheckCircle2 className="size-4 text-yellow-400" aria-hidden />
    ) : (
      <Circle className="size-4 text-muted-foreground/30" aria-hidden />
    );

  return (
    <div className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            item.status === "completed" ? "text-foreground" : "text-foreground/70",
          )}
        >
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground/60">{item.description}</p>
      </div>
    </div>
  );
}

export function ChecklistPanel() {
  const completed = SINGLES_CHECKLIST.filter((i) => i.status === "completed").length;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Team Checklist</h2>
        <span className="text-xs text-muted-foreground">
          {completed} / {SINGLES_CHECKLIST.length}
        </span>
      </div>

      <div className="-mx-1 flex flex-col">
        {SINGLES_CHECKLIST.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/50">
        Items update as you build your team
      </p>
    </section>
  );
}
