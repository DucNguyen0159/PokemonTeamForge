export function getPokemonSpritePath(name: string, variant: "normal" | "shiny" = "normal"): string {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
  return `/sprites/${variant}/${slug}.png`;
}
