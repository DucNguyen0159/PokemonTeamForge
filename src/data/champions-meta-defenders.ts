import type { ChampionsSpSpread } from "@/types/champions";

export type MetaDefenderPreset = {
  species: string;
  label: string;
  ability?: string;
  item?: string;
  nature?: string;
  sp?: Partial<ChampionsSpSpread>;
};

/** Common defensive benchmarks for quick Damage Lab setup. SP totals ≤ 66. */
export const CHAMPIONS_META_DEFENDERS: MetaDefenderPreset[] = [
  {
    species: "Incineroar",
    label: "Incineroar",
    item: "Safety Goggles",
    nature: "Careful",
    sp: { hp: 32, def: 2, spa: 0, spd: 32, atk: 0, spe: 0 },
  },
  {
    species: "Snorlax",
    label: "Snorlax",
    item: "Leftovers",
    nature: "Impish",
    sp: { hp: 32, def: 32, spa: 0, spd: 2, atk: 0, spe: 0 },
  },
  {
    species: "Amoonguss",
    label: "Amoonguss",
    item: "Sitrus Berry",
    nature: "Bold",
    sp: { hp: 32, def: 32, spa: 0, spd: 2, atk: 0, spe: 0 },
  },
  {
    species: "Rillaboom",
    label: "Rillaboom",
    item: "Assault Vest",
    nature: "Careful",
    sp: { hp: 32, def: 2, spa: 0, spd: 32, atk: 0, spe: 0 },
  },
  {
    species: "Urshifu",
    label: "Urshifu",
    item: "Focus Sash",
    nature: "Jolly",
    sp: { hp: 0, def: 2, spa: 0, spd: 0, atk: 32, spe: 32 },
  },
  {
    species: "Tornadus",
    label: "Tornadus",
    item: "Covert Cloak",
    nature: "Timid",
    sp: { hp: 0, def: 0, spa: 32, spd: 2, atk: 0, spe: 32 },
  },
];
