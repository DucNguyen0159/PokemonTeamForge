import teamCardMastersManifest from "./team-card-masters-manifest.json";

export type TeamCardBackgroundCategory = {
  slug: string;
  label: string;
};

export type TeamCardBackgroundAsset = {
  slug: string;
  name: string;
  category: TeamCardBackgroundCategory["slug"];
  css: string;
  imagePath?: string;
  /** Helps distinguish raster vs vector variants in the picker and search. */
  imageFormat?: "png" | "svg";
  source: string;
  tags: string[];
};

export type TeamCardTrainerCharacter = {
  slug: string;
  name: string;
  group: string;
  searchTerms: string[];
};

export type TeamCardTrainerVariant = {
  slug: string;
  characterSlug: TeamCardTrainerCharacter["slug"];
  name: string;
  imagePath: string;
  source: string;
};

export type TeamCardIconOption = {
  slug: string;
  label: string;
  symbol: string;
  imagePath?: string;
};

export type TeamCardSlotBadgeOption = {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const TEAM_CARD_BACKGROUND_CATEGORIES: TeamCardBackgroundCategory[] = [
  { slug: "basic", label: "Basic" },
  { slug: "illustration", label: "Illustration" },
];

export function teamCardBackgroundCategoryLabel(slug: string): string {
  return TEAM_CARD_BACKGROUND_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const TEAM_CARD_BACKGROUND_ASSETS: TeamCardBackgroundAsset[] = [
  {
    slug: "midnight-grid",
    name: "Night City Stadium",
    category: "illustration",
    css: "radial-gradient(ellipse at 20% 30%, #1e3a5f 0%, #0a0f1e 55%, #1a0a2e 100%)",
    imagePath: "/team-card/backgrounds/night-city-stadium-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["night", "city", "stadium", "png", "raster"],
  },
  {
    slug: "midnight-grid-svg",
    name: "Night City Stadium",
    category: "basic",
    css: "radial-gradient(ellipse at 20% 30%, #1e3a5f 0%, #0a0f1e 55%, #1a0a2e 100%)",
    imagePath: "/team-card/backgrounds/night-city-stadium.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["night", "city", "stadium", "svg", "vector"],
  },
  {
    slug: "obsidian-wave",
    name: "Storm Battlefield",
    category: "illustration",
    css: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    imagePath: "/team-card/backgrounds/storm-battlefield.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["storm", "battlefield", "rain", "png", "raster"],
  },
  {
    slug: "obsidian-wave-svg",
    name: "Storm Battlefield",
    category: "basic",
    css: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    imagePath: "/team-card/backgrounds/storm-battlefield.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["storm", "battlefield", "rain", "svg", "vector"],
  },
  {
    slug: "cosmic-void",
    name: "Cosmic Arena",
    category: "illustration",
    css: "radial-gradient(ellipse at 50% 0%, #3b0764 0%, #0f0a1e 50%, #1a0535 100%)",
    imagePath: "/team-card/backgrounds/cosmic-arena-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["space", "cosmic", "purple", "png", "raster"],
  },
  {
    slug: "cosmic-void-svg",
    name: "Cosmic Arena",
    category: "basic",
    css: "radial-gradient(ellipse at 50% 0%, #3b0764 0%, #0f0a1e 50%, #1a0535 100%)",
    imagePath: "/team-card/backgrounds/cosmic-arena.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["space", "cosmic", "purple", "svg", "vector"],
  },
  {
    slug: "storm-shift",
    name: "Ancient Temple",
    category: "illustration",
    css: "radial-gradient(ellipse at 70% 30%, #1e293b 0%, #0f172a 55%, #0c1222 100%)",
    imagePath: "/team-card/backgrounds/ancient-temple-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["temple", "ancient", "gold", "png", "raster"],
  },
  {
    slug: "storm-shift-svg",
    name: "Ancient Temple",
    category: "basic",
    css: "radial-gradient(ellipse at 70% 30%, #1e293b 0%, #0f172a 55%, #0c1222 100%)",
    imagePath: "/team-card/backgrounds/ancient-temple.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["temple", "ancient", "gold", "svg", "vector"],
  },
  {
    slug: "inferno-core",
    name: "Volcanic Cavern",
    category: "illustration",
    css: "radial-gradient(ellipse at 80% 20%, #7c2d12 0%, #1c0a02 55%, #450a0a 100%)",
    imagePath: "/team-card/backgrounds/volcanic-cavern-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["fire", "lava", "cavern", "png", "raster"],
  },
  {
    slug: "inferno-core-svg",
    name: "Volcanic Cavern",
    category: "basic",
    css: "radial-gradient(ellipse at 80% 20%, #7c2d12 0%, #1c0a02 55%, #450a0a 100%)",
    imagePath: "/team-card/backgrounds/volcanic-cavern.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["fire", "lava", "cavern", "svg", "vector"],
  },
  {
    slug: "glacier-depth",
    name: "Icy Mountain",
    category: "illustration",
    css: "radial-gradient(ellipse at 30% 70%, #164e63 0%, #0c1825 55%, #0f2a45 100%)",
    imagePath: "/team-card/backgrounds/icy-mountain-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["ice", "snow", "mountain", "png", "raster"],
  },
  {
    slug: "glacier-depth-svg",
    name: "Icy Mountain",
    category: "basic",
    css: "radial-gradient(ellipse at 30% 70%, #164e63 0%, #0c1825 55%, #0f2a45 100%)",
    imagePath: "/team-card/backgrounds/icy-mountain.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["ice", "snow", "mountain", "svg", "vector"],
  },
  {
    slug: "forest-echo",
    name: "Forest Echo",
    category: "illustration",
    css: "radial-gradient(ellipse at 60% 40%, #14532d 0%, #052e16 55%, #0a1f0f 100%)",
    imagePath: "/team-card/backgrounds/forest-ruins-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["grass", "green", "png", "raster"],
  },
  {
    slug: "forest-echo-svg",
    name: "Forest Echo",
    category: "basic",
    css: "radial-gradient(ellipse at 60% 40%, #14532d 0%, #052e16 55%, #0a1f0f 100%)",
    imagePath: "/team-card/backgrounds/forest-ruins.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["grass", "green", "svg", "vector"],
  },
  {
    slug: "venom-core",
    name: "Crystal Cave",
    category: "illustration",
    css: "radial-gradient(ellipse at 40% 60%, #2e1065 0%, #0c0218 55%, #1a0a3d 100%)",
    imagePath: "/team-card/backgrounds/crystal-cave-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["crystal", "cave", "purple", "png", "raster"],
  },
  {
    slug: "venom-core-svg",
    name: "Crystal Cave",
    category: "basic",
    css: "radial-gradient(ellipse at 40% 60%, #2e1065 0%, #0c0218 55%, #1a0a3d 100%)",
    imagePath: "/team-card/backgrounds/crystal-cave.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["crystal", "cave", "purple", "svg", "vector"],
  },
  {
    slug: "champion-gold",
    name: "Flower Meadow",
    category: "illustration",
    css: "linear-gradient(145deg, #1b1036 0%, #6d28d9 35%, #f59e0b 70%, #2a1a56 100%)",
    imagePath: "/team-card/backgrounds/flower-meadow-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["flower", "meadow", "soft", "png", "raster"],
  },
  {
    slug: "champion-gold-svg",
    name: "Flower Meadow",
    category: "basic",
    css: "linear-gradient(145deg, #1b1036 0%, #6d28d9 35%, #f59e0b 70%, #2a1a56 100%)",
    imagePath: "/team-card/backgrounds/flower-meadow.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["flower", "meadow", "soft", "svg", "vector"],
  },
  {
    slug: "arena-blue",
    name: "Coastal Arena",
    category: "illustration",
    css: "linear-gradient(135deg, #0b1024 0%, #1d4ed8 45%, #2563eb 70%, #0b1024 100%)",
    imagePath: "/team-card/backgrounds/coastal-arena-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["arena", "tournament", "png", "raster"],
  },
  {
    slug: "arena-blue-svg",
    name: "Coastal Arena",
    category: "basic",
    css: "linear-gradient(135deg, #0b1024 0%, #1d4ed8 45%, #2563eb 70%, #0b1024 100%)",
    imagePath: "/team-card/backgrounds/coastal-arena.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["arena", "tournament", "svg", "vector"],
  },
  {
    slug: "champion-stage",
    name: "Champion Stage",
    category: "illustration",
    css: "linear-gradient(145deg, #1f1528 0%, #6d28d9 40%, #fbbf24 72%, #2a1a44 100%)",
    imagePath: "/team-card/backgrounds/champion-stage-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["champion", "finals", "spotlight", "png", "raster"],
  },
  {
    slug: "champion-stage-svg",
    name: "Champion Stage",
    category: "basic",
    css: "linear-gradient(145deg, #1f1528 0%, #6d28d9 40%, #fbbf24 72%, #2a1a44 100%)",
    imagePath: "/team-card/backgrounds/champion-stage.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["champion", "finals", "spotlight", "svg", "vector"],
  },
  {
    slug: "rocket-raid",
    name: "Rocket Raid",
    category: "illustration",
    css: "linear-gradient(135deg, #2a0a12 0%, #7f1d1d 38%, #0a0a12 100%)",
    imagePath: "/team-card/backgrounds/rocket-raid-2.png",
    imageFormat: "png",
    source: "PokemonTeamForge",
    tags: ["rocket", "city", "night", "png", "raster"],
  },
  {
    slug: "rocket-raid-svg",
    name: "Rocket Raid",
    category: "basic",
    css: "linear-gradient(135deg, #2a0a12 0%, #7f1d1d 38%, #0a0a12 100%)",
    imagePath: "/team-card/backgrounds/rocket-raid.svg",
    imageFormat: "svg",
    source: "PokemonTeamForge",
    tags: ["rocket", "city", "night", "svg", "vector"],
  },
];

export const TEAM_CARD_TRAINER_CHARACTERS: TeamCardTrainerCharacter[] =
  teamCardMastersManifest.characters;
export const TEAM_CARD_TRAINER_VARIANTS: TeamCardTrainerVariant[] =
  teamCardMastersManifest.variants;

export const TEAM_CARD_DETAIL_ICON_OPTIONS: TeamCardIconOption[] = [
  {
    slug: "instagram",
    label: "Instagram",
    symbol: "IG",
    imagePath: "/team-card/icons/instagram.svg",
  },
  {
    slug: "twitch",
    label: "Twitch",
    symbol: "TW",
    imagePath: "/team-card/icons/twitch.svg",
  },
  {
    slug: "youtube",
    label: "YouTube",
    symbol: "YT",
    imagePath: "/team-card/icons/youtube.svg",
  },
  {
    slug: "discord",
    label: "Discord",
    symbol: "DS",
    imagePath: "/team-card/icons/discord.svg",
  },
  {
    slug: "x",
    label: "X",
    symbol: "X",
    imagePath: "/team-card/icons/x.svg",
  },
  {
    slug: "link",
    label: "Link",
    symbol: "URL",
    imagePath: "/team-card/icons/link.svg",
  },
];

export const TEAM_CARD_SLOT_BADGE_OPTIONS: TeamCardSlotBadgeOption[] = [
  { slug: "none", label: "None", shortLabel: "", description: "No extra slot label." },
  { slug: "ace", label: "Ace", shortLabel: "Ace", description: "Primary star or win condition." },
  { slug: "lead", label: "Lead", shortLabel: "Lead", description: "Typical opening Pokémon." },
  { slug: "mvp", label: "MVP", shortLabel: "MVP", description: "Favorite or most important member." },
  { slug: "sweeper", label: "Sweeper", shortLabel: "Sweep", description: "Late-game cleaner or setup threat." },
  { slug: "support", label: "Support", shortLabel: "Support", description: "Utility, redirection, healing, or setup support." },
  { slug: "wall", label: "Wall", shortLabel: "Wall", description: "Defensive anchor." },
  { slug: "pivot", label: "Pivot", shortLabel: "Pivot", description: "Momentum and switching glue." },
  { slug: "mega", label: "Mega", shortLabel: "Mega", description: "Mega form callout." },
  { slug: "dynamax", label: "Dynamax", shortLabel: "D-Max", description: "Dynamax/Gigantamax callout." },
  { slug: "legend", label: "Legend", shortLabel: "Legend", description: "Legendary or signature slot." },
];
