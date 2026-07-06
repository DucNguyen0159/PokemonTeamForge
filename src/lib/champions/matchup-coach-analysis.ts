import type { ChampionsPreset } from "@/data/champions-presets";
import { MOVE_TAGS } from "@/data/move-tags";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { evaluateBattlePlanQuality } from "@/lib/champions/battle-plan-quality";
import { buildSlotOptions, slotTokenToNumber } from "@/lib/champions/battle-plan-utils";
import { calculateTypeEffectiveness, isSuperEffectiveAgainst } from "@/lib/calculations/shared/type-effectiveness";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import type { ChampionsBattlePlan, ChampionsPokemon, ChampionsSpSpread, ChampionsTeam } from "@/types/champions";
import type { Move, MoveTag } from "@/types/move";
import type { PokemonType } from "@/types/shared";

export type TeamMemberInsight = {
  slot: number;
  name: string;
  types: PokemonType[];
  speedScore: number;
  supportMoves: string[];
  pressureMoves: string[];
  hasTrickRoom: boolean;
};

export type WeaknessEntry = {
  type: PokemonType;
  weak: number;
  resist: number;
  immune: number;
};

export type ThreatStatus = "covered" | "risky" | "exposed";

export type ThreatChecklistEntry = {
  label: string;
  attackingTypes: PokemonType[];
  defensiveCoverage: number;
  status: ThreatStatus;
  answers: TeamMemberInsight[];
};

export type SpHint = {
  slot: number;
  pokemonName: string;
  hint: string;
  action: SpHintAction;
};

export type SpHintAction =
  | { kind: "allocate_remaining"; remaining: number }
  | { kind: "min_speed"; target: number }
  | { kind: "clear_speed_tr" };

export type LeadSuggestion = {
  pair: string;
  rationale: string;
  score: number;
};

export type ReadinessSummary = {
  score: number;
  label: string;
  alerts: string[];
  tags: string[];
};

export type SpeedTier = "fast" | "mid" | "slow" | "tr";

export type OffensiveCoverageEntry = {
  type: PokemonType;
  hitters: number;
  moveCount: number;
  contributors: Array<{ slot: number; name: string }>;
};

export type MegaUserInsight = {
  slot: number;
  name: string;
  megaItem: string;
  inSelectedPlan: boolean;
  isDefaultMega: boolean;
};

export type MegaDependencyInsight = {
  megaUsers: MegaUserInsight[];
  multipleMegaUsers: boolean;
  planMissingMega: boolean;
  warnings: string[];
};

export type PlanCoachWarning = {
  planId: string;
  planName: string;
  severity: "critical" | "warning";
  message: string;
};

const NATURE_SPEED_MULTIPLIER: Record<string, number> = {
  timid: 1.1,
  jolly: 1.1,
  hasty: 1.1,
  naive: 1.1,
  brave: 0.9,
  relaxed: 0.9,
  quiet: 0.9,
  sassy: 0.9,
};

export const META_THREATS = [
  { label: "Rain offense", attackingTypes: ["water", "electric"] as PokemonType[] },
  { label: "Sun pressure", attackingTypes: ["fire", "grass"] as PokemonType[] },
  { label: "Ground spam", attackingTypes: ["ground"] as PokemonType[] },
  { label: "Dragon/Fairy core", attackingTypes: ["dragon", "fairy"] as PokemonType[] },
  { label: "Fighting pressure", attackingTypes: ["fighting"] as PokemonType[] },
] as const;

export const EXTENDED_COACH_THREATS = [
  ...META_THREATS,
  { label: "Trick Room core", attackingTypes: ["ghost", "fighting"] as PokemonType[] },
  { label: "Hyper offense", attackingTypes: ["dark", "fighting"] as PokemonType[] },
  { label: "Tailwind doubles", attackingTypes: ["fairy", "flying"] as PokemonType[] },
] as const;

