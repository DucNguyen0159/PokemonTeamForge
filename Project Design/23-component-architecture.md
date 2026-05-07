# Component Architecture

## Overview

This document defines the component architecture for PokemonTeamForge.

The component architecture exists to ensure:
- scalable frontend structure
- reusable UI systems
- maintainable React code
- predictable rendering behavior
- clean separation of concerns
- performant Team Builder interactions

PokemonTeamForge is a large interactive frontend application containing:
- Team Builder systems
- analysis systems
- recommendation systems
- Pokédex interfaces
- Team Card generation
- dynamic state interactions

Therefore:
```text
component organization is extremely important
```

The architecture should prioritize:
- modularity
- readability
- reusability
- isolated rerenders
- maintainability
- scalable composition

The system should avoid:
- giant monolithic components
- deeply nested prop chains
- duplicated UI logic
- uncontrolled state sharing
- component spaghetti

---

# Component Philosophy

PokemonTeamForge should follow:
```text
small, focused, reusable components
```

Components should:
- do one responsibility well
- remain understandable
- remain composable

The UI architecture should feel:
- modular
- predictable
- scalable

---

# Core Architecture Philosophy

The architecture follows:

```text
Pages
→ Feature Sections
→ Feature Components
→ Shared Components
→ UI Components
```

Business logic should remain:
```text
outside UI components whenever possible
```

---

# Component Categories

The project is divided into:

1. Page Components
2. Feature Components
3. Shared Components
4. UI Components
5. Layout Components
6. Modal Components
7. Provider Components
8. Error Components

---

# Recommended Folder Structure

```text
src/components/
│
├── builder/
├── pokedex/
├── recommendation/
├── coverage/
├── checklist/
├── strategy/
├── team-card/
├── layout/
├── shared/
├── modals/
├── providers/
├── error/
└── ui/
```

---

# Component Hierarchy Philosophy

The hierarchy should flow downward clearly.

GOOD:

```text
Page
→ Feature Section
→ Small Components
```

BAD:

```text
One massive component handling everything
```

---

# Page Components

## Purpose

Page components:
- organize layouts
- compose feature sections
- connect high-level flows

Pages should remain:
```text
lightweight orchestration layers
```

---

# Page Responsibilities

Pages may:
- assemble sections
- trigger data fetching
- manage route-level concerns

Pages should NOT contain:
- giant business logic
- complex calculations
- recommendation scoring logic

---

# Recommended Page Structure

Example:

```text
BuilderPage
│
├── BuilderLayout
├── TeamBuilder
├── CoveragePanel
├── RecommendationPanel
└── ChecklistPanel
```

---

# Feature Components

## Purpose

Feature components implement:
- major feature systems
- feature-specific UI logic

Examples:
- Team Builder
- Recommendation Panel
- Coverage Panel

---

# Feature Component Philosophy

Feature components should:
- manage feature composition
- coordinate child components
- remain modular

Avoid:
- extremely large feature files

---

# Shared Components

## Purpose

Shared components are reusable across multiple features.

Examples:
- Pokémon Card
- Type Badge
- Search Input
- Empty State

---

# Shared Component Philosophy

Shared components should:
- remain generic
- avoid feature-specific assumptions
- maximize reusability

---

# UI Components

## Purpose

UI components are low-level design system primitives.

Examples:
- Button
- Card
- Input
- Dialog
- Tabs

Most come from:
```text
shadcn/ui
```

---

# UI Component Philosophy

UI components should:
- remain presentation-focused
- avoid business logic
- support design consistency

---

# Layout Components

## Purpose

Layout components organize:
- spacing
- containers
- navigation
- responsive structure

Examples:
- Navbar
- Sidebar
- PageContainer
- SectionWrapper

---

# Layout Philosophy

Layout components should:
- remain reusable
- remain predictable
- avoid feature-specific logic

---

# Modal Components

## Purpose

Modals support:
- Pokémon search
- move selection
- imports
- filters

---

# Modal Philosophy

Modals should:
- isolate interaction flows
- remain reusable
- support keyboard navigation

Avoid:
- giant all-purpose modals

---

# Provider Components

## Purpose

Providers wrap:
- React Query
- theme
- auth
- global systems

---

# Recommended Provider Structure

```text
src/components/providers/
│
├── query-provider.tsx
├── theme-provider.tsx
└── auth-provider.tsx
```

---

# Error Components

## Purpose

Error components handle:
- fallback rendering
- recoverable failures
- retry systems

---

# Error Component Examples

```text
ErrorBoundary
ErrorMessage
RetryButton
LoadingError
```

---

# Team Builder Architecture

## MOST IMPORTANT COMPONENT SYSTEM

The Team Builder is the core application feature.

---

# Recommended Team Builder Structure

```text
TeamBuilder
│
├── TeamHeader
├── TeamSlots
│   ├── PokemonSlot
│   ├── PokemonSlot
│   └── ...
│
├── CoveragePanel
├── RecommendationPanel
├── ChecklistPanel
└── BuilderControls
```

---

# Team Slot Architecture

Recommended:

```text
PokemonSlot
│
├── PokemonHeader
├── TypeBadges
├── AbilitySelector
├── ItemSelector
├── MoveList
│   ├── MoveSlot
│   ├── MoveSlot
│   ├── MoveSlot
│   └── MoveSlot
└── SlotActions
```

---

# Team Slot Philosophy

PokemonSlot should:
- remain isolated
- rerender independently
- avoid affecting unrelated slots

This is important for:
```text
performance optimization
```

---

# Coverage Architecture

Recommended:

```text
CoveragePanel
│
├── DefensiveCoverage
├── OffensiveCoverage
└── CoverageSummary
```

