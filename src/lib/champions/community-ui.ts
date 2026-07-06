export function communityFormatSupportLabel(
  formatSupport: "single" | "double" | "both",
): string {
  if (formatSupport === "single") {
    return "Singles 3v3";
  }
  if (formatSupport === "double") {
    return "Doubles 4v4";
  }
  return "Singles & Doubles";
}

export const COMMUNITY_LIST_LIMIT = 100;

/** Compact label for community team card roster tiles. */
export function communityCardPokemonLabel(name: string): string {
  return name
    .replace(/\s+Disguised$/i, "")
    .replace(/\s+Family of Four$/i, "")
    .replace(/\s+Male$/i, "")
    .replace(/\s+Female$/i, "")
    .replace(/^Rotom\s+Wash$/i, "Rotom-W")
    .replace(/^Ninetales\s+Alola$/i, "A-Ninetales")
    .trim();
}

export function communityCommentLabel(count: number): string {
  return count === 1 ? "1 comment" : `${count} comments`;
}
