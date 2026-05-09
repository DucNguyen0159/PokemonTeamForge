export type TeamCardBackgroundCategory = {
  slug: string;
  label: string;
};

export type TeamCardBackgroundAsset = {
  slug: string;
  name: string;
  category: TeamCardBackgroundCategory["slug"];
  css: string;
  source: string;
  tags: string[];
};

export type TeamCardTrainerCharacter = {
  slug: string;
  name: string;
  group: "protagonists" | "rivals";
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

export type TeamCardFormOption = {
  slug: string;
  label: string;
  symbol: string;
};

export const TEAM_CARD_BACKGROUND_CATEGORIES: TeamCardBackgroundCategory[] = [
  { slug: "dark", label: "Dark" },
  { slug: "elemental", label: "Elemental" },
  { slug: "champion", label: "Champion" },
];

export const TEAM_CARD_BACKGROUND_ASSETS: TeamCardBackgroundAsset[] = [
  {
    slug: "midnight-grid",
    name: "Midnight Grid",
    category: "dark",
    css: "radial-gradient(ellipse at 20% 30%, #1e3a5f 0%, #0a0f1e 55%, #1a0a2e 100%)",
    source: "PokemonTeamForge",
    tags: ["night", "grid"],
  },
  {
    slug: "obsidian-wave",
    name: "Obsidian Wave",
    category: "dark",
    css: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    source: "PokemonTeamForge",
    tags: ["dark", "clean"],
  },
  {
    slug: "cosmic-void",
    name: "Cosmic Void",
    category: "dark",
    css: "radial-gradient(ellipse at 50% 0%, #3b0764 0%, #0f0a1e 50%, #1a0535 100%)",
    source: "PokemonTeamForge",
    tags: ["space", "purple"],
  },
  {
    slug: "storm-shift",
    name: "Storm Shift",
    category: "dark",
    css: "radial-gradient(ellipse at 70% 30%, #1e293b 0%, #0f172a 55%, #0c1222 100%)",
    source: "PokemonTeamForge",
    tags: ["storm", "slate"],
  },
  {
    slug: "inferno-core",
    name: "Inferno Core",
    category: "elemental",
    css: "radial-gradient(ellipse at 80% 20%, #7c2d12 0%, #1c0a02 55%, #450a0a 100%)",
    source: "PokemonTeamForge",
    tags: ["fire", "orange"],
  },
  {
    slug: "glacier-depth",
    name: "Glacier Depth",
    category: "elemental",
    css: "radial-gradient(ellipse at 30% 70%, #164e63 0%, #0c1825 55%, #0f2a45 100%)",
    source: "PokemonTeamForge",
    tags: ["ice", "water"],
  },
  {
    slug: "forest-echo",
    name: "Forest Echo",
    category: "elemental",
    css: "radial-gradient(ellipse at 60% 40%, #14532d 0%, #052e16 55%, #0a1f0f 100%)",
    source: "PokemonTeamForge",
    tags: ["grass", "green"],
  },
  {
    slug: "venom-core",
    name: "Venom Core",
    category: "elemental",
    css: "radial-gradient(ellipse at 40% 60%, #2e1065 0%, #0c0218 55%, #1a0a3d 100%)",
    source: "PokemonTeamForge",
    tags: ["poison", "purple"],
  },
  {
    slug: "champion-gold",
    name: "Champion Gold",
    category: "champion",
    css: "linear-gradient(145deg, #1b1036 0%, #6d28d9 35%, #f59e0b 70%, #2a1a56 100%)",
    source: "PokemonTeamForge",
    tags: ["gold", "showcase"],
  },
  {
    slug: "arena-blue",
    name: "Arena Blue",
    category: "champion",
    css: "linear-gradient(135deg, #0b1024 0%, #1d4ed8 45%, #2563eb 70%, #0b1024 100%)",
    source: "PokemonTeamForge",
    tags: ["arena", "tournament"],
  },
];

export const TEAM_CARD_TRAINER_CHARACTERS: TeamCardTrainerCharacter[] = [
  { slug: "rei", name: "Rei", group: "protagonists", searchTerms: ["hisui", "academy"] },
  { slug: "dawn", name: "Dawn", group: "protagonists", searchTerms: ["sinnoh", "coordinator"] },
  { slug: "calem", name: "Calem", group: "protagonists", searchTerms: ["kalos"] },
  { slug: "serena", name: "Serena", group: "protagonists", searchTerms: ["kalos"] },
  { slug: "nemona", name: "Nemona", group: "rivals", searchTerms: ["paldea"] },
  { slug: "silver", name: "Silver", group: "rivals", searchTerms: ["johto"] },
];

export const TEAM_CARD_TRAINER_VARIANTS: TeamCardTrainerVariant[] = [
  {
    slug: "rei-academy",
    characterSlug: "rei",
    name: "Rei Academy",
    imagePath: "/trainers/trainer-01.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "rei-academy-ex",
    characterSlug: "rei",
    name: "Rei Academy EX",
    imagePath: "/trainers/trainer-02.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "dawn-contest",
    characterSlug: "dawn",
    name: "Dawn Contest",
    imagePath: "/trainers/trainer-03.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "dawn-travel",
    characterSlug: "dawn",
    name: "Dawn Travel",
    imagePath: "/trainers/trainer-04.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "calem-battle",
    characterSlug: "calem",
    name: "Calem Battle",
    imagePath: "/trainers/trainer-02.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "calem-ace",
    characterSlug: "calem",
    name: "Calem Ace",
    imagePath: "/trainers/trainer-01.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "serena-ace",
    characterSlug: "serena",
    name: "Serena Ace",
    imagePath: "/trainers/trainer-03.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "serena-master",
    characterSlug: "serena",
    name: "Serena Master",
    imagePath: "/trainers/trainer-04.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "nemona-champion",
    characterSlug: "nemona",
    name: "Nemona Champion",
    imagePath: "/trainers/trainer-04.svg",
    source: "PokemonTeamForge",
  },
  {
    slug: "silver-shadow",
    characterSlug: "silver",
    name: "Silver Shadow",
    imagePath: "/trainers/trainer-01.svg",
    source: "PokemonTeamForge",
  },
];

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

export const TEAM_CARD_SLOT_FORM_OPTIONS: TeamCardFormOption[] = [
  { slug: "none", label: "None", symbol: "—" },
  { slug: "alpha", label: "Alpha", symbol: "A" },
  { slug: "mega", label: "Mega", symbol: "M" },
  { slug: "gmax", label: "Dynamax", symbol: "G" },
  { slug: "shadow", label: "Shadow", symbol: "S" },
  { slug: "purified", label: "Purified", symbol: "P" },
];

export const TEAM_CARD_SLOT_ICON_OPTIONS: TeamCardIconOption[] = [
  { slug: "none", label: "None", symbol: "—" },
  { slug: "star", label: "Star", symbol: "★" },
  { slug: "crown", label: "Crown", symbol: "♛" },
  { slug: "fire", label: "Fire", symbol: "🔥" },
  { slug: "ice", label: "Ice", symbol: "❄" },
  { slug: "bolt", label: "Bolt", symbol: "⚡" },
  { slug: "leaf", label: "Leaf", symbol: "🍃" },
];
