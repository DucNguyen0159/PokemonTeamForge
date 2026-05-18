import type { MoveTag } from "@/types/move";
import type { BattleFormat, TeamRole } from "@/types/shared";

export interface FormatChecklistRuleSet {
  requiredMoveTags: MoveTag[];
  recommendedMoveTags: MoveTag[];
  requiredRoles: TeamRole[];
  recommendedRoles: TeamRole[];
}

export interface FormatScoringWeights {
  missingRole: number;
  defensiveSynergy: number;
  offensiveCoverage: number;
  formatSynergy: number;
  strategySynergy: number;
  statBalance: number;
}

export interface FormatRules {
  label: string;
  description: string;
  checklistSummary: string;
  coverageNote: string;
  recommendationSummary: string;
  slotCount: 6;
  emphasis: string[];
  checklist: FormatChecklistRuleSet;
  recommendationWeights: FormatScoringWeights;
}

export const FORMAT_RULES: Record<BattleFormat, FormatRules> = {
  singles: {
    label: "Singles",
    description:
      "One active Pokémon at a time. Prioritizes hazards, switching, setup pressure, pivots, and defensive stability.",
    checklistSummary: "Hazards, removal, pivots, setup pressure, and role balance.",
    coverageNote: "Coverage helps identify safe switch-ins and stacked weaknesses.",
    recommendationSummary: "Tuned for hazards, pivoting, setup pressure, and defensive stability.",
    slotCount: 6,
    emphasis: ["hazards", "pivoting", "setup pressure", "defensive stability"],
    checklist: {
      requiredMoveTags: ["entry_hazard", "hazard_removal"],
      recommendedMoveTags: ["recovery", "pivot", "setup"],
      requiredRoles: ["hazard_setter", "hazard_remover"],
      recommendedRoles: ["pivot", "setup_sweeper", "wallbreaker"],
    },
    recommendationWeights: {
      missingRole: 1.0,
      defensiveSynergy: 0.85,
      offensiveCoverage: 0.75,
      formatSynergy: 0.65,
      strategySynergy: 0.6,
      statBalance: 0.5,
    },
  },
  doubles: {
    label: "Doubles",
    description:
      "Two Pokémon are active at once. Prioritizes Protect, speed control, Fake Out, redirection, spread moves, and positioning.",
    checklistSummary: "Protect, speed control, Fake Out, redirection, and spread pressure.",
    coverageNote: "Coverage should be paired with Protect, speed control, and board positioning.",
    recommendationSummary: "Tuned for Protect, speed control, redirection, Fake Out, and spread pressure.",
    slotCount: 6,
    emphasis: [
      "protect usage",
      "speed control",
      "redirection",
      "fake out pressure",
      "spread damage",
    ],
    checklist: {
      requiredMoveTags: ["protect", "speed_control"],
      recommendedMoveTags: ["fake_out", "redirection", "spread", "pivot"],
      requiredRoles: ["speed_control"],
      recommendedRoles: ["redirection_support", "intimidate_support", "pivot"],
    },
    recommendationWeights: {
      missingRole: 1.0,
      defensiveSynergy: 0.75,
      offensiveCoverage: 0.8,
      formatSynergy: 0.9,
      strategySynergy: 0.65,
      statBalance: 0.5,
    },
  },
  triples: {
    label: "Triples",
    description:
      "Three Pokémon are active at once. Prioritizes spread pressure, speed control, positioning support, and teamwide utility.",
    checklistSummary: "Spread pressure, speed control, positioning support, and teamwide utility.",
    coverageNote: "Coverage highlights shared weaknesses across a wider active board.",
    recommendationSummary: "Tuned for spread pressure, positioning support, speed control, and teamwide utility.",
    slotCount: 6,
    emphasis: ["spread pressure", "positioning support", "speed control", "teamwide synergy"],
    checklist: {
      requiredMoveTags: ["speed_control"],
      recommendedMoveTags: ["spread", "protect", "pivot", "redirection"],
      requiredRoles: ["speed_control"],
      recommendedRoles: ["support", "pivot", "redirection_support"],
    },
    recommendationWeights: {
      missingRole: 1.0,
      defensiveSynergy: 0.7,
      offensiveCoverage: 0.85,
      formatSynergy: 0.95,
      strategySynergy: 0.7,
      statBalance: 0.45,
    },
  },
};
