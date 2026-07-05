export type NatureStat = "atk" | "def" | "spa" | "spd" | "spe";

export type ChampionsNature = {
  name: string;
  increasedStat: NatureStat | null;
  decreasedStat: NatureStat | null;
};

export const CHAMPIONS_NATURES: ChampionsNature[] = [
  { name: "Hardy", increasedStat: null, decreasedStat: null },
  { name: "Lonely", increasedStat: "atk", decreasedStat: "def" },
  { name: "Brave", increasedStat: "atk", decreasedStat: "spe" },
  { name: "Adamant", increasedStat: "atk", decreasedStat: "spa" },
  { name: "Naughty", increasedStat: "atk", decreasedStat: "spd" },
  { name: "Bold", increasedStat: "def", decreasedStat: "atk" },
  { name: "Docile", increasedStat: null, decreasedStat: null },
  { name: "Relaxed", increasedStat: "def", decreasedStat: "spe" },
  { name: "Impish", increasedStat: "def", decreasedStat: "spa" },
  { name: "Lax", increasedStat: "def", decreasedStat: "spd" },
  { name: "Timid", increasedStat: "spe", decreasedStat: "atk" },
  { name: "Hasty", increasedStat: "spe", decreasedStat: "def" },
  { name: "Serious", increasedStat: null, decreasedStat: null },
  { name: "Jolly", increasedStat: "spe", decreasedStat: "spa" },
  { name: "Naive", increasedStat: "spe", decreasedStat: "spd" },
  { name: "Modest", increasedStat: "spa", decreasedStat: "atk" },
  { name: "Mild", increasedStat: "spa", decreasedStat: "def" },
  { name: "Quiet", increasedStat: "spa", decreasedStat: "spe" },
  { name: "Bashful", increasedStat: null, decreasedStat: null },
  { name: "Rash", increasedStat: "spa", decreasedStat: "spd" },
  { name: "Calm", increasedStat: "spd", decreasedStat: "atk" },
  { name: "Gentle", increasedStat: "spd", decreasedStat: "def" },
  { name: "Sassy", increasedStat: "spd", decreasedStat: "spe" },
  { name: "Careful", increasedStat: "spd", decreasedStat: "spa" },
  { name: "Quirky", increasedStat: null, decreasedStat: null },
];

export function formatNatureOptionLabel(nature: ChampionsNature): string {
  if (!nature.increasedStat || !nature.decreasedStat) {
    return `${nature.name} (neutral)`;
  }
  return `${nature.name} (+${nature.increasedStat.toUpperCase()}, -${nature.decreasedStat.toUpperCase()})`;
}
