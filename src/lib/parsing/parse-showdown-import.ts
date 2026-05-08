export interface ParsedImportSet {
  species: string;
  item?: string;
  ability?: string;
  moves: string[];
}

export interface ShowdownImportParseResult {
  raw: string;
  isValid: boolean;
  sets: ParsedImportSet[];
  errors: string[];
  warnings: string[];
}

function normalizeLine(line: string): string {
  return line.replace(/\r/g, "").trim();
}

function extractSpecies(firstLine: string): { species: string; item?: string } {
  const [left, right] = firstLine.split(/\s+@\s+/, 2);
  const item = right?.trim() ? right.trim() : undefined;

  const withSpeciesInParens = left.match(/\(([^)]+)\)\s*$/);
  const species = withSpeciesInParens ? withSpeciesInParens[1] : left;

  return { species: species.trim(), item };
}

export function parseShowdownImport(input: string): ShowdownImportParseResult {
  const raw = input ?? "";
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      raw,
      isValid: false,
      sets: [],
      errors: ["Import text is empty."],
      warnings: [],
    };
  }

  const blocks = trimmed
    .split(/\n\s*\n+/)
    .map((block) => block.split("\n").map(normalizeLine).filter(Boolean))
    .filter((lines) => lines.length > 0);

  const sets: ParsedImportSet[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  blocks.forEach((lines, index) => {
    const slotLabel = `Set ${index + 1}`;
    const firstLine = lines[0];
    const { species, item } = extractSpecies(firstLine);

    if (!species) {
      errors.push(`${slotLabel}: missing Pokémon name.`);
      return;
    }

    let ability: string | undefined;
    const moves: string[] = [];

    lines.slice(1).forEach((line) => {
      if (line.startsWith("Ability:")) {
        ability = line.slice("Ability:".length).trim() || undefined;
        return;
      }

      if (line.startsWith("-")) {
        const moveName = line.replace(/^-+\s*/, "").trim();
        if (moveName) {
          moves.push(moveName);
        }
        return;
      }

      if (
        line.startsWith("EVs:") ||
        line.startsWith("IVs:") ||
        /\sNature$/i.test(line)
      ) {
        warnings.push(
          `${slotLabel}: ignored unsupported line "${line}" (EV/IV/Nature not used in MVP).`,
        );
        return;
      }

      warnings.push(`${slotLabel}: ignored line "${line}".`);
    });

    if (moves.length === 0) {
      warnings.push(`${slotLabel}: no moves provided.`);
    }

    sets.push({
      species,
      item,
      ability,
      moves: moves.slice(0, 4),
    });
  });

  if (sets.length > 6) {
    warnings.push("Only the first 6 sets will be imported.");
  }

  return {
    raw,
    isValid: errors.length === 0 && sets.length > 0,
    sets: sets.slice(0, 6),
    errors,
    warnings,
  };
}
