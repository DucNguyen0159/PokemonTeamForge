import type { MoveTag } from "@/types/move";

export const MOVE_TAGS: Record<string, MoveTag[]> = {
  // Hazards and removal
  "stealth-rock": ["entry_hazard"],
  spikes: ["entry_hazard"],
  "toxic-spikes": ["entry_hazard"],
  "sticky-web": ["entry_hazard"],
  defog: ["hazard_removal"],
  "rapid-spin": ["hazard_removal"],
  "mortal-spin": ["hazard_removal"],

  // Recovery
  recover: ["recovery"],
  roost: ["recovery"],
  "soft-boiled": ["recovery"],
  moonlight: ["recovery"],
  synthesis: ["recovery"],
  wish: ["recovery"],

  // Pivoting
  "u-turn": ["pivot"],
  "volt-switch": ["pivot"],
  "flip-turn": ["pivot"],
  "parting-shot": ["pivot"],
  "chilly-reception": ["pivot"],

  // Setup
  "swords-dance": ["setup"],
  "nasty-plot": ["setup"],
  "calm-mind": ["setup"],
  "dragon-dance": ["setup"],
  "bulk-up": ["setup"],
  "agility": ["setup"],
  "quiver-dance": ["setup"],

  // Utility and status
  "will-o-wisp": ["status"],
  "thunder-wave": ["status", "speed_control"],
  toxic: ["status"],
  encore: ["status"],
  taunt: ["status"],
  protect: ["protect"],
  "fake-out": ["fake_out", "priority"],

  // Priority attacks
  "extreme-speed": ["priority"],
  "ice-shard": ["priority"],
  "shadow-sneak": ["priority"],
  "bullet-punch": ["priority"],
  "aqua-jet": ["priority"],
  "sucker-punch": ["priority"],

  // Spread and speed control
  earthquake: ["spread"],
  surf: ["spread"],
  heatwave: ["spread"],
  rockslide: ["spread"],
  blizzard: ["spread"],
  "dazzling-gleam": ["spread"],
  snarl: ["spread"],
  tailwind: ["speed_control"],
  "icy-wind": ["speed_control"],
  electroweb: ["speed_control"],
  "trick-room": ["trick_room", "speed_control"],

  // Weather
  "rain-dance": ["weather"],
  "sunny-day": ["weather"],
  sandstorm: ["weather"],
  snowscape: ["weather"],

  // Redirection
  "follow-me": ["redirection"],
  "rage-powder": ["redirection"],

  // Misc tactical
  roar: ["phazing"],
  whirlwind: ["phazing"],
  "dragon-tail": ["phazing"],
  "circle-throw": ["phazing"],
  "mean-look": ["trap"],
  "block": ["trap"],
};
