# TypeScript Interfaces

## Overview

This document defines the core TypeScript interfaces and types for PokemonTeamForge.

The purpose of this file is to ensure:
- consistent data shapes
- predictable component props
- safer state management
- cleaner API request/response handling
- better Cursor AI understanding
- fewer bugs during development

All major entities should have clear TypeScript types before implementation.

These interfaces should be placed mainly inside:

```text
src/types/
```

Recommended files:

```text
src/types/
│
├── pokemon.ts
├── move.ts
├── ability.ts
├── item.ts
├── team.ts
├── strategy.ts
├── recommendation.ts
├── coverage.ts
├── checklist.ts
├── user.ts
└── api.ts
```

---

# General Type Philosophy

Use TypeScript to make the project strict and predictable.

Avoid:
- `any`
- unclear object shapes
- repeated inline types
- duplicated interfaces
- mixing database models and UI models without purpose

Prefer:
- reusable interfaces
- clear enums/unions
- explicit nullable fields
- readable type names
- small focused type files

---

# Shared Primitive Types

These shared types should be used across the project.

```ts
export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type BattleFormat = "singles" | "doubles" | "triples";

export type MoveCategory = "physical" | "special" | "status";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type StatTier = "any" | "low" | "medium" | "high" | "very_high";

export type TeamRole =
  | "physical_attacker"
  | "special_attacker"
  | "mixed_attacker"
  | "physical_wall"
  | "special_wall"
  | "tank"
  | "support"
  | "pivot"
  | "hazard_setter"
  | "hazard_remover"
  | "setup_sweeper"
  | "wallbreaker"
  | "speed_control"
  | "weather_setter"
  | "weather_abuser"
  | "trick_room_setter"
  | "trick_room_abuser"
  | "intimidate_support"
  | "redirection_support"
  | "status_spreader"
  | "priority_user"
  | "trap_user";
```

---

# Pokémon Interfaces

File:

```text
src/types/pokemon.ts
```

## Pokemon

Represents a Pokémon used across Pokédex, Team Builder, Recommendation Engine, and Strategy Teams.

```ts
import type { PokemonType, TeamRole } from "./shared";

export interface Pokemon {
  id: number;
  name: string;
  slug: string;
  generation: number;
  region: string;

  primaryType: PokemonType;
  secondaryType?: PokemonType | null;

  stats: PokemonBaseStats;

  spriteNormal: string;
  spriteShiny?: string | null;

  isLegendaryOrMythical: boolean;

  abilities: Ability[];
  moves: Move[];
  roles: TeamRole[];
}
```

## PokemonBaseStats

```ts
export interface PokemonBaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
}
```

## PokemonListItem

Used for Pokédex list/table display.

```ts
export interface PokemonListItem {
  id: number;
  name: string;
  slug: string;
  generation: number;
  region: string;

  primaryType: PokemonType;
  secondaryType?: PokemonType | null;

  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;

  spriteNormal: string;
  isLegendaryOrMythical: boolean;
}
```

## PokemonDetail

Used for Pokémon detail pages.

```ts
export interface PokemonDetail extends Pokemon {
  evolutionChain?: EvolutionStage[];
  typeDefense?: TypeDefenseEntry[];
}
```

## EvolutionStage

```ts
export interface EvolutionStage {
  pokemonId: number;
  name: string;
  slug: string;
  spriteNormal: string;
  evolvesTo?: EvolutionStage[];
}
```

---

# Ability Interfaces

File:

```text
src/types/ability.ts
```

```ts
export interface Ability {
  id: number;
  name: string;
  slug: string;
  description: string;
  isHidden?: boolean;
}
```

Use this interface for:
- ability dropdowns
- Pokémon detail pages
- strategy team data
- recommendation explanations

---

# Move Interfaces

File:

```text
src/types/move.ts
```

```ts
import type { MoveCategory, PokemonType } from "./shared";

export interface Move {
  id: number;
  name: string;
  slug: string;
  type: PokemonType;
  category: MoveCategory;

  power?: number | null;
  accuracy?: number | null;
  pp?: number | null;
  priority: number;

  description?: string;

  tags?: MoveTag[];
}
```

## MoveTag

Move tags help checklist and recommendation logic.

```ts
export type MoveTag =
  | "entry_hazard"
  | "hazard_removal"
  | "recovery"
  | "pivot"
  | "setup"
  | "status"
  | "priority"
  | "protect"
  | "fake_out"
  | "spread"
  | "speed_control"
  | "weather"
  | "trick_room"
  | "redirection"
  | "phazing"
  | "trap";
```

Examples:
- Stealth Rock → `entry_hazard`
- Rapid Spin → `hazard_removal`
- Roost → `recovery`
- Protect → `protect`
- Fake Out → `fake_out`
- Tailwind → `speed_control`
- Trick Room → `trick_room`

---

# Item Interfaces

File:

```text
src/types/item.ts
```

```ts
export interface Item {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string | null;
  tags?: ItemTag[];
}
```

## ItemTag

