import { classifyPokemonFormFromSlug } from "@/lib/pokemon/pokemon-forms";
import type { Move } from "@/types/move";
import type { PokemonType } from "@/types/shared";
import type { SelectedMove } from "@/types/team";

type GmaxSignatureMove = {
  moveName: string;
  type: PokemonType;
};

export type GmaxPreviewRow = {
  slot: 1 | 2 | 3 | 4;
  selectedMoveName: string;
  selectedMoveType?: PokemonType;
  resultMoveName: string;
  resultMoveType?: PokemonType;
};

const MAX_MOVE_BY_TYPE: Record<PokemonType, string> = {
  normal: "Max Strike",
  fire: "Max Flare",
  water: "Max Geyser",
  electric: "Max Lightning",
  grass: "Max Overgrowth",
  ice: "Max Hailstorm",
  fighting: "Max Knuckle",
  poison: "Max Ooze",
  ground: "Max Quake",
  flying: "Max Airstream",
  psychic: "Max Mindstorm",
  bug: "Max Flutterby",
  rock: "Max Rockfall",
  ghost: "Max Phantasm",
  dragon: "Max Wyrmwind",
  dark: "Max Darkness",
  steel: "Max Steelspike",
  fairy: "Max Starfall",
};

const GMAX_SIGNATURE_BY_BASE_SLUG: Partial<Record<string, GmaxSignatureMove>> = {
  alcremie: { moveName: "G-Max Finale", type: "fairy" },
  appletun: { moveName: "G-Max Sweetness", type: "grass" },
  blastoise: { moveName: "G-Max Cannonade", type: "water" },
  butterfree: { moveName: "G-Max Befuddle", type: "bug" },
  centiskorch: { moveName: "G-Max Centiferno", type: "fire" },
  charizard: { moveName: "G-Max Wildfire", type: "fire" },
  cinderace: { moveName: "G-Max Fireball", type: "fire" },
  coalossal: { moveName: "G-Max Volcalith", type: "rock" },
  copperajah: { moveName: "G-Max Steelsurge", type: "steel" },
  corviknight: { moveName: "G-Max Wind Rage", type: "flying" },
  drednaw: { moveName: "G-Max Stonesurge", type: "water" },
  duraludon: { moveName: "G-Max Depletion", type: "dragon" },
  eevee: { moveName: "G-Max Cuddle", type: "normal" },
  flapple: { moveName: "G-Max Tartness", type: "grass" },
  garbodor: { moveName: "G-Max Malodor", type: "poison" },
  gengar: { moveName: "G-Max Terror", type: "ghost" },
  grimmsnarl: { moveName: "G-Max Snooze", type: "dark" },
  hatterene: { moveName: "G-Max Smite", type: "fairy" },
  inteleon: { moveName: "G-Max Hydrosnipe", type: "water" },
  kingler: { moveName: "G-Max Foam Burst", type: "water" },
  lapras: { moveName: "G-Max Resonance", type: "ice" },
  machamp: { moveName: "G-Max Chi Strike", type: "fighting" },
  melmetal: { moveName: "G-Max Meltdown", type: "steel" },
  meowth: { moveName: "G-Max Gold Rush", type: "normal" },
  orbeetle: { moveName: "G-Max Gravitas", type: "psychic" },
  pikachu: { moveName: "G-Max Volt Crash", type: "electric" },
  rillaboom: { moveName: "G-Max Drum Solo", type: "grass" },
  sandaconda: { moveName: "G-Max Sandblast", type: "ground" },
  snorlax: { moveName: "G-Max Replenish", type: "normal" },
  toxtricity: { moveName: "G-Max Stun Shock", type: "electric" },
  urshifu: { moveName: "G-Max One Blow / Rapid Flow", type: "dark" },
  venusaur: { moveName: "G-Max Vine Lash", type: "grass" },
};

function signatureForSlug(pokemonSlug: string): GmaxSignatureMove | null {
  const form = classifyPokemonFormFromSlug(pokemonSlug);
  if (form.formKind !== "gigantamax") {
    return null;
  }

  const baseSlug = form.baseSlug ?? pokemonSlug.replace(/-(?:gmax|gigantamax)$/, "");
  return GMAX_SIGNATURE_BY_BASE_SLUG[baseSlug] ?? null;
}

function resultForMove(selectedMove: Move | null, signature: GmaxSignatureMove | null): {
  resultMoveName: string;
  resultMoveType?: PokemonType;
} {
  if (!selectedMove) {
    return { resultMoveName: "—" };
  }

  if (selectedMove.category === "status") {
    return { resultMoveName: "Max Guard" };
  }

  if (signature && selectedMove.type === signature.type) {
    return { resultMoveName: signature.moveName, resultMoveType: signature.type };
  }

  return {
    resultMoveName: MAX_MOVE_BY_TYPE[selectedMove.type],
    resultMoveType: selectedMove.type,
  };
}

export function buildGmaxPreviewRows(
  pokemonSlug: string,
  selectedMoves: SelectedMove[],
): {
  isGigantamax: boolean;
  signatureMove: GmaxSignatureMove | null;
  rows: GmaxPreviewRow[];
} {
  const form = classifyPokemonFormFromSlug(pokemonSlug);
  const isGigantamax = form.formKind === "gigantamax";
  const signatureMove = isGigantamax ? signatureForSlug(pokemonSlug) : null;

  const rows: GmaxPreviewRow[] = selectedMoves.map((entry) => {
    const result = resultForMove(entry.move, signatureMove);
    return {
      slot: entry.slot,
      selectedMoveName: entry.move?.name ?? "—",
      selectedMoveType: entry.move?.type,
      resultMoveName: result.resultMoveName,
      resultMoveType: result.resultMoveType,
    };
  });

  return {
    isGigantamax,
    signatureMove,
    rows,
  };
}