export type MatchupScenarioId =
  | "all"
  | "rain"
  | "sun"
  | "trick-room"
  | "hyper-offense"
  | "ground";

export type MatchupScenario = {
  id: MatchupScenarioId;
  label: string;
  threatLabels: string[] | null;
};

export const MATCHUP_SCENARIOS: MatchupScenario[] = [
  { id: "all", label: "All meta", threatLabels: null },
  { id: "rain", label: "Vs Rain", threatLabels: ["Rain offense"] },
  { id: "sun", label: "Vs Sun", threatLabels: ["Sun pressure"] },
  { id: "trick-room", label: "Vs Trick Room", threatLabels: ["Trick Room core", "Fighting pressure"] },
  { id: "hyper-offense", label: "Vs Hyper Offense", threatLabels: ["Hyper offense", "Fighting pressure"] },
  { id: "ground", label: "Vs Ground", threatLabels: ["Ground spam"] },
];

export type PresetSlotDiff = {
  slot: number;
  pokemonName: string;
  status: "match" | "changed" | "missing";
  changes: string[];
};

export type PresetComparisonResult = {
  presetName: string;
  matchedSlots: number;
  changedSlots: number;
  diffs: PresetSlotDiff[];
};

const SUPPORT_MOVE_KEYWORDS = [
  "tailwind",
  "trick room",
  "helping hand",
  "fake out",
  "parting shot",
  "rage powder",
  "spore",
  "reflect",
  "light screen",
  "follow me",
] as const;

export function computeSpeedScore(baseSpeed: number, speedSp: number, nature: string): number {
  const multiplier = NATURE_SPEED_MULTIPLIER[nature.trim().toLowerCase()] ?? 1;
  const statBeforeNature = baseSpeed + 20 + Math.max(0, Math.min(32, speedSp));
  return Math.floor(statBeforeNature * multiplier);
}

export function classifySpeedTier(speedScore: number, hasTrickRoom: boolean): SpeedTier {
  if (hasTrickRoom) {
    return "tr";
  }
  if (speedScore >= 140) {
    return "fast";
  }
  if (speedScore >= 90) {
    return "mid";
  }
  return "slow";
}

export function speedTierLabel(tier: SpeedTier): string {
  if (tier === "fast") {
    return "Fast";
  }
  if (tier === "mid") {
    return "Mid";
  }
  if (tier === "slow") {
    return "Slow";
  }
  return "TR";
}

export function buildMemberInsights(
  filledSlots: ChampionsPokemon[],
  getDetail: (
    slot: number,
  ) => { primaryType: PokemonType; secondaryType?: PokemonType | null; stats: { speed: number } } | undefined,
): TeamMemberInsight[] {
  return filledSlots
    .map((slot) => {
      const detail = getDetail(slot.slot);
      if (!detail) {
        return null;
      }
      const chosenMoves = slot.moves.filter((move) => move.trim().length > 0);
      const supportMoves = chosenMoves.filter((move) =>
        SUPPORT_MOVE_KEYWORDS.some((keyword) => move.toLowerCase().includes(keyword)),
      );
      const pressureMoves = chosenMoves.filter((move) => !supportMoves.includes(move));
      const hasTrickRoom = chosenMoves.some((move) => move.toLowerCase().includes("trick room"));
      return {
        slot: slot.slot,
        name: slot.pokemonName,
        types: [detail.primaryType, detail.secondaryType].filter((type): type is PokemonType => Boolean(type)),
        speedScore: computeSpeedScore(detail.stats.speed, slot.sp.spe, slot.statAlignment),
        supportMoves,
        pressureMoves,
        hasTrickRoom,
      };
    })
    .filter((entry): entry is TeamMemberInsight => Boolean(entry))
    .sort((a, b) => b.speedScore - a.speedScore);
}

