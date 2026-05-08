export type BackgroundPreset = {
  slug: string;
  name: string;
  category: string;
  css: string;
};

export type TrainerPreset = {
  slug: string;
  name: string;
  imagePath: string;
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    slug: "midnight",
    name: "Midnight",
    category: "dark",
    css: "radial-gradient(ellipse at 20% 30%, #1e3a5f 0%, #0a0f1e 55%, #1a0a2e 100%)",
  },
  {
    slug: "obsidian",
    name: "Obsidian",
    category: "dark",
    css: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  },
  {
    slug: "inferno",
    name: "Inferno",
    category: "elemental",
    css: "radial-gradient(ellipse at 80% 20%, #7c2d12 0%, #1c0a02 55%, #450a0a 100%)",
  },
  {
    slug: "volcanic",
    name: "Volcanic",
    category: "elemental",
    css: "linear-gradient(160deg, #1c0503 0%, #4a0e04 30%, #7f1d1d 60%, #1c0503 100%)",
  },
  {
    slug: "glacier",
    name: "Glacier",
    category: "elemental",
    css: "radial-gradient(ellipse at 30% 70%, #164e63 0%, #0c1825 55%, #0f2a45 100%)",
  },
  {
    slug: "arctic",
    name: "Arctic",
    category: "elemental",
    css: "linear-gradient(160deg, #0c1a2e 0%, #082f49 40%, #0e4f6e 70%, #0c1a2e 100%)",
  },
  {
    slug: "forest",
    name: "Forest",
    category: "elemental",
    css: "radial-gradient(ellipse at 60% 40%, #14532d 0%, #052e16 55%, #0a1f0f 100%)",
  },
  {
    slug: "cosmic",
    name: "Cosmic",
    category: "dark",
    css: "radial-gradient(ellipse at 50% 0%, #3b0764 0%, #0f0a1e 50%, #1a0535 100%)",
  },
  {
    slug: "twilight",
    name: "Twilight",
    category: "dark",
    css: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e1b4b 100%)",
  },
  {
    slug: "storm",
    name: "Storm",
    category: "dark",
    css: "radial-gradient(ellipse at 70% 30%, #1e293b 0%, #0f172a 55%, #0c1222 100%)",
  },
  {
    slug: "dusk",
    name: "Dusk",
    category: "dark",
    css: "linear-gradient(160deg, #0f0a05 0%, #2d1b0e 35%, #4a2008 60%, #1c0e04 100%)",
  },
  {
    slug: "venom",
    name: "Venom",
    category: "elemental",
    css: "radial-gradient(ellipse at 40% 60%, #2e1065 0%, #0c0218 55%, #1a0a3d 100%)",
  },
];

export const TRAINER_PRESETS: TrainerPreset[] = [
  {
    slug: "trainer-01",
    name: "Warrior",
    imagePath: "/trainers/trainer-01.svg",
  },
  {
    slug: "trainer-02",
    name: "Ace",
    imagePath: "/trainers/trainer-02.svg",
  },
  {
    slug: "trainer-03",
    name: "Mystic",
    imagePath: "/trainers/trainer-03.svg",
  },
  {
    slug: "trainer-04",
    name: "Champion",
    imagePath: "/trainers/trainer-04.svg",
  },
];