```ts
export type ItemTag =
  | "choice_item"
  | "recovery"
  | "damage_boost"
  | "speed_boost"
  | "defense_boost"
  | "special_defense_boost"
  | "weather_item"
  | "terrain_item"
  | "focus_sash"
  | "utility";
```

---

# Team Interfaces

File:

```text
src/types/team.ts
```

## Team

Represents a full team.

```ts
import type { BattleFormat } from "./shared";

export interface Team {
  id?: string;
  userId?: string | null;

  name: string;
  format: BattleFormat;

  pokemon: TeamPokemon[];

  isPublic?: boolean;

  createdAt?: string;
  updatedAt?: string;
}
```

## TeamPokemon

Represents one Pokémon slot inside a team.

```ts
export interface TeamPokemon {
  slot: number;

  pokemon: Pokemon | null;

  selectedAbility?: Ability | null;
  selectedItem?: Item | null;

  moves: SelectedMove[];

  isShiny?: boolean;
}
```

## SelectedMove

```ts
export interface SelectedMove {
  slot: 1 | 2 | 3 | 4;
  move: Move | null;
}
```

## EmptyTeamSlot

Used when team slot has no Pokémon selected.

```ts
export interface EmptyTeamSlot {
  slot: number;
  pokemon: null;
  selectedAbility: null;
  selectedItem: null;
  moves: SelectedMove[];
  isShiny: false;
}
```

---

# Coverage Interfaces

File:

```text
src/types/coverage.ts
```

## DefensiveCoverageResult

```ts
import type { PokemonType } from "./shared";

export interface DefensiveCoverageResult {
  entries: DefensiveCoverageEntry[];
  summary: DefensiveCoverageSummary;
}
```

## DefensiveCoverageEntry

```ts
export interface DefensiveCoverageEntry {
  type: PokemonType;

  weakCount: number;
  resistCount: number;
  immuneCount: number;
  neutralCount: number;

  affectedPokemon: DefensivePokemonMatch[];
}
```

## DefensivePokemonMatch

```ts
export interface DefensivePokemonMatch {
  pokemonId: number;
  pokemonName: string;
  multiplier: number;
}
```

## DefensiveCoverageSummary

```ts
export interface DefensiveCoverageSummary {
  majorWeaknesses: PokemonType[];
  strongResistances: PokemonType[];
  immunityTypes: PokemonType[];
}
```

## OffensiveCoverageResult

```ts
export interface OffensiveCoverageResult {
  entries: OffensiveCoverageEntry[];
  summary: OffensiveCoverageSummary;
}
```

## OffensiveCoverageEntry

```ts
export interface OffensiveCoverageEntry {
  targetType: PokemonType;

  superEffectiveMoveTypes: PokemonType[];
  hasCoverage: boolean;

  matchingMoves: OffensiveMoveMatch[];
}
```

## OffensiveMoveMatch

```ts
export interface OffensiveMoveMatch {
  pokemonId: number;
  pokemonName: string;
  moveId: number;
  moveName: string;
  moveType: PokemonType;
}
```

## OffensiveCoverageSummary

```ts
export interface OffensiveCoverageSummary {
  coveredTypes: PokemonType[];
  missingTypes: PokemonType[];
}
```

---

# Checklist Interfaces

File:

```text
src/types/checklist.ts
```

```ts
import type { BattleFormat } from "./shared";

export interface TeamChecklistResult {
  format: BattleFormat;
  sections: ChecklistSection[];
  completionPercentage: number;
}
```

## ChecklistSection

```ts
export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}
```

## ChecklistItem

```ts
export interface ChecklistItem {
  id: string;
  label: string;
  description: string;

  isCompleted: boolean;

  matchedPokemon: ChecklistMatch[];
}
```

## ChecklistMatch

```ts
export interface ChecklistMatch {
  pokemonId: number;
  pokemonName: string;
  reason: string;
}
```

Example:
```ts
{
  id: "entry_hazard",
  label: "Entry Hazard",
  isCompleted: true,
  matchedPokemon: [
    {
      pokemonId: 445,
      pokemonName: "Garchomp",
      reason: "Has Stealth Rock"
    }
  ]
}
```

---

# Recommendation Interfaces

File:

```text
src/types/recommendation.ts
```

## RecommendationFilters

```ts
import type {
  BattleFormat,
  PokemonType,
  StatTier,
  TeamRole
} from "./shared";

export interface RecommendationFilters {
  excludeLegendaryOrMythical: boolean;

  region: string | "all";
  generation: number | "all";

  type: PokemonType | "all";
  role: TeamRole | "all";

  format: BattleFormat;

  attackTier: StatTier;
  defenseTier: StatTier;
  specialAttackTier: StatTier;
  specialDefenseTier: StatTier;
  speedTier: StatTier;
}
```

## RecommendationRequest

```ts
export interface RecommendationRequest {
  team: Team;
  filters: RecommendationFilters;
}
```

## RecommendationResult

```ts
export interface RecommendationResult {
  pokemon: PokemonListItem;
  score: number;
  reasons: RecommendationReason[];
  matchedRoles: TeamRole[];
}
```

## RecommendationReason

