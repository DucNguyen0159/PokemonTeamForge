// Niche non-final Pokemon that can be legitimate battle-ready recommendations
// because of Eviolite, Light Ball, Friend Guard, Prankster, or similar utility.
export const RECOMMENDATION_ALLOWED_PRE_EVOLUTIONS = [
  "chansey",
  "clefairy",
  "dusclops",
  "gligar",
  "haunter",
  "magneton",
  "misdreavus",
  "murkrow",
  "pikachu",
  "porygon2",
  "scyther",
  "tangela",
] as const;

export const RECOMMENDATION_ALLOWED_PRE_EVOLUTION_SET = new Set<string>(
  RECOMMENDATION_ALLOWED_PRE_EVOLUTIONS,
);
