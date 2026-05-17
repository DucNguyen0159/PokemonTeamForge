import type { BattleFormat, PokemonType } from "@/types/shared";

export type PreviewPokemonRole =
  | "physical attacker"
  | "special attacker"
  | "mixed attacker"
  | "defensive pivot"
  | "support"
  | "weather setter"
  | "weather sweeper"
  | "speed control"
  | "trick room setter"
  | "trick room attacker";

export type PreviewPokemon = {
  slug: string;
  name: string;
  nationalNumber: number;
  types: [PokemonType, PokemonType?];
  role: PreviewPokemonRole;
  spritePath: string;
};

export const PREVIEW_POKEMON: PreviewPokemon[] = [
  {
    slug: "great-tusk",
    name: "Great Tusk",
    nationalNumber: 984,
    types: ["ground", "fighting"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/great-tusk.png",
  },
  {
    slug: "scizor",
    name: "Scizor",
    nationalNumber: 212,
    types: ["bug", "steel"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/scizor.png",
  },
  {
    slug: "rotom-wash",
    name: "Rotom-Wash",
    nationalNumber: 479,
    types: ["electric", "water"],
    role: "defensive pivot",
    spritePath: "/preview-assets/pokemon/rotom-wash.png",
  },
  {
    slug: "heatran",
    name: "Heatran",
    nationalNumber: 485,
    types: ["fire", "steel"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/heatran.png",
  },
  {
    slug: "hydreigon",
    name: "Hydreigon",
    nationalNumber: 635,
    types: ["dark", "dragon"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/hydreigon.png",
  },
  {
    slug: "tapu-fini",
    name: "Tapu Fini",
    nationalNumber: 788,
    types: ["water", "fairy"],
    role: "defensive pivot",
    spritePath: "/preview-assets/pokemon/tapu-fini.png",
  },
  {
    slug: "garchomp",
    name: "Garchomp",
    nationalNumber: 445,
    types: ["dragon", "ground"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/garchomp.png",
  },
  {
    slug: "gholdengo",
    name: "Gholdengo",
    nationalNumber: 1000,
    types: ["steel", "ghost"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/gholdengo.png",
  },
  {
    slug: "amoonguss",
    name: "Amoonguss",
    nationalNumber: 591,
    types: ["grass", "poison"],
    role: "support",
    spritePath: "/preview-assets/pokemon/amoonguss.png",
  },
  {
    slug: "incineroar",
    name: "Incineroar",
    nationalNumber: 727,
    types: ["fire", "dark"],
    role: "support",
    spritePath: "/preview-assets/pokemon/incineroar.png",
  },
  {
    slug: "rillaboom",
    name: "Rillaboom",
    nationalNumber: 812,
    types: ["grass"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/rillaboom.png",
  },
  {
    slug: "dragonite",
    name: "Dragonite",
    nationalNumber: 149,
    types: ["dragon", "flying"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/dragonite.png",
  },
  {
    slug: "dragapult",
    name: "Dragapult",
    nationalNumber: 887,
    types: ["dragon", "ghost"],
    role: "speed control",
    spritePath: "/preview-assets/pokemon/dragapult.png",
  },
  {
    slug: "iron-valiant",
    name: "Iron Valiant",
    nationalNumber: 1006,
    types: ["fairy", "fighting"],
    role: "mixed attacker",
    spritePath: "/preview-assets/pokemon/iron-valiant.png",
  },
  {
    slug: "greninja",
    name: "Greninja",
    nationalNumber: 658,
    types: ["water", "dark"],
    role: "speed control",
    spritePath: "/preview-assets/pokemon/greninja.png",
  },
  {
    slug: "pelipper",
    name: "Pelipper",
    nationalNumber: 279,
    types: ["water", "flying"],
    role: "weather setter",
    spritePath: "/preview-assets/pokemon/pelipper.png",
  },
  {
    slug: "archaludon",
    name: "Archaludon",
    nationalNumber: 1018,
    types: ["steel", "dragon"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/archaludon.png",
  },
  {
    slug: "barraskewda",
    name: "Barraskewda",
    nationalNumber: 847,
    types: ["water"],
    role: "weather sweeper",
    spritePath: "/preview-assets/pokemon/barraskewda.png",
  },
  {
    slug: "torkoal",
    name: "Torkoal",
    nationalNumber: 324,
    types: ["fire"],
    role: "weather setter",
    spritePath: "/preview-assets/pokemon/torkoal.png",
  },
  {
    slug: "indeedee-female",
    name: "Indeedee-F",
    nationalNumber: 876,
    types: ["psychic", "normal"],
    role: "support",
    spritePath: "/preview-assets/pokemon/indeedee-female.png",
  },
  {
    slug: "hatterene",
    name: "Hatterene",
    nationalNumber: 858,
    types: ["psychic", "fairy"],
    role: "trick room setter",
    spritePath: "/preview-assets/pokemon/hatterene.png",
  },
  {
    slug: "ursaluna",
    name: "Ursaluna",
    nationalNumber: 901,
    types: ["ground", "normal"],
    role: "trick room attacker",
    spritePath: "/preview-assets/pokemon/ursaluna.png",
  },
  {
    slug: "porygon2",
    name: "Porygon2",
    nationalNumber: 233,
    types: ["normal"],
    role: "trick room setter",
    spritePath: "/preview-assets/pokemon/porygon2.png",
  },
  {
    slug: "kingambit",
    name: "Kingambit",
    nationalNumber: 983,
    types: ["dark", "steel"],
    role: "physical attacker",
    spritePath: "/preview-assets/pokemon/kingambit.png",
  },
  {
    slug: "venusaur",
    name: "Venusaur",
    nationalNumber: 3,
    types: ["grass", "poison"],
    role: "weather sweeper",
    spritePath: "/preview-assets/pokemon/venusaur.png",
  },
  {
    slug: "walking-wake",
    name: "Walking Wake",
    nationalNumber: 1009,
    types: ["water", "dragon"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/walking-wake.png",
  },
  {
    slug: "charizard",
    name: "Charizard",
    nationalNumber: 6,
    types: ["fire", "flying"],
    role: "weather sweeper",
    spritePath: "/preview-assets/pokemon/charizard.png",
  },
  {
    slug: "flutter-mane",
    name: "Flutter Mane",
    nationalNumber: 987,
    types: ["ghost", "fairy"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/flutter-mane.png",
  },
  {
    slug: "lucario",
    name: "Lucario",
    nationalNumber: 448,
    types: ["fighting", "steel"],
    role: "mixed attacker",
    spritePath: "/preview-assets/pokemon/lucario.png",
  },
  {
    slug: "gardevoir",
    name: "Gardevoir",
    nationalNumber: 282,
    types: ["psychic", "fairy"],
    role: "special attacker",
    spritePath: "/preview-assets/pokemon/gardevoir.png",
  },
];

export const PREVIEW_POKEMON_BY_SLUG = new Map(
  PREVIEW_POKEMON.map((pokemon) => [pokemon.slug, pokemon]),
);

export type PreviewStrategyPreset = {
  name: string;
  format: BattleFormat;
  pokemonSlugs: [string, string, string, string, string, string];
};

export const HOME_PREVIEW_GROUPS = {
  heroTeam: ["great-tusk", "scizor", "rotom-wash", "heatran", "hydreigon", "tapu-fini"],
  builderTeam: ["garchomp", "gholdengo", "amoonguss", "incineroar", "rillaboom", "dragonite"],
  pokedexHighlights: ["dragapult", "iron-valiant", "greninja"],
  teamCardTeam: ["lucario", "gardevoir", "kingambit", "venusaur", "walking-wake", "flutter-mane"],
  strategyPresets: [
    {
      name: "Rain Balance",
      format: "doubles",
      pokemonSlugs: ["pelipper", "archaludon", "barraskewda", "rillaboom", "incineroar", "amoonguss"],
    },
    {
      name: "Trick Room",
      format: "doubles",
      pokemonSlugs: ["torkoal", "indeedee-female", "hatterene", "ursaluna", "porygon2", "kingambit"],
    },
    {
      name: "Sun Offense",
      format: "singles",
      pokemonSlugs: ["torkoal", "venusaur", "walking-wake", "charizard", "great-tusk", "flutter-mane"],
    },
  ] satisfies PreviewStrategyPreset[],
} as const;
