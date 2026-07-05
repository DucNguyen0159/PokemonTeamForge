import type { ChampionsFormat } from "@/types/champions";

export type ChampionsBattlePlanTemplate = {
  id: string;
  name: string;
  format: ChampionsFormat;
  matchupLabel: string;
  winConditionHint: string;
  avoidHint: string;
};

export const CHAMPIONS_BATTLE_PLAN_TEMPLATES: ChampionsBattlePlanTemplate[] = [
  {
    id: "safe-default",
    name: "Safe Default",
    format: "double",
    matchupLabel: "Safe Default",
    winConditionHint: "Establish board control, preserve win conditions, and trade aggressively once your setup is online.",
    avoidHint: "Do not overcommit leads before you know the opponent's game plan.",
  },
  {
    id: "anti-rain",
    name: "Anti-Rain",
    format: "double",
    matchupLabel: "vs Rain",
    winConditionHint: "Deny or outlast rain turns, then pressure their restricted win condition.",
    avoidHint: "Avoid letting their Swift Swim or rain-boosted sweeper set up for free.",
  },
  {
    id: "anti-sun",
    name: "Anti-Sun",
    format: "double",
    matchupLabel: "vs Sun",
    winConditionHint: "Remove or stall the sun setter and punish Chlorophyll speed.",
    avoidHint: "Do not let a Chlorophyll sweeper get a free turn after sun goes up.",
  },
  {
    id: "anti-trick-room",
    name: "Anti-Trick Room",
    format: "double",
    matchupLabel: "vs Trick Room",
    winConditionHint: "Keep TR setter off the field or KO it before room goes up, then clean with faster threats.",
    avoidHint: "Avoid giving a free TR turn with both leads alive and no answer ready.",
  },
  {
    id: "anti-hyper-offense",
    name: "Anti-Hyper Offense",
    format: "single",
    matchupLabel: "vs Hyper Offense",
    winConditionHint: "Use bulkier selections and force trades that favor your late-game win condition.",
    avoidHint: "Do not lead into a matchup where both of your leads lose the first turn.",
  },
  {
    id: "anti-balance",
    name: "Anti-Balance",
    format: "single",
    matchupLabel: "vs Balance",
    winConditionHint: "Apply steady pressure and break their pivot chain before they stabilize.",
    avoidHint: "Avoid letting them reset momentum with repeated switches and recovery.",
  },
  {
    id: "anti-stall",
    name: "Anti-Stall",
    format: "single",
    matchupLabel: "vs Stall",
    winConditionHint: "Bring breakers that ignore passive play and preserve your win condition through status.",
    avoidHint: "Do not let Toxic or burn stack on your main sweeper.",
  },
  {
    id: "mega-sweep",
    name: "Mega Sweep Setup",
    format: "single",
    matchupLabel: "Mega Sweep",
    winConditionHint: "Get your Mega online safely, then use its boosted stats to close the game.",
    avoidHint: "Do not reveal Mega too early into a matchup that hard-counters it.",
  },
  {
    id: "bulky-pivot",
    name: "Bulky Pivot Plan",
    format: "double",
    matchupLabel: "Bulky Pivot",
    winConditionHint: "Use defensive pivots to gain information and bring in your best late-game threat.",
    avoidHint: "Avoid staying in bad matchups when a switch preserves your win condition.",
  },
  {
    id: "speed-control",
    name: "Speed Control Plan",
    format: "double",
    matchupLabel: "Speed Control",
    winConditionHint: "Use Tailwind, paralysis, or intimidation to flip turn order and attack first.",
    avoidHint: "Do not waste speed-control turns without a follow-up attacker ready.",
  },
];