export function buildWeaknessMap(memberInsights: TeamMemberInsight[]): WeaknessEntry[] {
  return ALL_POKEMON_TYPES.map((attackType) => {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    memberInsights.forEach((member) => {
      const effectiveness = calculateTypeEffectiveness(attackType, member.types);
      if (effectiveness === 0) {
        immune += 1;
      } else if (effectiveness > 1) {
        weak += 1;
      } else if (effectiveness < 1) {
        resist += 1;
      }
    });
    return { type: attackType, weak, resist, immune };
  }).sort((a, b) => b.weak - a.weak);
}

function memberHandlesThreat(member: TeamMemberInsight, attackingTypes: PokemonType[]): boolean {
  return attackingTypes.some((attackingType) => calculateTypeEffectiveness(attackingType, member.types) <= 1);
}

export function buildThreatChecklist(memberInsights: TeamMemberInsight[]): ThreatChecklistEntry[] {
  return EXTENDED_COACH_THREATS.map((threat) => {
    const answers = memberInsights.filter((member) => memberHandlesThreat(member, threat.attackingTypes));
    const defensiveCoverage = answers.length;
    const status: ThreatStatus =
      defensiveCoverage >= 2 ? "covered" : defensiveCoverage === 1 ? "risky" : "exposed";
    return {
      label: threat.label,
      attackingTypes: [...threat.attackingTypes],
      defensiveCoverage,
      status,
      answers,
    };
  });
}

function normalizeMoveToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function moveMatchesName(move: Move, moveName: string): boolean {
  const normalized = normalizeMoveToken(moveName);
  return (
    move.name.toLowerCase() === moveName.trim().toLowerCase() ||
    move.slug === normalized ||
    normalizeMoveToken(move.name) === normalized
  );
}

export function resolveAttackingMoves(
  slot: ChampionsPokemon,
  learnset: Move[] | undefined,
): Move[] {
  if (!learnset?.length) {
    return [];
  }
  return slot.moves
    .filter((moveName) => moveName.trim().length > 0)
    .map((moveName) => learnset.find((move) => moveMatchesName(move, moveName)) ?? null)
    .filter((move): move is Move => move !== null && move.category !== "status");
}

function moveHasTag(moveName: string, tag: MoveTag): boolean {
  const slug = normalizeMoveToken(moveName);
  return MOVE_TAGS[slug]?.includes(tag) ?? false;
}

export function slotHasSpeedControl(slot: ChampionsPokemon): boolean {
  return slot.moves.some(
    (move) => moveHasTag(move, "speed_control") || moveHasTag(move, "trick_room"),
  );
}

export function slotHasRedirection(slot: ChampionsPokemon): boolean {
  return slot.moves.some((move) => moveHasTag(move, "redirection"));
}

export function isMegaUser(slot: ChampionsPokemon): boolean {
  const item = slot.item?.trim() || slot.megaStone?.trim() || "";
  return Boolean(item && isLikelyMegaStone(item));
}

export function getPlanSelectedSlots(plan: ChampionsBattlePlan): number[] {
  return plan.selectedPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);
}

export function getPlanLeadSlots(plan: ChampionsBattlePlan): number[] {
  return plan.leadPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);
}

export function filterSlotsForPlan(
  filledSlots: ChampionsPokemon[],
  plan: ChampionsBattlePlan | null,
): ChampionsPokemon[] {
  if (!plan) {
    return filledSlots;
  }
  const selected = new Set(getPlanSelectedSlots(plan));
  if (selected.size === 0) {
    return filledSlots;
  }
  return filledSlots.filter((slot) => selected.has(slot.slot));
}

