import { MOCK_ITEMS } from "@/data/mock-items";
import { MOCK_POKEMON } from "@/data/mock-pokemon";
import type { StrategyTeam, StrategyTeamPokemon, StrategyType } from "@/types/strategy";
import type { TeamRole } from "@/types/shared";

function getPokemon(slug: string) {
  const pokemon = MOCK_POKEMON.find((entry) => entry.slug === slug);
  if (!pokemon) {
    throw new Error(`Strategy preset references unknown pokemon: ${slug}`);
  }
  return pokemon;
}

function getItem(name: string) {
  const item = MOCK_ITEMS.find((entry) => entry.name === name);
  if (!item) {
    throw new Error(`Strategy preset references unknown item: ${name}`);
  }
  return item;
}

function createSlot(input: {
  slot: number;
  pokemonSlug: string;
  abilityName: string;
  itemName: string;
  moveNames: string[];
  role: TeamRole;
  explanation: string;
}): StrategyTeamPokemon {
  const pokemon = getPokemon(input.pokemonSlug);
  const ability = pokemon.abilities.find((entry) => entry.name === input.abilityName) ?? pokemon.abilities[0];
  const moves = input.moveNames
    .map((moveName) => pokemon.moves.find((entry) => entry.name === moveName))
    .filter((move): move is NonNullable<typeof move> => Boolean(move))
    .slice(0, 4);

  return {
    slot: input.slot,
    pokemon,
    ability,
    item: getItem(input.itemName),
    moves,
    role: input.role,
    explanation: input.explanation,
  };
}

function buildStrategyTeam(input: {
  id: string;
  name: string;
  slug: string;
  strategyType: StrategyType;
  format: StrategyTeam["format"];
  difficulty: StrategyTeam["difficulty"];
  tags: string[];
  shortDescription: string;
  pokemon: StrategyTeamPokemon[];
}): StrategyTeam {
  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    strategyType: input.strategyType,
    format: input.format,
    difficulty: input.difficulty,
    tags: input.tags,
    shortDescription: input.shortDescription,
    pokemon: input.pokemon,
  };
}

