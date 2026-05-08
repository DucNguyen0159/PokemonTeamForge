import type { Team } from "@/types/team";

export function formatShowdownExport(team: Team): string {
  const activeSlots = team.pokemon.filter((slot) => slot.pokemon !== null);

  const blocks = activeSlots.map((slot) => {
    const pokemon = slot.pokemon!;
    const lines: string[] = [];

    lines.push(
      slot.selectedItem
        ? `${pokemon.name} @ ${slot.selectedItem.name}`
        : `${pokemon.name}`,
    );

    if (slot.selectedAbility) {
      lines.push(`Ability: ${slot.selectedAbility.name}`);
    }

    slot.moves
      .map((entry) => entry.move?.name)
      .filter((moveName): moveName is string => Boolean(moveName))
      .forEach((moveName) => {
        lines.push(`- ${moveName}`);
      });

    return lines.join("\n");
  });

  return blocks.join("\n\n");
}

