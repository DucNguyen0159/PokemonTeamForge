# Folder and File Structure

## Overview

This document defines the recommended folder and file structure for PokemonTeamForge.

The project structure is designed to prioritize:
- scalability
- maintainability
- readability
- separation of concerns
- AI-assisted development compatibility
- clean architecture

The structure should remain organized as the project grows.

The architecture should avoid:
- overly large files
- deeply nested folders
- duplicated logic
- mixed responsibilities
- unclear component ownership

The project uses:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand
- React Query
- Supabase

---

# Root Project Structure

```text
PokemonTeamForge/
│
├── Project Design/
│
├── public/
│
├── src/
│
├── .env.local
├── .gitignore
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```

---

# Project Design Folder

```text
Project Design/
```

This folder contains all architecture and planning documents.

It acts as:
- technical documentation
- development blueprint
- AI IDE context source
- long-term project reference

This folder should remain separate from actual source code.

---

# Public Folder

```text
public/
```

The public folder stores all static assets.

Recommended structure:

```text
public/
│
├── backgrounds/
├── trainers/
├── sprites/
├── types/
├── items/
├── abilities/
├── ui/
└── logos/
```

---

# backgrounds/

Stores prepared Team Card backgrounds.

Examples:
- fire-theme.png
- dark-theme.png
- cyber-theme.png

---

# trainers/

Stores preset trainer images used in Team Card Generator.

Examples:
- trainer-red.png
- trainer-cynthia.png
- trainer-generic-01.png

---

# sprites/

Stores Pokémon sprites.

Recommended structure:

```text
sprites/
│
├── normal/
└── shiny/
```

IMPORTANT:
- Team Builder uses only normal sprites
- Team Card Generator supports both normal and shiny sprites

---

# types/

Stores Pokémon type icons.

Examples:
- fire.svg
- water.svg
- dragon.svg

---

# items/

Stores item icons.

Examples:
- leftovers.png
- choice-scarf.png

---

# abilities/

Optional folder for ability-related icons or UI assets.

---

# ui/

Stores generic UI assets.

Examples:
- loading spinners
- decorative patterns
- placeholder graphics

---

# logos/

Stores:
- project logo
- favicon
- branding assets

---

# Source Folder

```text
src/
```

This folder contains all actual application code.

Recommended structure:

```text
src/
│
├── app/
├── components/
├── lib/
├── hooks/
├── store/
├── types/
├── data/
├── constants/
├── utils/
├── styles/
└── providers/
```

---

# app/

Contains all Next.js App Router pages and API routes.

Recommended structure:

```text
app/
│
├── page.tsx
├── layout.tsx
├── globals.css
│
├── builder/
├── pokedex/
├── pokemon/
├── strategies/
├── team-card/
├── profile/
├── auth/
│
└── api/
```

---

# page.tsx

Homepage.

Main responsibilities:
- landing page
- navigation entry point
- quick feature access

---

# layout.tsx

Global application layout.

Contains:
- navigation bar
- theme provider
- global wrappers
- metadata

---

# globals.css

Global styles.

Should contain:
- Tailwind imports
- CSS variables
- theme variables
- global resets

---

# builder/

Contains Team Builder pages.

Examples:
- Team Builder UI
- recommendation panels
- coverage analysis
- checklist systems

---

# pokedex/

Contains Pokédex pages.

Examples:
- Pokémon list page
- filters
- search pages

---

# pokemon/

Contains dynamic Pokémon detail pages.

Example route:

```text
/pokemon/charizard
```

---

# strategies/

Contains:
- preset strategy teams
- strategy browsing pages
- strategy filters

---

# team-card/

Contains Team Card Generator pages.

---

# profile/

Contains:
- saved teams
- favorites
- account settings

---

# auth/

Contains:
- login page
- register page
- authentication handlers

---

# api/

Contains all API routes.

Recommended structure:

```text
api/
│
├── pokemon/
├── recommendation/
├── teams/
├── strategies/
├── coverage/
└── checklist/
```

---

# components/

Contains reusable React components.

This is one of the most important folders.

Recommended structure:

```text
components/
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
└── ui/
```

---

# builder/

Contains Team Builder-specific UI components.

Examples:
- PokemonSlot
- MoveDropdown
- AbilityDropdown
- TeamBuilderGrid

---

# pokedex/

Contains Pokédex UI components.

Examples:
- PokemonCard
- PokemonStats
- TypeBadge

---

# recommendation/

Contains recommendation-related components.

Examples:
- RecommendationCard
- RecommendationList
- RecommendationFilters

---

# coverage/

Contains:
- defensive coverage components
- offensive coverage components
- type analysis UI

---

# checklist/

Contains Team Checklist components.

---

# strategy/

Contains strategy-related UI.

Examples:
- StrategyCard
- StrategyFilters
- PresetTeamPreview

---

# team-card/

Contains Team Card Generator UI components.

Examples:
- BackgroundSelector
- TrainerSelector
- TeamCardPreview

---

