import { FORMAT_RULES } from "@/data/format-rules";
import { MOVE_TAGS } from "@/data/move-tags";
import type {
  ChecklistItem,
  ChecklistMatch,
  ChecklistSection,
  TeamChecklistResult,
} from "@/types/checklist";
import type { MoveTag } from "@/types/move";
import type { BattleFormat, TeamRole } from "@/types/shared";
import type { Team } from "@/types/team";

import { getActiveTeamSlots } from "./shared/team-helpers";

const MOVE_TAG_LABELS: Record<MoveTag, string> = {
  entry_hazard: "Entry Hazard",
  hazard_removal: "Hazard Removal",
  recovery: "Recovery",
  pivot: "Pivot",
  setup: "Setup Sweeper",
  status: "Status Utility",
  priority: "Priority",
  protect: "Protect",
  fake_out: "Fake Out",
  spread: "Spread Pressure",
  speed_control: "Speed Control",
  weather: "Weather Support",
  trick_room: "Trick Room",
  redirection: "Redirection",
  phazing: "Phazing",
  trap: "Trap Utility",
};

const MOVE_TAG_DESCRIPTIONS: Record<MoveTag, string> = {
  entry_hazard: "At least one selected move should apply entry hazards.",
  hazard_removal: "At least one selected move should remove hazards.",
  recovery: "At least one selected move should provide reliable recovery.",
  pivot: "At least one selected move should support switching momentum.",
  setup: "At least one selected move should provide setup pressure.",
  status: "At least one selected move should spread status or disrupt.",
  priority: "At least one selected move should provide priority pressure.",
  protect: "At least one selected move should provide Protect utility.",
  fake_out: "At least one selected move should provide Fake Out support.",
  spread: "At least one selected move should provide spread pressure.",
  speed_control: "At least one selected move should control speed.",
  weather: "At least one selected move should support weather plans.",
  trick_room: "At least one selected move should support Trick Room plans.",
  redirection: "At least one selected move should provide redirection support.",
  phazing: "At least one selected move should provide phazing utility.",
  trap: "At least one selected move should provide trapping utility.",
};

const ROLE_LABELS: Record<TeamRole, string> = {
  physical_attacker: "Physical Attacker",
  special_attacker: "Special Attacker",
  mixed_attacker: "Mixed Attacker",
  physical_wall: "Physical Wall",
  special_wall: "Special Wall",
  tank: "Tank",
  support: "Support",
  pivot: "Pivot",
  hazard_setter: "Hazard Setter",
  hazard_remover: "Hazard Remover",
  setup_sweeper: "Setup Sweeper",
  wallbreaker: "Wallbreaker",
  speed_control: "Speed Control",
  weather_setter: "Weather Setter",
  weather_abuser: "Weather Abuser",
  trick_room_setter: "Trick Room Setter",
  trick_room_abuser: "Trick Room Abuser",
  intimidate_support: "Intimidate Support",
  redirection_support: "Redirection Support",
  status_spreader: "Status Spreader",
  priority_user: "Priority User",
  trap_user: "Trap User",
};

function getMoveTags(moveSlug: string, intrinsicTags?: MoveTag[]): MoveTag[] {
  const staticTags = MOVE_TAGS[moveSlug] ?? [];
  const combined = [...(intrinsicTags ?? []), ...staticTags];

  return Array.from(new Set(combined));
}

function createMoveTagChecklistItem(team: Team, moveTag: MoveTag): ChecklistItem {
  const matches: ChecklistMatch[] = [];
  const activeSlots = getActiveTeamSlots(team);

  activeSlots.forEach((slot) => {
    const matchingMove = slot.moves.find((selectedMove) => {
      const move = selectedMove.move;
      if (!move) {
        return false;
      }

      return getMoveTags(move.slug, move.tags).includes(moveTag);
    });

    if (!matchingMove?.move) {
      return;
    }

    matches.push({
      pokemonId: slot.pokemon.id,
      pokemonName: slot.pokemon.name,
      reason: `Has ${matchingMove.move.name}`,
    });
  });

  return {
    id: moveTag,
    label: MOVE_TAG_LABELS[moveTag],
    description: MOVE_TAG_DESCRIPTIONS[moveTag],
    isCompleted: matches.length > 0,
    matchedPokemon: matches,
  };
}

function createRoleChecklistItem(team: Team, role: TeamRole): ChecklistItem {
  const activeSlots = getActiveTeamSlots(team);
  const matches: ChecklistMatch[] = activeSlots
    .filter((slot) => slot.pokemon.roles.includes(role))
    .map((slot) => ({
      pokemonId: slot.pokemon.id,
      pokemonName: slot.pokemon.name,
      reason: `Covers ${ROLE_LABELS[role]} role`,
    }));

  return {
    id: role,
    label: ROLE_LABELS[role],
    description: `Team should include a ${ROLE_LABELS[role].toLowerCase()} role.`,
    isCompleted: matches.length > 0,
    matchedPokemon: matches,
  };
}

function calculateCompletionPercentage(sections: ChecklistSection[]): number {
  const allItems = sections.flatMap((section) => section.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter((item) => item.isCompleted).length;

  if (totalItems === 0) {
    return 0;
  }

  return Math.round((completedItems / totalItems) * 100);
}

export function calculateTeamChecklist(
  team: Team,
  format: BattleFormat,
): TeamChecklistResult {
  const rules = FORMAT_RULES[format].checklist;

  const sections: ChecklistSection[] = [
    {
      id: "required_move_tags",
      title: "Required Move Utility",
      items: rules.requiredMoveTags.map((tag) => createMoveTagChecklistItem(team, tag)),
    },
    {
      id: "required_roles",
      title: "Required Team Roles",
      items: rules.requiredRoles.map((role) => createRoleChecklistItem(team, role)),
    },
    {
      id: "recommended_move_tags",
      title: "Recommended Move Utility",
      items: rules.recommendedMoveTags.map((tag) => createMoveTagChecklistItem(team, tag)),
    },
    {
      id: "recommended_roles",
      title: "Recommended Team Roles",
      items: rules.recommendedRoles.map((role) => createRoleChecklistItem(team, role)),
    },
  ];

  return {
    format,
    sections,
    completionPercentage: calculateCompletionPercentage(sections),
  };
}
