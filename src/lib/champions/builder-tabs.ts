export type BuilderTab = "roster" | "plans" | "settings";

export const BUILDER_TABS: Array<{ id: BuilderTab; label: string }> = [
  { id: "roster", label: "Roster" },
  { id: "plans", label: "Battle plans" },
  { id: "settings", label: "Team settings" },
];

export function parseBuilderTab(value: string | null): BuilderTab {
  if (value === "plans" || value === "settings") {
    return value;
  }
  return "roster";
}

export function builderTabQueryValue(tab: BuilderTab): string | null {
  return tab === "roster" ? null : tab;
}