# layout/

Contains layout components.

Examples:
- Navbar
- Sidebar
- Footer
- MobileMenu

---

# shared/

Contains generic reusable components.

Examples:
- SearchBar
- LoadingSpinner
- EmptyState
- ErrorMessage

---

# ui/

Contains shadcn/ui components.

IMPORTANT:
This folder should remain mostly auto-generated by shadcn/ui.

Avoid heavily modifying core UI files directly.

---

# lib/

Contains core business logic and systems.

Recommended structure:

```text
lib/
│
├── calculations/
├── recommendation/
├── pokemon/
├── parsing/
├── supabase/
└── validations/
```

---

# calculations/

Contains:
- type chart logic
- defensive calculations
- offensive coverage calculations
- checklist calculations

This folder is part of the core project logic.

---

# recommendation/

Contains recommendation engine systems.

Examples:
- scoring algorithms
- recommendation filters
- synergy calculations

---

# pokemon/

Contains Pokémon-related helper logic.

Examples:
- Pokémon formatting
- sprite utilities
- move filtering
- role tagging

---

# parsing/

Contains:
- import/export parsers
- Showdown-style parsing
- validation parsing

---

# supabase/

Contains:
- Supabase client
- auth helpers
- database utilities

---

# validations/

Contains:
- input validation
- import validation
- schema validation

---

# hooks/

Contains reusable custom React hooks.

Examples:
- useTeamBuilder
- useRecommendation
- useCoverage
- useDebounce

---

# store/

Contains Zustand stores.

Recommended structure:

```text
store/
│
├── team-store.ts
├── filter-store.ts
├── ui-store.ts
└── recommendation-store.ts
```

---

# team-store.ts

Stores:
- current team
- format
- selected Pokémon
- move selections

This is likely the most important store.

---

# filter-store.ts

Stores:
- recommendation filters
- Pokédex filters
- search states

---

# ui-store.ts

Stores:
- modal states
- sidebar states
- UI preferences
- dark mode settings

---

# recommendation-store.ts

Stores:
- recommendation results
- loading states
- recommendation metadata

---

# types/

Contains TypeScript interfaces and types.

Examples:
- pokemon.ts
- move.ts
- ability.ts
- team.ts
- strategy.ts

IMPORTANT:
This folder should contain ONLY types/interfaces.

No business logic should exist here.

---

# data/

Contains static local data.

Examples:
- type charts
- predefined role tags
- strategy presets
- local Pokémon metadata

Examples:

```text
data/
│
├── type-chart.ts
├── roles.ts
├── strategy-tags.ts
└── regions.ts
```

---

# constants/

Contains reusable constants.

Examples:
- routes
- stat tiers
- default filters
- app configuration

---

# utils/

Contains generic helper utilities.

Examples:
- string formatting
- sorting helpers
- debounce helpers
- array utilities

IMPORTANT:
Avoid placing core business logic here.

Core systems belong inside:
```text
lib/
```

---

# styles/

Contains optional style-related files.

Examples:
- animations
- shared utility classes
- custom Tailwind layers

---

# providers/

Contains application providers.

Examples:
- ThemeProvider
- QueryProvider
- SupabaseProvider

---

# Naming Conventions

## File Naming

Use:
- lowercase
- kebab-case
- descriptive names

Examples:

```text
team-builder-grid.tsx
recommendation-card.tsx
offensive-coverage.ts
```

Avoid:
- vague names
- abbreviations
- inconsistent capitalization

---

# Component Naming

React components should use:

```text
PascalCase
```

Examples:
- PokemonSlot
- RecommendationCard
- TeamBuilderGrid

---

# Utility Naming

Utility/helper files should use:

```text
kebab-case
```

Examples:
- calculate-coverage.ts
- filter-pokemon.ts

---

# Import Philosophy

Avoid:
- deeply chained imports
- circular dependencies
- duplicated logic

Prefer:
- centralized reusable logic
- small focused files
- feature-based grouping

---

# Architecture Philosophy

The structure should follow:

- separation of concerns
- modular architecture
- scalable feature organization
- reusable systems

The project should remain:
- easy to navigate
- easy to refactor
- AI IDE friendly
- scalable for future expansion

---

# Future Scalability

The structure should support future features such as:
- 3D sprites
- mobile app adaptation
- advanced recommendation systems
- battle simulation
- community sharing systems

without requiring major restructuring.

---

# Important Development Rules

## Avoid gigantic files

Prefer:
- smaller reusable modules
- separated logic
- focused responsibilities

---

## Avoid duplicated calculations

Core calculations should exist only once inside:

```text
lib/calculations/
```

---

## Avoid mixing UI and logic

UI:
```text
components/
```

Business logic:
```text
lib/
```

State:
```text
store/
```

Types:
```text
types/
```

---

# Final Goal

The folder structure should allow PokemonTeamForge to grow into:
- a scalable production-ready project
- a maintainable long-term platform
- an AI-assisted development friendly codebase
- a clean professional portfolio project