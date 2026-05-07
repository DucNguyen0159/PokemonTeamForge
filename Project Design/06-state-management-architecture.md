# State Management Architecture

## Overview

This document defines the state management architecture for PokemonTeamForge.

The project uses:
- Zustand for global client state
- React Query (TanStack Query) for server/cache state
- local component state for isolated UI behavior

The architecture is designed to prioritize:
- simplicity
- scalability
- predictable state flow
- performance
- low re-render frequency
- clean separation of concerns

The architecture should avoid:
- giant global stores
- unnecessary global state
- duplicated state
- deeply nested store structures
- excessive prop drilling

---

# State Management Philosophy

PokemonTeamForge is primarily:
- an interactive Team Builder
- a live analysis platform
- a recommendation-driven application

The application contains many dynamically updating systems:
- team changes
- coverage analysis
- checklist analysis
- recommendations
- filters
- team card previews

Therefore:
- state architecture must remain predictable
- calculations should update efficiently
- components should re-render minimally

---

# State Categories

The project state should be divided into 3 major categories:

1. Global Client State
2. Server / Async State
3. Local Component State

---

# Global Client State

Managed by:
- Zustand

Global state should contain:
- current team
- selected format
- recommendation filters
- recommendation results
- UI preferences
- persistent builder state

Global state should NOT contain:
- temporary dropdown states
- hover states
- local input focus
- isolated modal internals

---

# Server / Async State

Managed by:
- React Query (TanStack Query)

Used for:
- Pokémon data fetching
- recommendation API requests
- saved teams
- strategy teams
- authentication-related fetching

React Query handles:
- caching
- loading states
- stale data
- background refetching
- deduplication

---

# Local Component State

Managed by:
- React useState

Used for:
- dropdown visibility
- search input typing
- modal open state
- temporary UI animations
- hover interactions

Local component state should remain isolated whenever possible.

---

# Main State Architecture

Recommended structure:

```text
src/store/
│
├── team-store.ts
├── recommendation-store.ts
├── filter-store.ts
├── ui-store.ts
└── auth-store.ts
```

The stores should remain:
- focused
- modular
- independent

Avoid:
- one giant global store

---

# Team Store

File:

```text
src/store/team-store.ts
```

This is the MOST IMPORTANT store in the project.

The Team Store manages:
- current team
- Pokémon slots
- abilities
- items
- moves
- battle format

This store powers:
- Team Builder
- Coverage Analysis
- Checklist System
- Recommendation Engine
- Team Card Generator

---

# Team Store Philosophy

The Team Store should act as:
- the central source of truth for the current team

All analysis systems should derive from:
```text
current team state
```

Avoid:
- duplicating team data elsewhere
- recalculating from inconsistent sources

---

# Team Store Example Structure

```ts
interface TeamStoreState {
  team: Team;

  setFormat: (format: BattleFormat) => void;
  setTeamName: (name: string) => void;

  addPokemon: (slot: number, pokemon: Pokemon) => void;
  removePokemon: (slot: number) => void;
  replacePokemon: (slot: number, pokemon: Pokemon) => void;

  setAbility: (
    slot: number,
    ability: Ability | null
  ) => void;

  setItem: (
    slot: number,
    item: Item | null
  ) => void;

  setMove: (
    pokemonSlot: number,
    moveSlot: 1 | 2 | 3 | 4,
    move: Move | null
  ) => void;

  clearTeam: () => void;
  loadTeam: (team: Team) => void;
}
```

---

# Team State Flow

Main flow:

```text
User modifies team
→ Team Store updates
→ Coverage recalculates
→ Checklist recalculates
→ Recommendation recalculates
→ UI updates
```

The Team Store is the center of this architecture.

---

# Recommendation Store

File:

```text
src/store/recommendation-store.ts
```

Manages:
- recommendation filters
- recommendation results
- loading states
- recommendation metadata

---

# Recommendation Store Example

```ts
interface RecommendationStoreState {
  filters: RecommendationFilters;

  results: RecommendationResult[];

  isLoading: boolean;
  error: string | null;

  setFilters: (
    filters: Partial<RecommendationFilters>
  ) => void;

  setResults: (
    results: RecommendationResult[]
  ) => void;

  clearResults: () => void;
}
```

---

# Recommendation Architecture Philosophy

Recommendation logic should remain:
- deterministic
- explainable
- predictable

Avoid:
- hidden calculations
- mysterious state mutations
- duplicated recommendation data

Recommendation results should always derive from:
```text
current team
+ filters
```

---

# Filter Store

File:

```text
src/store/filter-store.ts
```

Purpose:
- store reusable filters
- support Pokédex filtering
- support strategy filtering

Examples:
- generation filter
- type filter
- region filter
- role filter

---

# Filter Store Philosophy

Filters should remain centralized.

Avoid:
- duplicated filters across pages
- inconsistent filter behavior

The same filter system should support:
- Pokédex
- recommendations
- strategy teams

---

# UI Store

File:

```text
src/store/ui-store.ts
```