---

# Coverage Component Philosophy

Coverage components should:
- remain calculation-light
- receive precomputed data
- avoid recalculating internally

---

# Recommendation Architecture

Recommended:

```text
RecommendationPanel
│
├── RecommendationFilters
├── RecommendationList
│   ├── RecommendationCard
│   ├── RecommendationCard
│   └── ...
└── RecommendationSummary
```

---

# Recommendation Component Philosophy

Recommendation components should:
- remain presentation-focused
- avoid scoring logic internally

Scoring belongs inside:
```text
src/lib/recommendation/
```

---

# Pokédex Architecture

Recommended:

```text
PokedexPage
│
├── PokedexFilters
├── PokemonGrid
│   ├── PokemonCard
│   ├── PokemonCard
│   └── ...
└── Pagination
```

---

# Pokémon Detail Architecture

Recommended:

```text
PokemonDetail
│
├── PokemonHero
├── PokemonStats
├── PokemonAbilities
├── PokemonMoves
└── AddToTeamButton
```

---

# Team Card Generator Architecture

Recommended:

```text
TeamCardGenerator
│
├── TeamCardPreview
├── BackgroundSelector
├── TrainerSelector
├── SpriteModeToggle
└── ExportButton
```

---

# Smart vs Dumb Components

## Smart Components

Smart components:
- connect stores
- fetch data
- coordinate state

Examples:
- TeamBuilder
- RecommendationPanel

---

# Dumb Components

Dumb components:
- receive props
- render UI
- avoid business logic

Examples:
- PokemonCard
- TypeBadge
- RecommendationCard

---

# Smart/Dumb Philosophy

Prefer:
```text
business logic outside presentational components
```

---

# State Ownership Rules

## Philosophy

State should exist:
```text
as close as possible to where it is needed
```

Avoid:
- unnecessary global state
- excessive prop drilling

---

# Zustand Integration Philosophy

Global state belongs in:
```text
src/store/
```

Examples:
- current team
- filters
- auth state

---

# Local Component State

Local state should handle:
- dropdown open state
- modal visibility
- hover states
- temporary form inputs

Avoid placing:
```text
tiny UI state in global stores
```

---

# Prop Drilling Philosophy

Avoid:
```text
deep prop drilling chains
```

Use:
- Zustand
- context sparingly
- composition patterns

---

# Composition Philosophy

Prefer:
```text
component composition
```

over:
```text
massive configuration props
```

---

# Reusability Philosophy

Components should maximize:
- reuse
- consistency
- composability

Examples:
- shared dropdowns
- shared search modals
- shared cards

---

# Performance Philosophy

Components should:
- rerender minimally
- isolate updates
- remain lightweight

---

# Memoization Rules

Use:
```ts
React.memo
```

for:
- Pokémon cards
- recommendation cards
- coverage rows

Especially:
- repeated list items

---

# Client Component Philosophy

IMPORTANT:
Avoid:
```text
"use client" everywhere
```

Use client components only when necessary.

---

# Server Component Philosophy

Prefer:
- server components by default

Client components for:
- Team Builder
- dropdowns
- interactive systems

---

# File Naming Rules

Use:
```text
kebab-case
```

Examples:

```text
pokemon-card.tsx
recommendation-panel.tsx
coverage-summary.tsx
```

---

# Component Export Philosophy

Prefer:
```ts
named exports
```

for shared utilities.

Page-level components may use:
```ts
default export
```

---

# Styling Philosophy

Use:
- Tailwind utility classes
- reusable variants
- shadcn/ui composition

Avoid:
- giant custom CSS files

---

# Variant Philosophy

Complex reusable components should use:
```text
variant systems
```

Examples:
- button variants
- badge variants
- card variants

---

# Loading Component Philosophy

Use dedicated loading components:

Examples:
- skeleton loaders
- loading cards
- loading rows

Avoid:
- giant page-blocking spinners

---

# Empty State Components

Examples:
- EmptyTeamState
- NoRecommendations
- NoSearchResults

These improve:
- UX consistency
- maintainability

---

# Error Boundary Placement

Recommended boundaries around:
- RecommendationPanel
- TeamCardGenerator
- CoveragePanel

Avoid:
```text
one crash killing the entire app
```

---

# Testing Philosophy

Components should remain:
- testable
- isolated
- deterministic

Especially:
- calculation display components
- recommendation components

---

# Accessibility Philosophy

Components should support:
- keyboard navigation
- focus states
- readable contrast
- touch-friendly interaction

---

# Responsive Philosophy

Components should:
- adapt cleanly
- avoid layout assumptions
- support responsive stacking

---

# Scalability Philosophy

The component architecture should support future systems such as:
- AI features
- public profiles
- community systems
- advanced analysis

without major restructuring.

---

# Important Component Rules

## Keep components small

Avoid:
```text
2000-line mega components
```

---

# Separate business logic from UI

Business logic belongs in:
```text
src/lib/
```

NOT:
```text
inside JSX-heavy files
```

---

# Prioritize Team Builder performance

Team Builder rerenders must remain:
```text
minimal and isolated
```

---

# Reuse aggressively

Avoid:
- duplicate dropdown systems
- duplicate cards
- duplicate search components

---

# Prefer composition over configuration complexity

Keep APIs:
- understandable
- maintainable

---

# Final Goal

The component architecture should provide:
- scalable frontend structure
- maintainable React organization
- reusable UI systems
- performant rendering
- clean feature separation
- predictable composition patterns

The architecture should make PokemonTeamForge feel:
```text
modern, maintainable, scalable, and professionally engineered
```

without becoming:
```text
a tangled frontend codebase full of duplicated logic and giant components
```