import type {
  TeamCardExportPreset,
  TeamCardExportPresetId,
  TeamCardLayoutPreset,
  TeamCardLayoutPresetId,
  TeamCardPresetId,
  TeamCardStylePreset,
} from "@/types/team-card";

export const DEFAULT_TEAM_CARD_STYLE_PRESET_ID: TeamCardPresetId = "neon-city";
export const DEFAULT_TEAM_CARD_LAYOUT_PRESET_ID: TeamCardLayoutPresetId = "trainer-showcase";
export const DEFAULT_TEAM_CARD_EXPORT_PRESET_ID: TeamCardExportPresetId = "social-wide";

export const TEAM_CARD_STYLE_PRESETS: TeamCardStylePreset[] = [
  {
    id: "neon-city",
    label: "Neon City",
    description: "Bright social card with a polished stadium glow.",
    backgroundSlug: "midnight-grid",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "medium",
      spriteGlow: "soft",
      labelStyle: "badge",
      borderStyle: "neon",
      pokemonFrameStyle: "frosted-disk",
      trainerTreatment: "anchored-right",
      headerTreatment: "compact-panel",
    },
  },
  {
    id: "storm-battle",
    label: "Storm Battle",
    description: "High contrast, dramatic, and rain-team friendly.",
    backgroundSlug: "obsidian-wave",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "high",
      spriteGlow: "strong",
      labelStyle: "pill",
      borderStyle: "subtle",
      pokemonFrameStyle: "frosted-disk",
      trainerTreatment: "spotlight",
      headerTreatment: "glass-banner",
    },
  },
  {
    id: "cosmic-arena",
    label: "Cosmic Arena",
    description: "Purple cosmic tone with strong sprite presence.",
    backgroundSlug: "cosmic-void",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "medium",
      spriteGlow: "strong",
      labelStyle: "badge",
      borderStyle: "neon",
      pokemonFrameStyle: "type-ring",
      trainerTreatment: "spotlight",
      headerTreatment: "compact-panel",
    },
  },
  {
    id: "classic-league",
    label: "Classic League",
    description: "Readable badge labels and balanced contrast.",
    backgroundSlug: "storm-shift",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "medium",
      spriteGlow: "soft",
      labelStyle: "badge",
      borderStyle: "subtle",
      pokemonFrameStyle: "frosted-disk",
      trainerTreatment: "anchored-right",
      headerTreatment: "glass-banner",
    },
  },
  {
    id: "volcanic-core",
    label: "Volcanic Core",
    description: "Warm, intense, and battle-card focused.",
    backgroundSlug: "inferno-core",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "high",
      spriteGlow: "soft",
      labelStyle: "pill",
      borderStyle: "subtle",
      pokemonFrameStyle: "glass-tile",
      trainerTreatment: "hero",
      headerTreatment: "compact-panel",
    },
  },
  {
    id: "minimal-focus",
    label: "Minimal Focus",
    description: "Lower effects, cleaner labels, and less frame glow.",
    backgroundSlug: "glacier-depth",
    layoutPresetId: "trainer-showcase",
    exportPresetId: "social-wide",
    visualStyle: {
      overlayIntensity: "low",
      spriteGlow: "off",
      labelStyle: "minimal",
      borderStyle: "none",
      pokemonFrameStyle: "none",
      trainerTreatment: "anchored-right",
      headerTreatment: "minimal",
    },
  },
];

export const TEAM_CARD_LAYOUT_PRESETS: TeamCardLayoutPreset[] = [
  {
    id: "trainer-showcase",
    label: "Trainer Showcase",
    description: "Balanced team display with a strong trainer column on the right.",
    composition: {
      aspectRatio: "5 / 3",
      trainerAnchor: "right",
      pokemonArrangement: "current",
      showHeaderPanel: true,
      showFooterBrand: true,
    },
  },
  {
    id: "team-grid",
    label: "Team Grid",
    description: "Clean 2x3 team formation with equal emphasis on all six Pokémon.",
    composition: {
      aspectRatio: "5 / 3",
      trainerAnchor: "right",
      pokemonArrangement: "grid-2x3",
      showHeaderPanel: true,
      showFooterBrand: true,
    },
  },
  {
    id: "battle-lineup",
    label: "Battle Lineup",
    description: "Diagonal battle formation with stronger motion and depth.",
    composition: {
      aspectRatio: "5 / 3",
      trainerAnchor: "right",
      pokemonArrangement: "diagonal-lines",
      showHeaderPanel: true,
      showFooterBrand: true,
    },
  },
  {
    id: "poster",
    label: "Poster",
    description: "Hero layout that gives the first slot extra ace Pokémon emphasis.",
    composition: {
      aspectRatio: "5 / 3",
      trainerAnchor: "right",
      pokemonArrangement: "ace-showcase",
      showHeaderPanel: true,
      showFooterBrand: true,
    },
  },
];

export const TEAM_CARD_EXPORT_PRESETS: TeamCardExportPreset[] = [
  {
    id: "social-wide",
    label: "Social Wide",
    description: "1600 x 960 PNG for quick sharing.",
    width: 1600,
    height: 960,
    pixelRatio: 1,
    format: "png",
  },
  {
    id: "high-res",
    label: "High Res",
    description: "2400 x 1440 PNG for crisp social posts.",
    width: 2400,
    height: 1440,
    pixelRatio: 1,
    format: "png",
  },
  {
    id: "ultra",
    label: "Ultra",
    description: "3200 x 1920 PNG for maximum export quality.",
    width: 3200,
    height: 1920,
    pixelRatio: 1,
    format: "png",
  },
];

export function getTeamCardStylePreset(id: string | undefined): TeamCardStylePreset {
  return TEAM_CARD_STYLE_PRESETS.find((preset) => preset.id === id) ?? TEAM_CARD_STYLE_PRESETS[0];
}

export function getTeamCardLayoutPreset(id: string | undefined): TeamCardLayoutPreset {
  return TEAM_CARD_LAYOUT_PRESETS.find((preset) => preset.id === id) ?? TEAM_CARD_LAYOUT_PRESETS[0];
}

export function getTeamCardExportPreset(id: string | undefined): TeamCardExportPreset {
  return TEAM_CARD_EXPORT_PRESETS.find((preset) => preset.id === id) ?? TEAM_CARD_EXPORT_PRESETS[0];
}
