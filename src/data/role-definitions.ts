import type { TeamRole } from "@/types/shared";

export interface RoleDefinition {
  label: string;
  description: string;
  examples: string[];
  detectionHints: string[];
}

export const ROLE_DEFINITIONS: Record<TeamRole, RoleDefinition> = {
  physical_attacker: {
    label: "Physical Attacker",
    description: "Primary damage pressure from physical moves.",
    examples: ["garchomp", "weavile", "dragonite"],
    detectionHints: ["high attack", "physical move coverage"],
  },
  special_attacker: {
    label: "Special Attacker",
    description: "Primary damage pressure from special moves.",
    examples: ["gengar", "hydreigon", "alakazam"],
    detectionHints: ["high specialAttack", "special move coverage"],
  },
  mixed_attacker: {
    label: "Mixed Attacker",
    description: "Threatens with both physical and special offense.",
    examples: ["infernape", "kyurem", "iron-valiant"],
    detectionHints: ["balanced attack and specialAttack"],
  },
  physical_wall: {
    label: "Physical Wall",
    description: "Absorbs physical hits and supports defensive stability.",
    examples: ["corviknight", "skarmory", "dondozo"],
    detectionHints: ["high defense", "recovery or utility options"],
  },
  special_wall: {
    label: "Special Wall",
    description: "Soaks special attacks for team longevity.",
    examples: ["blissey", "goodra", "ting-lu"],
    detectionHints: ["high specialDefense", "sustain tools"],
  },
  tank: {
    label: "Tank",
    description: "Bulky Pokémon with meaningful offensive threat.",
    examples: ["swampert", "tyranitar", "goodra"],
    detectionHints: ["high combined bulk", "decent offensive stats"],
  },
  support: {
    label: "Support",
    description: "Provides utility such as healing, screens, status, or redirection.",
    examples: ["clefable", "grimmsnarl", "amoonguss"],
    detectionHints: ["status moves", "team utility", "screen moves"],
  },
  pivot: {
    label: "Pivot",
    description: "Generates momentum through switch-based utility.",
    examples: ["rotom-wash", "landorus-therian", "scizor"],
    detectionHints: ["u-turn", "volt-switch", "flip-turn", "parting-shot"],
  },
  hazard_setter: {
    label: "Hazard Setter",
    description: "Places hazards to pressure opposing switches.",
    examples: ["garchomp", "ting-lu", "glimmora"],
    detectionHints: ["stealth-rock", "spikes", "toxic-spikes", "sticky-web"],
  },
  hazard_remover: {
    label: "Hazard Removal",
    description: "Removes hazards to protect team consistency.",
    examples: ["great-tusk", "corviknight", "iron-treads"],
    detectionHints: ["rapid-spin", "defog", "mortal-spin"],
  },
  setup_sweeper: {
    label: "Setup Sweeper",
    description: "Uses setup moves to become a major late-game threat.",
    examples: ["dragonite", "volcarona", "kingambit"],
    detectionHints: ["swords-dance", "nasty-plot", "dragon-dance", "calm-mind"],
  },
  wallbreaker: {
    label: "Wallbreaker",
    description: "Breaks defensive cores with high immediate power.",
    examples: ["chi-yu", "ursaluna", "iron-hands"],
    detectionHints: ["very high power output", "strong stab pressure"],
  },
  speed_control: {
    label: "Speed Control",
    description: "Controls tempo via speed boosting or slowing effects.",
    examples: ["whimsicott", "talonflame", "cresselia"],
    detectionHints: ["tailwind", "trick-room", "thunder-wave", "icy-wind", "electroweb"],
  },
  weather_setter: {
    label: "Weather Setter",
    description: "Creates weather to enable archetype synergies.",
    examples: ["pelipper", "torkoal", "tyranitar"],
    detectionHints: ["drizzle", "drought", "sand-stream", "snow-warning"],
  },
  weather_abuser: {
    label: "Weather Abuser",
    description: "Directly benefits from weather conditions for pressure.",
    examples: ["barraskewda", "venusaur", "excadrill"],
    detectionHints: ["swift-swim", "chlorophyll", "sand-rush", "slush-rush"],
  },
  trick_room_setter: {
    label: "Trick Room Setter",
    description: "Enables slow-team offensive windows.",
    examples: ["hatterene", "cresselia", "porygon2"],
    detectionHints: ["trick-room access", "supportive bulk"],
  },
  trick_room_abuser: {
    label: "Trick Room Abuser",
    description: "Slow, powerful attacker suited to Trick Room turns.",
    examples: ["torkoal", "amoonguss", "ursaluna"],
    detectionHints: ["low speed", "high attack or specialAttack"],
  },
  intimidate_support: {
    label: "Intimidate Support",
    description: "Provides repeatable physical damage mitigation.",
    examples: ["incineroar", "landorus-therian", "arcanine"],
    detectionHints: ["intimidate ability"],
  },
  redirection_support: {
    label: "Redirection Support",
    description: "Protects partners with target redirection.",
    examples: ["amoonguss", "togekiss", "indeedee-f"],
    detectionHints: ["follow-me", "rage-powder"],
  },
  status_spreader: {
    label: "Status Spreader",
    description: "Applies persistent status pressure to control games.",
    examples: ["rotom-wash", "sableye", "toxapex"],
    detectionHints: ["will-o-wisp", "toxic", "thunder-wave"],
  },
  priority_user: {
    label: "Priority User",
    description: "Uses priority attacks for revenge killing or cleanup.",
    examples: ["dragonite", "scizor", "azumarill"],
    detectionHints: ["extreme-speed", "bullet-punch", "aqua-jet", "ice-shard"],
  },
  trap_user: {
    label: "Trap User",
    description: "Restricts switching to create positional advantages.",
    examples: ["gothitelle", "dugtrio", "magnezone"],
    detectionHints: ["mean-look", "block", "trapping abilities"],
  },
};
