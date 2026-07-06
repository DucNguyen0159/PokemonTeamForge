import { ROUTES } from "@/constants/routes";
import {
  evaluateChampionsTeamLegality,
  type ChampionsLegalityIssue,
} from "@/lib/champions/legality";
import type { ChampionsTeam } from "@/types/champions";

export type ActiveTeamCloudState = "local" | "saved" | "published";

export type ActiveTeamSnapshot = {
  rosterFilled: number;
  rosterTotal: number;
  firstEmptySlot: number | null;
  spAllocatedTotal: number;
  spBudgetTotal: number;
  spBySlot: Record<number, number>;
  battlePlanCount: number;
  singlesPlanCount: number;
  doublesPlanCount: number;
  errorCount: number;
  warningCount: number;
  cloudState: ActiveTeamCloudState;
  issues: ChampionsLegalityIssue[];
};

export type ActiveTeamNextStep = {
  label: string;
  href: string;
  priority: number;
  reason: string;
  secondary?: { label: string; href: string };
};

export function slotSpTotal(
  sp: ChampionsTeam["pokemon"][number]["sp"],
): number {
  return sp.hp + sp.atk + sp.def + sp.spa + sp.spd + sp.spe;
}

export function hasMeaningfulChampionsTeam(team: ChampionsTeam): boolean {
  const hasPokemon = team.pokemon.some((slot) => slot.pokemonName.trim().length > 0);
  const hasPlans = team.battlePlans.length > 0;
  const hasCustomName =
    team.name.trim().length > 0 && team.name.trim() !== "Untitled Champions Team";
  const hasNotes = Boolean(team.teamNotes?.trim());
  return hasPokemon || hasPlans || hasCustomName || hasNotes;
}

export function buildActiveTeamSnapshot(team: ChampionsTeam): ActiveTeamSnapshot {
  const filledSlots = team.pokemon.filter((slot) => slot.pokemonName.trim().length > 0);
  const firstEmpty = team.pokemon.find((slot) => !slot.pokemonName.trim());
  const spBySlot: Record<number, number> = {};
  let spAllocatedTotal = 0;

  filledSlots.forEach((slot) => {
    const total = slotSpTotal(slot.sp);
    spBySlot[slot.slot] = total;
    spAllocatedTotal += total;
  });

  const issues = evaluateChampionsTeamLegality(team);
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  let cloudState: ActiveTeamCloudState = "local";
  if (team.id) {
    cloudState = team.isPublic ? "published" : "saved";
  }

  return {
    rosterFilled: filledSlots.length,
    rosterTotal: 6,
    firstEmptySlot: firstEmpty?.slot ?? null,
    spAllocatedTotal,
    spBudgetTotal: filledSlots.length * 66,
    spBySlot,
    battlePlanCount: team.battlePlans.length,
    singlesPlanCount: team.battlePlans.filter((plan) => plan.format === "single").length,
    doublesPlanCount: team.battlePlans.filter((plan) => plan.format === "double").length,
    errorCount,
    warningCount,
    cloudState,
    issues,
  };
}

export function buildActiveTeamNextStep(
  snapshot: ActiveTeamSnapshot,
  team?: ChampionsTeam,
): ActiveTeamNextStep {
  if (snapshot.rosterFilled === 0) {
    return {
      label: "Browse Strategy Presets",
      href: ROUTES.championsPresets,
      priority: 1,
      reason: "Start with a curated 6-Pokémon roster and battle plans.",
      secondary: { label: "Build from scratch", href: ROUTES.championsBuilder },
    };
  }

  if (snapshot.rosterFilled < snapshot.rosterTotal && snapshot.firstEmptySlot) {
    return {
      label: `Fill slot ${snapshot.firstEmptySlot}`,
      href: `${ROUTES.championsBuilder}?slot=${snapshot.firstEmptySlot}`,
      priority: 2,
      reason: `Roster incomplete (${snapshot.rosterFilled}/${snapshot.rosterTotal}).`,
      secondary: { label: "Browse presets", href: ROUTES.championsPresets },
    };
  }

  if (snapshot.errorCount > 0) {
    return {
      label: "Fix legality errors",
      href: `${ROUTES.championsBuilder}?issues=open`,
      priority: 3,
      reason: `${snapshot.errorCount} blocking error${snapshot.errorCount === 1 ? "" : "s"} must be resolved.`,
    };
  }

  if (snapshot.battlePlanCount === 0) {
    return {
      label: "Create your first battle plan",
      href: `${ROUTES.championsBuilder}?tab=plans`,
      priority: 4,
      reason: "Add 3v3/4v4 bring lists and lead picks for matchups.",
      secondary: { label: "Open Matchup Coach", href: ROUTES.championsCoach },
    };
  }

  // Warnings only — prefer Coach over Plans for prioritization (documented product choice).
  if (snapshot.warningCount > 0) {
    return {
      label: "Review in Matchup Coach",
      href: ROUTES.championsCoach,
      priority: 5,
      reason: `${snapshot.warningCount} quality warning${snapshot.warningCount === 1 ? "" : "s"} — coach helps prioritize fixes.`,
      secondary: { label: "Edit battle plans", href: `${ROUTES.championsBuilder}?tab=plans` },
    };
  }

  if (snapshot.cloudState === "published" && team?.id) {
    return {
      label: "View public team page",
      href: `${ROUTES.championsCommunity}/${team.id}`,
      priority: 7,
      reason: "Your team is published to the community.",
      secondary: { label: "Run Damage Lab", href: ROUTES.championsDamage },
    };
  }

  if (snapshot.cloudState === "saved") {
    return {
      label: "Publish to Community",
      href: ROUTES.championsCommunity,
      priority: 6,
      reason: "Team is saved and legality-clean — share it with the community.",
      secondary: { label: "Run Damage Lab", href: ROUTES.championsDamage },
    };
  }

  return {
    label: "Save to cloud",
    href: `${ROUTES.championsBuilder}?tab=settings&save=1`,
    priority: 6,
    reason: "Roster and plans look ready — save to keep your work.",
    secondary: { label: "Run Damage Lab", href: ROUTES.championsDamage },
  };
}

export function cloudStateLabel(state: ActiveTeamCloudState): string {
  switch (state) {
    case "published":
      return "Published";
    case "saved":
      return "Cloud saved";
    default:
      return "Local draft";
  }
}