export function buildOffensiveCoverage(
  filledSlots: ChampionsPokemon[],
  getLearnset: (slot: number) => Move[] | undefined,
): OffensiveCoverageEntry[] {
  const entries = ALL_POKEMON_TYPES.map((targetType) => {
    const contributors: Array<{ slot: number; name: string }> = [];
    let moveCount = 0;

    filledSlots.forEach((slot) => {
      const attackingMoves = resolveAttackingMoves(slot, getLearnset(slot.slot));
      const hits = attackingMoves.filter((move) => isSuperEffectiveAgainst(move.type, targetType));
      if (hits.length > 0) {
        contributors.push({ slot: slot.slot, name: slot.pokemonName });
        moveCount += hits.length;
      }
    });

    return {
      type: targetType,
      hitters: contributors.length,
      moveCount,
      contributors,
    };
  });

  return entries.sort((a, b) => b.hitters - a.hitters || b.moveCount - a.moveCount);
}

export function buildMegaDependencyInsight(
  team: ChampionsTeam,
  plan: ChampionsBattlePlan | null,
): MegaDependencyInsight {
  const planSlots = plan ? new Set(getPlanSelectedSlots(plan)) : null;
  const megaUsers: MegaUserInsight[] = team.pokemon
    .filter((slot) => slot.pokemonName.trim() && isMegaUser(slot))
    .map((slot) => ({
      slot: slot.slot,
      name: slot.pokemonName,
      megaItem: slot.item?.trim() || slot.megaStone?.trim() || "Mega Stone",
      inSelectedPlan: planSlots ? planSlots.has(slot.slot) : true,
      isDefaultMega: Boolean(slot.useMegaByDefault),
    }));

  const warnings: string[] = [];
  const multipleMegaUsers = megaUsers.length > 1;
  const planMissingMega =
    Boolean(plan && megaUsers.length > 0 && !megaUsers.some((user) => user.inSelectedPlan));

  if (multipleMegaUsers) {
    warnings.push(
      `Roster has ${megaUsers.length} Mega users — only one can Mega per battle. Pick one win condition.`,
    );
  }
  if (planMissingMega) {
    warnings.push(
      `"${plan?.name}" does not include your Mega user — plan may underperform without Mega Evolution.`,
    );
  }
  megaUsers
    .filter((user) => user.isDefaultMega && !user.inSelectedPlan && plan)
    .forEach((user) => {
      warnings.push(
        `${user.name} is set to Mega by default but is not in "${plan?.name}" bring list.`,
      );
    });

  return {
    megaUsers,
    multipleMegaUsers,
    planMissingMega,
    warnings,
  };
}

export function buildPlanCoachWarnings(
  plan: ChampionsBattlePlan,
  team: ChampionsTeam,
  memberInsights: TeamMemberInsight[],
): PlanCoachWarning[] {
  const warnings: PlanCoachWarning[] = evaluateBattlePlanQuality(
    plan,
    team,
    buildSlotOptions(team),
  ).map((issue) => ({
    planId: plan.id,
    planName: plan.name,
    severity: issue.severity === "error" ? "critical" : "warning",
    message: issue.message,
  }));

  const selectedSlots = getPlanSelectedSlots(plan);
  const selectedMembers = memberInsights.filter((member) => selectedSlots.includes(member.slot));
  if (selectedMembers.length >= 2) {
    ALL_POKEMON_TYPES.forEach((attackType) => {
      const weakCount = selectedMembers.filter(
        (member) => calculateTypeEffectiveness(attackType, member.types) > 1,
      ).length;
      if (weakCount >= 3) {
        warnings.push({
          planId: plan.id,
          planName: plan.name,
          severity: "critical",
          message: `${plan.name}: ${weakCount} bring Pokémon share a weakness to ${attackType}.`,
        });
      }
    });
  }

  if (plan.format === "double" && selectedSlots.length >= 4) {
    const selectedPokemon = team.pokemon.filter((slot) => selectedSlots.includes(slot.slot));
    const hasSpeedControl = selectedPokemon.some((slot) => slotHasSpeedControl(slot));
    if (!hasSpeedControl) {
      warnings.push({
        planId: plan.id,
        planName: plan.name,
        severity: "warning",
        message: `${plan.name}: no speed control (Tailwind / Trick Room / Icy Wind) in this bring list.`,
      });
    }
    const hasRedirection = selectedPokemon.some((slot) => slotHasRedirection(slot));
    if (!hasRedirection) {
      warnings.push({
        planId: plan.id,
        planName: plan.name,
        severity: "warning",
        message: `${plan.name}: no redirection (Follow Me / Rage Powder) in this bring list.`,
      });
    }
  }

  return warnings;
}

