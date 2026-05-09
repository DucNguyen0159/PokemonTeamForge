import type { StrategyPresetPokemonRef, StrategyTeamPreset } from "@/data/strategy-teams";
import type { Item } from "@/types/item";
import type { PokemonDetail } from "@/types/pokemon";
import type { StrategyTeam } from "@/types/strategy";

export type StrategyResolvers = {
  resolvePokemon: (slug: string) => Promise<PokemonDetail | null>;
  resolveItem: (name: string) => Item | null;
};

async function resolveStrategySlot(
  input: StrategyPresetPokemonRef,
  resolvers: StrategyResolvers,
) {
  const pokemon = await resolvers.resolvePokemon(input.pokemonSlug);
  if (!pokemon) {
    throw new Error(`Strategy preset references unknown Pokemon: ${input.pokemonSlug}`);
  }

  const ability =
    pokemon.abilities.find((entry) => entry.name === input.abilityName) ??
    pokemon.abilities[0] ??
    null;
  if (!ability) {
    throw new Error(`Strategy preset cannot resolve any ability for ${pokemon.name}.`);
  }
  if (!pokemon.abilities.some((entry) => entry.name === input.abilityName)) {
    console.error(
      `[Strategy Preset] Missing ability "${input.abilityName}" for ${pokemon.name}; using "${ability.name}".`,
    );
  }

  const item = resolvers.resolveItem(input.itemName) ?? resolvers.resolveItem("Leftovers");
  if (!item) {
    throw new Error(
      `Strategy preset references unknown item "${input.itemName}" and no fallback is available.`,
    );
  }
  if (item.name !== input.itemName) {
    console.error(
      `[Strategy Preset] Missing item "${input.itemName}" for ${pokemon.name}; using "${item.name}".`,
    );
  }

  const moves = input.moveNames
    .map((moveName) => pokemon.moves.find((entry) => entry.name === moveName) ?? null)
    .filter((move): move is NonNullable<typeof move> => Boolean(move));

  const resolvedMoves = moves.length > 0 ? moves : pokemon.moves.slice(0, 4);
  if (moves.length === 0) {
    console.error(
      `[Strategy Preset] Missing all configured moves for ${pokemon.name} (${input.moveNames.join(", ")}); using default learnset moves.`,
    );
  }
  if (resolvedMoves.length === 0) {
    throw new Error(`Strategy preset cannot resolve any moves for ${pokemon.name}.`);
  }

  return {
    slot: input.slot,
    pokemon,
    ability,
    item,
    moves: resolvedMoves.slice(0, 4),
    role: input.role,
    explanation: input.explanation,
  };
}

export async function hydrateStrategyPresetWithResolvers(
  preset: StrategyTeamPreset,
  resolvers: StrategyResolvers,
): Promise<StrategyTeam> {
  const resolvedPokemon = await Promise.all(
    preset.pokemon.slice(0, 6).map((slot) => resolveStrategySlot(slot, resolvers)),
  );

  return {
    id: preset.id,
    name: preset.name,
    slug: preset.slug,
    strategyType: preset.strategyType,
    format: preset.format,
    difficulty: preset.difficulty,
    tags: preset.tags,
    shortDescription: preset.shortDescription,
    pokemon: resolvedPokemon,
  };
}