Stores:
- sidebar state
- mobile menu state
- modal visibility
- dark mode
- global UI preferences

Examples:

```ts
interface UIStoreState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;

  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}
```

IMPORTANT:
Do NOT place core business logic here.

This store should remain UI-only.

---

# Auth Store

File:

```text
src/store/auth-store.ts
```

Optional lightweight auth state.

Examples:
- current user
- auth loading state

Most authentication should still rely on:
- Supabase Auth
- React Query

Avoid duplicating excessive auth data.

---

# React Query Architecture

React Query should manage:
- async data
- cached data
- API state

Examples:
- Pokémon list
- Pokémon details
- strategy teams
- saved teams
- recommendation API responses

---

# Recommended Query Structure

```text
src/hooks/
│
├── queries/
│   ├── use-pokemon-list.ts
│   ├── use-pokemon-detail.ts
│   ├── use-strategy-teams.ts
│   ├── use-recommendations.ts
│   └── use-user-teams.ts
```

---

# Query Key Philosophy

Query keys should remain:
- stable
- predictable
- reusable

Examples:

```ts
["pokemon-list"]
["pokemon-detail", pokemonSlug]
["recommendations", teamId, filters]
["strategy-teams", strategyType]
```

Avoid:
- unstable object keys
- random query keys
- inconsistent naming

---

# Derived State Philosophy

Many systems should use:
- derived state
- memoized calculations

Examples:
- defensive coverage
- offensive coverage
- checklist completion
- recommendation scores

These should NOT be manually stored redundantly if derivable from team state.

---

# Derived State Examples

GOOD:
```text
team
→ derive defensive coverage
→ derive checklist
→ derive recommendations
```

BAD:
```text
store defensive coverage separately
store checklist separately
store recommendations separately
without synchronization
```

---

# Memoization Strategy

Use:
- useMemo
- Zustand selectors
- React Query caching

to avoid unnecessary recalculations.

Heavy calculations:
- coverage analysis
- recommendation scoring
- checklist systems

should remain optimized.

---

# Zustand Selector Philosophy

Use selectors to reduce re-renders.

GOOD:

```ts
const team = useTeamStore(
  (state) => state.team
);
```

BAD:

```ts
const state = useTeamStore();
```

Avoid subscribing entire components to massive store objects.

---

# Component State Philosophy

Use local state for:
- temporary UI state
- isolated interactions

Examples:
- dropdown open state
- search text
- hover effects
- modal tabs

Do NOT globalize temporary UI state unnecessarily.

---

# Search State Strategy

Search input state should remain local initially.

Examples:
- move search
- Pokémon search
- item search

Debounced queries may later integrate with:
- React Query
- filter store

---

# Team Persistence Strategy

Guest users:
- localStorage persistence

Authenticated users:
- Supabase database persistence

Recommended approach:

```text
localStorage
→ auto-save current builder session
```

This improves UX significantly.

---

# Auto-Save Philosophy

The Team Builder should feel persistent.

Recommended:
- auto-save current builder state
- restore unfinished sessions

This should happen:
- silently
- efficiently
- without user interruption

---

# Local Storage Structure

Recommended local storage keys:

```text
pokemon-team-forge-current-team
pokemon-team-forge-builder-format
pokemon-team-forge-filters
```

Avoid:
- giant localStorage blobs
- storing unnecessary cached data

---

# State Update Philosophy

All state updates should remain:
- immutable
- predictable
- centralized

Avoid:
- hidden mutations
- deeply nested mutable updates

---

# Performance Philosophy

State architecture should minimize:
- unnecessary re-renders
- duplicated calculations
- excessive subscriptions

Priority:
- fast Team Builder interactions
- smooth dropdown behavior
- instant coverage updates

---

# Async Loading Philosophy

Loading states should remain:
- predictable
- visually clean
- non-blocking

Examples:
- Pokémon loading skeletons
- recommendation loading states
- strategy team loading cards

Avoid:
- freezing UI during fetches
- blocking interactions unnecessarily

---

# Error State Philosophy

Error states should remain:
- isolated
- recoverable
- understandable

Examples:
- recommendation API failed
- Pokémon fetch failed
- invalid import format

Errors should NOT corrupt core team state.

---

# State Scalability

The architecture should support future features such as:
- public teams
- community sharing
- advanced recommendations
- battle simulations
- mobile applications

without requiring major store restructuring.

---

# Important Development Rules

## Keep stores focused

One store should have:
- one responsibility
- one clear domain

Avoid:
- giant multi-purpose stores

---

## Avoid duplicated state

There should be:
- one source of truth

Especially for:
- current team
- recommendation filters

---

## Prefer derived calculations

Coverage/checklist/recommendations should derive from:
```text
team state
```

instead of storing duplicated versions.

---

## Keep UI state local when possible

Do NOT move everything into Zustand.

---

# Final State Management Goal

The final architecture should provide:
- fast interactions
- predictable updates
- scalable structure
- low re-render frequency
- clean separation of concerns
- excellent Team Builder responsiveness

The Team Builder should feel:
- instant
- smooth
- modern
- reactive
- reliable