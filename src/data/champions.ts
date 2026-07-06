import { ROUTES } from "@/constants/routes";

export const CHAMPIONS_RULESET_ID = "regulation-m-a";

export const CHAMPIONS_CORE_RULES = [
  "Formats: Singles 3v3 and Doubles 4v4 (from a 6-Pokemon roster)",
  "Only Mega Evolution is currently available",
  "Stat Points: 66 total SP, max 32 in any one stat",
  "IV assumptions: fixed at 31 in all stats",
  "Standard clauses: no duplicate species and no duplicate held items",
] as const;

export const CHAMPIONS_BUILDER_PLANS_HREF = `${ROUTES.championsBuilder}?tab=plans`;

export type ChampionsSubnavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  group: "home" | "build" | "analyze" | "discover";
};

export const CHAMPIONS_SUBNAV_GROUPS: Array<{ id: ChampionsSubnavItem["group"]; label: string }> = [
  { id: "home", label: "Home" },
  { id: "build", label: "Build" },
  { id: "analyze", label: "Analyze" },
  { id: "discover", label: "Discover" },
];

export const CHAMPIONS_SUBNAV_ITEMS: ChampionsSubnavItem[] = [
  {
    href: ROUTES.champions,
    label: "Dashboard",
    shortLabel: "Dashboard",
    description: "Rules, shortcuts, and quick-start actions",
    group: "home",
  },
  {
    href: ROUTES.championsBuilder,
    label: "Team Builder",
    shortLabel: "Builder",
    description: "Build a 6-Pokemon roster and battle plans",
    group: "build",
  },
  {
    href: CHAMPIONS_BUILDER_PLANS_HREF,
    label: "Battle Plans",
    shortLabel: "Plans",
    description: "Matchup-specific 3v3/4v4 bring lists",
    group: "build",
  },
  {
    href: ROUTES.championsDamage,
    label: "Damage Lab",
    shortLabel: "Damage",
    description: "Champions-first damage calculation workspace",
    group: "analyze",
  },
  {
    href: ROUTES.championsCoach,
    label: "Matchup Coach",
    shortLabel: "Coach",
    description: "Coverage, speed tiers, and threat checks",
    group: "analyze",
  },
  {
    href: ROUTES.championsPresets,
    label: "Strategy Presets",
    shortLabel: "Presets",
    description: "Curated 6-Pokemon teams with plan templates",
    group: "discover",
  },
  {
    href: ROUTES.championsCommunity,
    label: "Community Teams",
    shortLabel: "Community",
    description: "Browse, star, and fork shared Champions teams",
    group: "discover",
  },
];

export const CHAMPIONS_IMPLEMENTATION_CHECKLIST = [
  "Create Champions route shell with left desktop sub-navbar and mobile menu.",
  "Add Champions pages: Dashboard, Builder, Damage Lab, Presets, Plans, Coach, Community.",
  "Introduce champions domain types (team, roster slot, battle plans, SP spread).",
  "Add Supabase schema extension SQL for champions mode, battle plans, stars, comments.",
  "Integrate @smogon/calc with a champions adapter (SP, fixed IVs, Mega forms).",
  "Implement champions builder data flow and saved-team persistence.",
  "Implement community publish, star, comment APIs and RLS-safe queries.",
] as const;