export function buildAllPlanCoachWarnings(
  team: ChampionsTeam,
  memberInsights: TeamMemberInsight[],
  focusPlanId: string | null,
): PlanCoachWarning[] {
  const plans = focusPlanId
    ? team.battlePlans.filter((plan) => plan.id === focusPlanId)
    : team.battlePlans;
  return plans.flatMap((plan) => buildPlanCoachWarnings(plan, team, memberInsights));
}

export function buildPlanLeadSuggestions(
  plan: ChampionsBattlePlan | null,
  memberInsights: TeamMemberInsight[],
): LeadSuggestion[] {
  if (!plan) {
    return buildLeadSuggestions(memberInsights);
  }

  const leadSlots = getPlanLeadSlots(plan);
  const leadMembers = memberInsights.filter((member) => leadSlots.includes(member.slot));
  if (leadMembers.length === 0) {
    return buildLeadSuggestions(memberInsights);
  }

  const label = plan.format === "single" ? "lead" : "lead pair";
  return [
    {
      pair: leadMembers.map((member) => member.name).join(" + "),
      rationale: `Saved ${label} for "${plan.name}" (${plan.matchupLabel || "no matchup label"}).`,
      score: 100,
    },
  ];
}

export function buildLeadSuggestions(memberInsights: TeamMemberInsight[]): LeadSuggestion[] {
  if (memberInsights.length < 2) {
    return [];
  }
  const pairs: LeadSuggestion[] = [];
  for (let i = 0; i < memberInsights.length; i += 1) {
    for (let j = i + 1; j < memberInsights.length; j += 1) {
      const a = memberInsights[i];
      const b = memberInsights[j];
      const supportScore = a.supportMoves.length + b.supportMoves.length;
      const pressureScore = a.pressureMoves.length + b.pressureMoves.length;
      const speedScore = Math.min(a.speedScore, b.speedScore);
      const score = supportScore * 2 + pressureScore + speedScore / 100;
      pairs.push({
        pair: `${a.name} + ${b.name}`,
        rationale:
          supportScore > 0
            ? "Support utility paired with immediate pressure."
            : "Fast pressure-focused opening.",
        score,
      });
    }
  }
  return pairs.sort((a, b) => b.score - a.score).slice(0, 3);
}

export function filterThreatsForScenario(
  threats: ThreatChecklistEntry[],
  scenarioId: MatchupScenarioId,
): ThreatChecklistEntry[] {
  const scenario = MATCHUP_SCENARIOS.find((entry) => entry.id === scenarioId);
  if (!scenario || !scenario.threatLabels) {
    return threats;
  }
  const labels = new Set(scenario.threatLabels);
  const filtered = threats.filter((threat) => labels.has(threat.label));
  return filtered.length > 0 ? filtered : threats;
}

export function inferScenarioFromMatchupLabel(matchupLabel: string): MatchupScenarioId {
  const normalized = matchupLabel.trim().toLowerCase();
  if (normalized.includes("rain")) {
    return "rain";
  }
  if (normalized.includes("sun")) {
    return "sun";
  }
  if (normalized.includes("trick room") || /\btr\b/.test(normalized)) {
    return "trick-room";
  }
  if (normalized.includes("hyper offense") || normalized.includes("offense")) {
    return "hyper-offense";
  }
  if (normalized.includes("ground")) {
    return "ground";
  }
  return "all";
}

function normalizeCompareToken(value: string): string {
  return value.trim().toLowerCase();
}