```ts
export interface RecommendationReason {
  type:
    | "defensive_synergy"
    | "offensive_coverage"
    | "missing_role"
    | "ability_synergy"
    | "format_bonus"
    | "stat_tier_match"
    | "penalty";

  message: string;
  scoreImpact: number;
}
```

## RecommendationResponse

```ts
export interface RecommendationResponse {
  results: RecommendationResult[];
  analyzedAt: string;
}
```

---

# Strategy Team Interfaces

File:

```text
src/types/strategy.ts
```

```ts
import type { BattleFormat, DifficultyLevel } from "./shared";

export type StrategyType =
  | "rain"
  | "sun"
  | "sand"
  | "snow"
  | "trick_room"
  | "tailwind"
  | "monotype"
  | "stall"
  | "balance"
  | "hyper_offense"
  | "bulky_offense"
  | "intimidate_core"
  | "trap";
```

## StrategyTeam

```ts
export interface StrategyTeam {
  id: string;
  name: string;
  slug: string;

  strategyType: StrategyType;
  format: BattleFormat;
  difficulty: DifficultyLevel;

  tags: string[];
  shortDescription: string;

  pokemon: StrategyTeamPokemon[];

  createdAt?: string;
  updatedAt?: string;
}
```

## StrategyTeamPokemon

```ts
export interface StrategyTeamPokemon {
  slot: number;

  pokemon: Pokemon;
  ability: Ability;
  item: Item;
  moves: Move[];

  role: TeamRole;
  explanation: string;
}
```

## StrategyFilters

```ts
export interface StrategyFilters {
  strategyType: StrategyType | "all";
  format: BattleFormat | "all";
  difficulty: DifficultyLevel | "all";
}
```

---

# Team Card Interfaces

File:

```text
src/types/team-card.ts
```

```ts
export interface TeamCardConfig {
  teamId?: string;

  teamName: string;
  trainerSlug: string;
  backgroundSlug: string;

  pokemon: TeamCardPokemon[];

  showTypeIcons: boolean;
  showFormatLabel: boolean;
}
```

## TeamCardPokemon

```ts
export interface TeamCardPokemon {
  slot: number;
  pokemonId: number;
  pokemonName: string;
  spriteUrl: string;
  isShiny: boolean;
}
```

## TeamCardAsset

```ts
export interface TeamCardAsset {
  slug: string;
  name: string;
  imageUrl: string;
}
```

---

# User Interfaces

File:

```text
src/types/user.ts
```

```ts
export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string | null;
  createdAt: string;
}
```

---

# API Interfaces

File:

```text
src/types/api.ts
```

## ApiResponse

```ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

## ApiError

```ts
export interface ApiError {
  code: string;
  message: string;
}
```

Example:

```ts
export type PokemonListResponse = ApiResponse<PokemonListItem[]>;
export type PokemonDetailResponse = ApiResponse<PokemonDetail>;
export type RecommendationApiResponse = ApiResponse<RecommendationResponse>;
```

---

# Store Interfaces

These types support Zustand state.

## TeamStoreState

```ts
export interface TeamStoreState {
  team: Team;

  setFormat: (format: BattleFormat) => void;
  setTeamName: (name: string) => void;

  addPokemon: (slot: number, pokemon: Pokemon) => void;
  removePokemon: (slot: number) => void;
  replacePokemon: (slot: number, pokemon: Pokemon) => void;

  setAbility: (slot: number, ability: Ability | null) => void;
  setItem: (slot: number, item: Item | null) => void;
  setMove: (pokemonSlot: number, moveSlot: 1 | 2 | 3 | 4, move: Move | null) => void;

  clearTeam: () => void;
  loadTeam: (team: Team) => void;
}
```

## RecommendationStoreState

```ts
export interface RecommendationStoreState {
  filters: RecommendationFilters;
  results: RecommendationResult[];

  isLoading: boolean;
  error: string | null;

  setFilters: (filters: Partial<RecommendationFilters>) => void;
  setResults: (results: RecommendationResult[]) => void;
  clearResults: () => void;
}
```

---

# Component Prop Interfaces

Component props should be defined close to the component unless reused across multiple components.

Example:

```ts
export interface PokemonSlotProps {
  teamPokemon: TeamPokemon;
  onRemove: () => void;
  onReplace: (pokemon: Pokemon) => void;
}
```

Reusable prop types may be moved into:
```text
src/types/components.ts
```

---

# Nullability Rules

Use `null` when a field is intentionally empty.

Examples:
```ts
pokemon: Pokemon | null;
selectedAbility: Ability | null;
selectedItem: Item | null;
move: Move | null;
```

Avoid using `undefined` for intentional empty selections.

Use `undefined` mainly for optional metadata fields.

---

# Naming Rules

Use:
- PascalCase for interfaces
- camelCase for properties
- lowercase string unions
- explicit names

Good:
```ts
specialAttack
selectedAbility
isLegendaryOrMythical
```

Avoid:
```ts
spatk
abilityObj
legend
```

---

# Final Goal

The TypeScript interfaces should make the project:
- safer
- easier to understand
- easier to refactor
- easier for Cursor AI to work with
- easier to scale

The interfaces should clearly represent the domain model of PokemonTeamForge without adding unnecessary complexity.