export const STRATEGY_TEAMS: StrategyTeam[] = [
  buildStrategyTeam({
    id: "rain-tempo",
    name: "Rain Tempo",
    slug: "rain-tempo",
    strategyType: "rain",
    format: "doubles",
    difficulty: "intermediate",
    tags: ["rain", "tempo", "pivot"],
    shortDescription: "Water pressure with fast tempo and pivot support.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "slowbro",
        abilityName: "Regenerator",
        itemName: "Leftovers",
        moveNames: ["Scald", "Slack Off", "Thunder Wave", "Future Sight"],
        role: "support",
        explanation: "Bulky water pivot that spreads speed control.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "tapu-koko",
        abilityName: "Electric Surge",
        itemName: "Choice Specs",
        moveNames: ["Thunderbolt", "Dazzling Gleam", "U-turn", "Wild Charge"],
        role: "speed_control",
        explanation: "Fast electric pressure that supports rain-style offense.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Rocky Helmet",
        moveNames: ["Defog", "U-turn", "Roost", "Brave Bird"],
        role: "pivot",
        explanation: "Defensive pivot that helps keep tempo and hazard control.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "dragapult",
        abilityName: "Infiltrator",
        itemName: "Life Orb",
        moveNames: ["Thunderbolt", "Shadow Ball", "U-turn", "Fire Blast"],
        role: "special_attacker",
        explanation: "High-speed pressure and electric coverage.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "excadrill",
        abilityName: "Sand Rush",
        itemName: "Focus Sash",
        moveNames: ["Rapid Spin", "Earthquake", "Iron Head", "Rock Slide"],
        role: "hazard_remover",
        explanation: "Fast utility cleaner with emergency hazard control.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "dragonite",
        abilityName: "Multiscale",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Dragon Dance", "Extreme Speed", "Earthquake", "Roost"],
        role: "setup_sweeper",
        explanation: "Late-game setup closer after chip pressure.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "sun-pressure",
    name: "Sun Pressure",
    slug: "sun-pressure",
    strategyType: "sun",
    format: "doubles",
    difficulty: "intermediate",
    tags: ["sun", "special offense", "setup"],
    shortDescription: "Special offense core with fire-heavy pressure and support pivots.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "heatran",
        abilityName: "Flash Fire",
        itemName: "Leftovers",
        moveNames: ["Magma Storm", "Earth Power", "Stealth Rock", "Taunt"],
        role: "special_attacker",
        explanation: "Primary fire pressure and hazard setup anchor.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "volcarona",
        abilityName: "Flame Body",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Quiver Dance", "Fire Blast", "Bug Buzz", "Giga Drain"],
        role: "setup_sweeper",
        explanation: "Sun-style special setup win condition.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "garchomp",
        abilityName: "Rough Skin",
        itemName: "Rocky Helmet",
        moveNames: ["Stealth Rock", "Earthquake", "Dragon Claw", "Fire Fang"],
        role: "physical_attacker",
        explanation: "Ground coverage and physical pressure to complement fire core.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "clefable",
        abilityName: "Magic Guard",
        itemName: "Leftovers",
        moveNames: ["Moonblast", "Soft-Boiled", "Calm Mind", "Flamethrower"],
        role: "support",
        explanation: "Defensive glue and status-resistant utility.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "dragapult",
        abilityName: "Infiltrator",
        itemName: "Choice Specs",
        moveNames: ["Fire Blast", "Shadow Ball", "Thunderbolt", "U-turn"],
        role: "speed_control",
        explanation: "Fast pivot to keep offensive momentum.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Leftovers",
        moveNames: ["Defog", "Roost", "U-turn", "Iron Head"],
        role: "hazard_remover",
        explanation: "Stability and hazard cleanup for repeated switching.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "trick-room-bulk",
    name: "Trick Room Bulk",
    slug: "trick-room-bulk",
    strategyType: "trick_room",
    format: "doubles",
    difficulty: "intermediate",
    tags: ["trick room", "bulk", "slow core"],
    shortDescription: "Low-speed bulky attackers and walls for controlled tempo.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "slowbro",
        abilityName: "Regenerator",
        itemName: "Leftovers",
        moveNames: ["Scald", "Future Sight", "Slack Off", "Thunder Wave"],
        role: "trick_room_setter",
        explanation: "Low-speed bulky lead that sets pace.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "ferrothorn",
        abilityName: "Iron Barbs",
        itemName: "Rocky Helmet",
        moveNames: ["Stealth Rock", "Leech Seed", "Power Whip", "Spikes"],
        role: "tank",
        explanation: "Very slow defensive pressure and chip.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "toxapex",
        abilityName: "Regenerator",
        itemName: "Black Sludge",
        moveNames: ["Scald", "Recover", "Toxic Spikes", "Haze"],
        role: "special_wall",
        explanation: "Slow wall that absorbs pressure and prolongs turns.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "heatran",
        abilityName: "Flash Fire",
        itemName: "Assault Vest",
        moveNames: ["Magma Storm", "Earth Power", "Flash Cannon", "Will-O-Wisp"],
        role: "special_attacker",
        explanation: "Bulky special threat that benefits from slower game states.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "clefable",
        abilityName: "Unaware",
        itemName: "Leftovers",
        moveNames: ["Moonblast", "Soft-Boiled", "Calm Mind", "Stealth Rock"],
        role: "support",
        explanation: "Reliable sustain and anti-setup support.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Leftovers",
        moveNames: ["Defog", "Roost", "Brave Bird", "Body Press"],
        role: "physical_wall",
        explanation: "Physical safety net and hazard control.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "tailwind-offense",
    name: "Tailwind Offense",
    slug: "tailwind-offense",
    strategyType: "tailwind",
    format: "doubles",
    difficulty: "beginner",
    tags: ["tailwind", "fast offense", "pivot"],
    shortDescription: "Fast-paced offense with pivoting and speed pressure.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Heavy-Duty Boots",
        moveNames: ["U-turn", "Roost", "Brave Bird", "Defog"],
        role: "pivot",
        explanation: "Primary pivot and defensive reset option.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "dragapult",
        abilityName: "Infiltrator",
        itemName: "Choice Specs",
        moveNames: ["Shadow Ball", "Thunderbolt", "Fire Blast", "U-turn"],
        role: "speed_control",
        explanation: "High-speed special cleaner.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "dragonite",
        abilityName: "Multiscale",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Extreme Speed", "Dragon Dance", "Earthquake", "Fire Punch"],
        role: "physical_attacker",
        explanation: "Priority and setup pressure in fast games.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "garchomp",
        abilityName: "Rough Skin",
        itemName: "Focus Sash",
        moveNames: ["Earthquake", "Dragon Claw", "Swords Dance", "Stone Edge"],
        role: "physical_attacker",
        explanation: "Strong immediate physical pressure.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "tapu-koko",
        abilityName: "Electric Surge",
        itemName: "Life Orb",
        moveNames: ["Thunderbolt", "Dazzling Gleam", "U-turn", "Wild Charge"],
        role: "special_attacker",
        explanation: "Terrain-enabled fast electric offense.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "excadrill",
        abilityName: "Mold Breaker",
        itemName: "Focus Sash",
        moveNames: ["Rapid Spin", "Earthquake", "Iron Head", "Rock Slide"],
        role: "hazard_remover",
        explanation: "Utility cleaner that keeps offense moving.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "classic-balance",
    name: "Classic Balance",
    slug: "classic-balance",
    strategyType: "balance",
    format: "singles",
    difficulty: "beginner",
    tags: ["balance", "safe core", "all-around"],
    shortDescription: "Stable all-purpose team with offense, defense, and utility.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "garchomp",
        abilityName: "Rough Skin",
        itemName: "Leftovers",
        moveNames: ["Earthquake", "Dragon Claw", "Stealth Rock", "Fire Fang"],
        role: "hazard_setter",
        explanation: "Hazards and physical pressure.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Leftovers",
        moveNames: ["Defog", "Roost", "U-turn", "Body Press"],
        role: "hazard_remover",
        explanation: "Reliable defensive pivot.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "clefable",
        abilityName: "Magic Guard",
        itemName: "Leftovers",
        moveNames: ["Moonblast", "Soft-Boiled", "Calm Mind", "Teleport"],
        role: "support",
        explanation: "Utility and sustain core piece.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "heatran",
        abilityName: "Flash Fire",
        itemName: "Leftovers",
        moveNames: ["Magma Storm", "Earth Power", "Stealth Rock", "Taunt"],
        role: "special_attacker",
        explanation: "Special pressure and anti-passive tools.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "dragapult",
        abilityName: "Infiltrator",
        itemName: "Choice Specs",
        moveNames: ["Shadow Ball", "Thunderbolt", "U-turn", "Fire Blast"],
        role: "speed_control",
        explanation: "Fast revenge pressure and pivot.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "toxapex",
        abilityName: "Regenerator",
        itemName: "Black Sludge",
        moveNames: ["Scald", "Recover", "Haze", "Toxic Spikes"],
        role: "special_wall",
        explanation: "Defensive anchor and emergency reset.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "hyper-offense-blitz",
    name: "Hyper Offense Blitz",
    slug: "hyper-offense-blitz",
    strategyType: "hyper_offense",
    format: "singles",
    difficulty: "intermediate",
    tags: ["hyper offense", "setup", "pressure"],
    shortDescription: "Aggressive setup-focused offense with speed and priority.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "garchomp",
        abilityName: "Rough Skin",
        itemName: "Focus Sash",
        moveNames: ["Swords Dance", "Earthquake", "Dragon Claw", "Stone Edge"],
        role: "setup_sweeper",
        explanation: "Lead setup threat to force early pressure.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "dragonite",
        abilityName: "Multiscale",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Dragon Dance", "Extreme Speed", "Earthquake", "Fire Punch"],
        role: "setup_sweeper",
        explanation: "Priority-backed setup cleaner.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "volcarona",
        abilityName: "Flame Body",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Quiver Dance", "Fire Blast", "Bug Buzz", "Giga Drain"],
        role: "setup_sweeper",
        explanation: "Special setup sweeper.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "dragapult",
        abilityName: "Infiltrator",
        itemName: "Choice Specs",
        moveNames: ["Shadow Ball", "Thunderbolt", "Fire Blast", "Dragon Darts"],
        role: "special_attacker",
        explanation: "Fast pressure to punish defensive teams.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "tapu-koko",
        abilityName: "Electric Surge",
        itemName: "Life Orb",
        moveNames: ["Thunderbolt", "Wild Charge", "Dazzling Gleam", "U-turn"],
        role: "physical_attacker",
        explanation: "Fast breaker that keeps momentum.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "excadrill",
        abilityName: "Mold Breaker",
        itemName: "Choice Scarf",
        moveNames: ["Earthquake", "Iron Head", "Rock Slide", "Rapid Spin"],
        role: "wallbreaker",
        explanation: "Late-game cleaner with coverage.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "iron-stall",
    name: "Iron Stall",
    slug: "iron-stall",
    strategyType: "stall",
    format: "singles",
    difficulty: "intermediate",
    tags: ["stall", "hazards", "recovery"],
    shortDescription: "Long-game defensive shell with hazard chip and sustain.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "toxapex",
        abilityName: "Regenerator",
        itemName: "Black Sludge",
        moveNames: ["Scald", "Recover", "Toxic Spikes", "Haze"],
        role: "special_wall",
        explanation: "Regenerator wall and status pressure.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "ferrothorn",
        abilityName: "Iron Barbs",
        itemName: "Rocky Helmet",
        moveNames: ["Stealth Rock", "Spikes", "Leech Seed", "Power Whip"],
        role: "hazard_setter",
        explanation: "Primary hazard stack and passive chip.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Leftovers",
        moveNames: ["Defog", "Roost", "Body Press", "U-turn"],
        role: "hazard_remover",
        explanation: "Hazard control and physical cushion.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "slowbro",
        abilityName: "Regenerator",
        itemName: "Leftovers",
        moveNames: ["Scald", "Slack Off", "Future Sight", "Thunder Wave"],
        role: "tank",
        explanation: "Bulky pivot with sustain and control.",
      }),
      createSlot({
        slot: 5,
        pokemonSlug: "clefable",
        abilityName: "Unaware",
        itemName: "Leftovers",
        moveNames: ["Moonblast", "Soft-Boiled", "Calm Mind", "Teleport"],
        role: "support",
        explanation: "Anti-setup utility and sustain.",
      }),
      createSlot({
        slot: 6,
        pokemonSlug: "heatran",
        abilityName: "Flash Fire",
        itemName: "Leftovers",
        moveNames: ["Magma Storm", "Taunt", "Stealth Rock", "Earth Power"],
        role: "support",
        explanation: "Trap pressure and anti-passive control.",
      }),
    ],
  }),
  buildStrategyTeam({
    id: "monotype-steel-core",
    name: "Monotype Steel Core",
    slug: "monotype-steel-core",
    strategyType: "monotype",
    format: "singles",
    difficulty: "beginner",
    tags: ["monotype", "steel", "editable core"],
    shortDescription: "Editable steel-focused core. Load it, then fill remaining slots.",
    pokemon: [
      createSlot({
        slot: 1,
        pokemonSlug: "heatran",
        abilityName: "Flash Fire",
        itemName: "Leftovers",
        moveNames: ["Magma Storm", "Earth Power", "Flash Cannon", "Stealth Rock"],
        role: "special_attacker",
        explanation: "Special steel anchor with utility.",
      }),
      createSlot({
        slot: 2,
        pokemonSlug: "ferrothorn",
        abilityName: "Iron Barbs",
        itemName: "Rocky Helmet",
        moveNames: ["Stealth Rock", "Spikes", "Leech Seed", "Power Whip"],
        role: "hazard_setter",
        explanation: "Hazard stack and bulk.",
      }),
      createSlot({
        slot: 3,
        pokemonSlug: "corviknight",
        abilityName: "Mirror Armor",
        itemName: "Heavy-Duty Boots",
        moveNames: ["Defog", "Roost", "U-turn", "Iron Head"],
        role: "hazard_remover",
        explanation: "Defensive glue and pivot.",
      }),
      createSlot({
        slot: 4,
        pokemonSlug: "excadrill",
        abilityName: "Mold Breaker",
        itemName: "Choice Scarf",
        moveNames: ["Earthquake", "Iron Head", "Rapid Spin", "Rock Slide"],
        role: "physical_attacker",
        explanation: "Fast steel-ground pressure.",
      }),
    ],
  }),
];