function spSpreadSignature(sp: ChampionsPokemon["sp"]): string {
  return `hp${sp.hp}/atk${sp.atk}/def${sp.def}/spa${sp.spa}/spd${sp.spd}/spe${sp.spe}`;
}

export function buildPresetComparison(
  preset: ChampionsPreset,
  team: ChampionsTeam,
): PresetComparisonResult {
  const diffs: PresetSlotDiff[] = [];

  for (let slotNumber = 1; slotNumber <= 6; slotNumber += 1) {
    const presetSlot = preset.team.pokemon.find((entry) => entry.slot === slotNumber);
    const teamSlot = team.pokemon.find((entry) => entry.slot === slotNumber);
    const presetName = presetSlot?.pokemonName.trim() ?? "";
    const teamName = teamSlot?.pokemonName.trim() ?? "";

    if (!presetName) {
      continue;
    }

    if (!teamName) {
      diffs.push({
        slot: slotNumber,
        pokemonName: presetName,
        status: "missing",
        changes: ["Slot empty on your team"],
      });
      continue;
    }

    const changes: string[] = [];
    if (normalizeCompareToken(presetName) !== normalizeCompareToken(teamName)) {
      changes.push(`Species: ${presetName} → ${teamName}`);
    }
    if (presetSlot && teamSlot && presetSlot.statAlignment !== teamSlot.statAlignment) {
      changes.push(`Nature: ${presetSlot.statAlignment} → ${teamSlot.statAlignment}`);
    }
    if (presetSlot && teamSlot && spSpreadSignature(presetSlot.sp) !== spSpreadSignature(teamSlot.sp)) {
      changes.push("SP spread differs from preset");
    }
    if (presetSlot && teamSlot) {
      const presetMoves = presetSlot.moves.filter((move) => move.trim()).join("|");
      const teamMoves = teamSlot.moves.filter((move) => move.trim()).join("|");
      if (normalizeCompareToken(presetMoves) !== normalizeCompareToken(teamMoves)) {
        changes.push("Moves differ from preset");
      }
      if (normalizeCompareToken(presetSlot.item ?? "") !== normalizeCompareToken(teamSlot.item ?? "")) {
        changes.push("Item differs from preset");
      }
    }

    diffs.push({
      slot: slotNumber,
      pokemonName: teamName,
      status: changes.length === 0 ? "match" : "changed",
      changes,
    });
  }

  return {
    presetName: preset.name,
    matchedSlots: diffs.filter((diff) => diff.status === "match").length,
    changedSlots: diffs.filter((diff) => diff.status !== "match").length,
    diffs,
  };
}

export function applySpHintAction(
  slot: ChampionsPokemon,
  action: SpHintAction,
  setSpBySlot: (slot: number, stat: keyof ChampionsSpSpread, value: number) => void,
): "applied" | "open_builder" {
  if (action.kind === "allocate_remaining") {
    return "open_builder";
  }
  if (action.kind === "min_speed") {
    setSpBySlot(slot.slot, "spe", Math.max(slot.sp.spe, action.target));
    return "applied";
  }
  setSpBySlot(slot.slot, "spe", 0);
  return "applied";
}

export function buildActionableSpHints(teamPokemon: ChampionsPokemon[]): SpHint[] {
  const hints: SpHint[] = [];

  teamPokemon
    .filter((slot) => slot.pokemonName.trim().length > 0)
    .forEach((slot) => {
      const totalSp = slot.sp.hp + slot.sp.atk + slot.sp.def + slot.sp.spa + slot.sp.spd + slot.sp.spe;
      if (totalSp < 66) {
        hints.push({
          slot: slot.slot,
          pokemonName: slot.pokemonName,
          hint: `Allocate remaining ${66 - totalSp} SP for immediate stat gains.`,
          action: { kind: "allocate_remaining", remaining: 66 - totalSp },
        });
        return;
      }
      if (slot.sp.spe > 0 && slot.sp.spe < 12) {
        hints.push({
          slot: slot.slot,
          pokemonName: slot.pokemonName,
          hint: "Push Speed SP to at least 12 for better speed benchmarks.",
          action: { kind: "min_speed", target: 12 },
        });
        return;
      }
      if ((slot.moves[0] || "").toLowerCase().includes("trick room") && slot.sp.spe > 0) {
        hints.push({
          slot: slot.slot,
          pokemonName: slot.pokemonName,
          hint: "Trick Room users often prefer minimal Speed SP.",
          action: { kind: "clear_speed_tr" },
        });
      }
    });

  return hints;
}

