import type {
  ChampionsPreset,
  ChampionsPresetArchetype,
  ChampionsPresetTheme,
} from "@/data/champions-presets";

export type ThemeFilter = "all" | ChampionsPresetTheme;
export type ArchetypeFilter = "all" | ChampionsPresetArchetype;

export const THEME_FILTER_OPTIONS: Array<{ value: ThemeFilter; label: string }> = [
  { value: "all", label: "All themes" },
  { value: "rain", label: "Rain" },
  { value: "sun", label: "Sun" },
  { value: "sand", label: "Sand" },
  { value: "snow", label: "Snow" },
  { value: "trick-room", label: "Trick Room" },
];

export const ARCHETYPE_FILTER_OPTIONS: Array<{ value: ArchetypeFilter; label: string }> = [
  { value: "all", label: "All archetypes" },
  { value: "balance", label: "Balance" },
  { value: "hyper-offense", label: "Hyper Offense" },
  { value: "trick-room", label: "Trick Room" },
  { value: "stall", label: "Stall" },
  { value: "champions-signature", label: "Champions Signature" },
  { value: "flavor", label: "Flavor / Fun" },
];

export function presetMatchesTheme(preset: ChampionsPreset, filter: ThemeFilter): boolean {
  if (filter === "all") {
    return true;
  }
  return preset.themeTags.includes(filter);
}

export function presetMatchesArchetype(preset: ChampionsPreset, filter: ArchetypeFilter): boolean {
  if (filter === "all") {
    return true;
  }
  return preset.archetypeTags.includes(filter);
}

export function archetypeLabel(archetype: ChampionsPresetArchetype): string {
  return ARCHETYPE_FILTER_OPTIONS.find((option) => option.value === archetype)?.label ?? archetype;
}
