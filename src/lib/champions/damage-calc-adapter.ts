import { Field, Move, Pokemon, calculate, Generations } from "@smogon/calc";

import type { ChampionsSpSpread } from "@/types/champions";
import {
  isMegaStoneCompatibleWithSpecies,
  resolveMegaPokemonSlugForShowdown,
} from "@/data/champions-mega-stones";

export type ChampionsCalcGeneration = 6 | 7 | 9;

export type ChampionsCalcSideInput = {
  species: string;
  ability?: string;
  item?: string;
  nature?: string;
  sp: ChampionsSpSpread;
  status?: "" | "brn" | "par" | "psn" | "tox" | "slp" | "frz";
  boostAtk?: number;
  boostDef?: number;
  boostSpA?: number;
  boostSpD?: number;
  boostSpe?: number;
  useMega?: boolean;
  megaStone?: string;
};

export type ChampionsCalcFieldInput = {
  weather?: "" | "Sun" | "Rain" | "Sand" | "Snow";
  terrain?: "" | "Electric" | "Grassy" | "Misty" | "Psychic";
  isReflect?: boolean;
  isLightScreen?: boolean;
};

export type ChampionsCalcInput = {
  generation: ChampionsCalcGeneration;
  attacker: ChampionsCalcSideInput;
  defender: ChampionsCalcSideInput;
  moveName: string;
  isCrit?: boolean;
  field?: ChampionsCalcFieldInput;
};

export type ChampionsCalcOutput = {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  description: string;
  fullDescription: string;
  koText: string;
  maxHp: number;
  warnings: string[];
  isNonDamaging: boolean;
};

function toEvFromSp(spValue: number): number {
  const sp = Number.isFinite(spValue) ? Math.max(0, Math.min(32, Math.floor(spValue))) : 0;
  if (sp === 0) {
    return 0;
  }
  const converted = 4 + (sp - 1) * 8;
  return Math.min(252, converted);
}

function toEvs(sp: ChampionsSpSpread) {
  return {
    hp: toEvFromSp(sp.hp),
    atk: toEvFromSp(sp.atk),
    def: toEvFromSp(sp.def),
    spa: toEvFromSp(sp.spa),
    spd: toEvFromSp(sp.spd),
    spe: toEvFromSp(sp.spe),
  };
}

function clampBoost(value: number | undefined): number {
  if (!Number.isFinite(value ?? 0)) {
    return 0;
  }
  return Math.max(-6, Math.min(6, Math.trunc(value ?? 0)));
}

function megaFormFromInput(species: string, megaStone?: string): string {
  const cleanedSpecies = species.trim();
  if (!cleanedSpecies) {
    return cleanedSpecies;
  }
  if (megaStone?.trim()) {
    const resolved = resolveMegaPokemonSlugForShowdown(cleanedSpecies, megaStone);
    if (resolved) {
      return resolved;
    }
  }
  return `${cleanedSpecies}-Mega`;
}

function createCalcPokemon(
  generation: ChampionsCalcGeneration,
  input: ChampionsCalcSideInput,
  warnings: string[],
): Pokemon {
  const gen = Generations.get(generation);
  const attempts: string[] = [];
  const baseSpecies = input.species.trim();
  if (!baseSpecies) {
    throw new Error("Species name is required.");
  }
  attempts.push(baseSpecies);
  if (input.useMega) {
    if (!input.megaStone?.trim()) {
      warnings.push(`Mega toggle enabled for ${baseSpecies}, but no Mega Stone was provided.`);
    } else if (!isMegaStoneCompatibleWithSpecies(baseSpecies, input.megaStone)) {
      warnings.push(
        `Mega Stone "${input.megaStone}" may not be compatible with ${baseSpecies}; calc may fall back to base form.`,
      );
    }
    attempts.unshift(megaFormFromInput(baseSpecies, input.megaStone));
  }

  let lastError: unknown = null;
  for (const candidate of attempts) {
    try {
      const calcPokemon = new Pokemon(gen, candidate, {
        level: 50,
        ability: input.ability?.trim() || undefined,
        item: input.item?.trim() || undefined,
        nature: input.nature?.trim() || "Serious",
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        evs: toEvs(input.sp),
        boosts: {
          atk: clampBoost(input.boostAtk),
          def: clampBoost(input.boostDef),
          spa: clampBoost(input.boostSpA),
          spd: clampBoost(input.boostSpD),
          spe: clampBoost(input.boostSpe),
        },
        status: input.status || "",
      });
      if (input.useMega && candidate === baseSpecies) {
        warnings.push(
          `Mega form "${megaFormFromInput(baseSpecies, input.megaStone)}" is unavailable in Gen ${generation}; used base species.`,
        );
      }
      return calcPokemon;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to build calculator Pokemon for "${baseSpecies}". ${
      lastError instanceof Error ? lastError.message : "Check species, nature, ability, and item."
    }`,
  );
}

export function calculateChampionsDamage(input: ChampionsCalcInput): ChampionsCalcOutput {
  const warnings: string[] = [];
  const gen = Generations.get(input.generation);
  const moveName = input.moveName.trim();
  if (!moveName) {
    throw new Error("Move name is required.");
  }

  const attacker = createCalcPokemon(input.generation, input.attacker, warnings);
  const defender = createCalcPokemon(input.generation, input.defender, warnings);
  const move = new Move(gen, moveName, { isCrit: Boolean(input.isCrit) });
  const field = new Field({
    gameType: "Singles",
    weather: input.field?.weather || undefined,
    terrain: input.field?.terrain || undefined,
    attackerSide: {},
    defenderSide: {
      isReflect: Boolean(input.field?.isReflect),
      isLightScreen: Boolean(input.field?.isLightScreen),
    },
  });

  const result = calculate(gen, attacker, defender, move, field);
  const [minDamage, maxDamage] = result.range();
  const maxHp = defender.maxHP();
  const minPercent = maxHp > 0 ? (minDamage / maxHp) * 100 : 0;
  const maxPercent = maxHp > 0 ? (maxDamage / maxHp) * 100 : 0;
  const isNonDamaging = move.category === "Status" || (minDamage === 0 && maxDamage === 0);

  let koText: string;
  if (isNonDamaging) {
    koText = "This move does not deal damage.";
  } else {
    try {
      koText = result.kochance().text;
    } catch {
      koText = "KO chance unavailable for this calculation.";
    }
  }

  return {
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    description: result.desc(),
    fullDescription: result.fullDesc("px"),
    koText,
    maxHp,
    warnings,
    isNonDamaging,
  };
}