export function buildReadinessSummary(
  team: ChampionsTeam,
  memberInsights: TeamMemberInsight[],
  weaknessMap: WeaknessEntry[],
  threatChecklist: ThreatChecklistEntry[],
  options?: {
    selectedPlan?: ChampionsBattlePlan | null;
    megaInsight?: MegaDependencyInsight;
    planWarnings?: PlanCoachWarning[];
  },
): ReadinessSummary {
  const rosterSize = team.pokemon.filter((slot) => slot.pokemonName.trim().length > 0).length;
  const alerts: string[] = [];
  const tags: string[] = [];

  if (rosterSize < 6) {
    alerts.push(`Roster incomplete (${rosterSize}/6 slots filled).`);
  }

  const topWeakness = weaknessMap.find((entry) => entry.weak >= 3);
  if (topWeakness) {
    alerts.push(
      `${topWeakness.weak} Pokémon weak to ${topWeakness.type} — consider a resist or redirect.`,
    );
    tags.push(`Weak to ${topWeakness.type}`);
  }

  threatChecklist
    .filter((threat) => threat.status === "exposed")
    .forEach((threat) => {
      alerts.push(`No clear answer to ${threat.label.toLowerCase()}.`);
    });

  threatChecklist
    .filter((threat) => threat.status === "covered")
    .slice(0, 2)
    .forEach((threat) => {
      tags.push(`Answers ${threat.label.split(" ")[0]}`);
    });

  if (team.battlePlans.length === 0) {
    alerts.push("No battle plans saved — add leads and win conditions in Plans.");
  }

  options?.megaInsight?.warnings.slice(0, 2).forEach((warning) => {
    alerts.push(warning);
  });

  options?.planWarnings
    ?.filter((warning) => warning.severity === "critical")
    .slice(0, 2)
    .forEach((warning) => {
      alerts.push(warning.message);
    });

  const fastCount = memberInsights.filter((member) => member.speedScore >= 140).length;
  if (fastCount >= 2) {
    tags.push("Strong speed");
  }

  if (options?.megaInsight?.megaUsers.some((user) => user.inSelectedPlan)) {
    tags.push("Mega-ready");
  }

  let score = 10;
  score -= threatChecklist.filter((threat) => threat.status === "exposed").length * 1.5;
  score -= threatChecklist.filter((threat) => threat.status === "risky").length * 0.5;
  if (topWeakness && topWeakness.weak >= 4) {
    score -= 1;
  }
  if (rosterSize < 6) {
    score -= 1;
  }
  if (team.battlePlans.length === 0) {
    score -= 0.5;
  }
  if (options?.megaInsight?.planMissingMega) {
    score -= 0.75;
  }
  if (options?.megaInsight?.multipleMegaUsers) {
    score -= 0.5;
  }
  score -= (options?.planWarnings?.filter((warning) => warning.severity === "critical").length ?? 0) * 0.5;
  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

  let label = "Battle ready";
  if (score < 5) {
    label = "Needs work";
  } else if (score < 7.5) {
    label = "Solid foundation";
  } else if (score < 9) {
    label = "Competitive shape";
  }

  if (options?.selectedPlan) {
    label = `${label} · ${options.selectedPlan.name}`;
  }

  return { score, label, alerts: alerts.slice(0, 5), tags: tags.slice(0, 4) };
}
