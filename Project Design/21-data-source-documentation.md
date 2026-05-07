# Data Source Documentation

## Overview

This document defines all external and internal data sources used by PokemonTeamForge.

The purpose of this document is to:
- centralize data source information
- document API usage
- define asset origins
- improve maintainability
- simplify debugging
- support future scalability

PokemonTeamForge depends heavily on structured Pokémon data.

Therefore:
```text
data consistency and source reliability are extremely important
```

The architecture should prioritize:
- stable APIs
- lightweight payloads
- maintainable integration
- caching support
- predictable schemas

The project should avoid:
- excessive API dependencies
- unstable third-party sources
- unnecessary runtime requests
- undocumented data transformations

---

# Data Source Philosophy

PokemonTeamForge should:
- minimize external runtime dependencies
- cache stable data aggressively
- standardize internal formats
- isolate external source logic

The system should prefer:
```text
controlled internal data normalization
```

instead of:
```text
direct uncontrolled API usage everywhere
```

---

# Primary Data Categories

The project uses several major data categories:

1. Pokémon Data
2. Move Data
3. Ability Data
4. Item Data
5. Type Chart Data
6. Sprite Assets
7. Strategy Presets
8. Internal Metadata
9. Trainer Assets
10. Team Card Assets

---

# Primary External Data Source

## PokéAPI

Primary source:
```text
https://pokeapi.co
```

PokéAPI is the MAIN external Pokémon database source.

---

# Why PokéAPI?

Advantages:
- free
- stable
- massive Pokémon coverage
- REST API structure
- community-supported
- widely used

The MVP should primarily rely on:
```text
PokéAPI
```

for structured Pokémon metadata.

---

# PokéAPI Usage Scope

Used for:
- Pokémon data
- moves
- abilities
- typings
- stats
- forms
- generations

NOT heavily used for:
- sprites
- advanced competitive metadata
- custom recommendation logic

---

# Important PokéAPI Philosophy

IMPORTANT:
Do NOT directly rely on PokéAPI everywhere inside frontend components.

Instead:

```text
PokéAPI
→ Normalize Data
→ Internal Types
→ Application Usage
```

This improves:
- maintainability
- consistency
- flexibility

---

# Recommended Data Fetching Architecture

GOOD:

```text
External API
→ Service Layer
→ Normalized Internal Data
→ UI
```

BAD:

```text
Component directly fetching random PokéAPI endpoints
```

---

# Recommended Service Folder

```text
src/lib/services/
```

Examples:

```text
pokemon-service.ts
move-service.ts
ability-service.ts
```

---

# Pokémon Data

## Source

Primary:
```text
PokéAPI Pokémon endpoint
```

Example:

```text
https://pokeapi.co/api/v2/pokemon/charizard
```

---

# Pokémon Data Used

Included:
- id
- name
- typing
- stats
- abilities
- moves
- forms
- sprite references

---

# Pokémon Data Excluded

Excluded:
- encounter locations
- anime references
- lore-heavy flavor text
- unnecessary multilingual entries

The MVP intentionally keeps Pokémon data:
```text
lightweight
```

---

# Pokémon Data Normalization

Recommended internal interface:

```ts
interface Pokemon {
  id: number;
  name: string;
  slug: string;

  types: PokemonType[];

  stats: BaseStats;

  abilities: PokemonAbility[];

  sprite: string;
}
```

Avoid:
- using raw PokéAPI structures directly

---

# Move Data

## Source

Primary:
```text
PokéAPI Move endpoint
```

Example:

```text
https://pokeapi.co/api/v2/move/flamethrower
```

---

# Move Data Used

Included:
- move name
- type
- category
- power
- accuracy
- PP
- move effects optional
- targeting optional

---

# Move Data Excluded

Excluded:
- contest data
- flavor text overload
- multilingual descriptions

---

# Move Search Philosophy

Move search should rely on:
- preprocessed normalized move lists

Avoid:
- runtime-heavy move fetching

---

# Ability Data

## Source

Primary:
```text
PokéAPI Ability endpoint
```

---

# Ability Data Used

Included:
- ability name
- hidden ability flag
- short description optional

---

# Ability Data Excluded

Excluded:
- giant lore descriptions
- multilingual entries

---

# Item Data

## Source

Primary:
```text
PokéAPI Item endpoint
```

---

# Item Data Used

Included:
- item name
- item category
- icon optional
- short effect summary optional

---

# Item Data Philosophy

The MVP only needs:
```text
competitive-relevant item support
```

Avoid:
- loading thousands of unnecessary items initially

---

# Type Chart Data

## IMPORTANT

The type chart should NOT rely on runtime external APIs.

---

# Recommended Approach

Store internally:

```text
src/data/type-chart.ts
```

Reason:
- static
- lightweight
- faster calculations
- avoids unnecessary requests

---

# Type Chart Philosophy

The type chart is:
```text
core calculation infrastructure
```

It should remain:
- internal
- stable
- deterministic

---

# Stat Tier Data

## Internal Source

Recommended:
```text
src/data/stat-tiers.ts
```

This file defines:
- speed tiers
- attack tiers
- defensive tiers

---

# Recommendation Metadata

## Internal Data

The recommendation system requires:
- role definitions
- synergy tags
- strategy tags

These should remain:
```text
internally controlled
```

---

# Recommended Metadata Files

```text
src/data/
│
├── role-definitions.ts
├── synergy-tags.ts
├── move-tags.ts
├── strategy-tags.ts
└── stat-tiers.ts
```

---

# Why Internal Metadata?

Because:
- recommendations are custom logic
- role systems are subjective
- strategy classification is project-specific

Avoid:
```text
fully outsourcing recommendation intelligence
```

---

# Role Classification Philosophy

Roles such as:
- sweeper
- wall
- pivot
- support

should be internally defined.

This allows:
- consistent recommendation behavior
- maintainable scoring systems

---

# Strategy Team Data

## Source Type

Internal static data initially.

Recommended folder:

```text
src/data/strategies/
```

---

# Strategy Data Structure

Recommended:

```text
rain/
sun/
trick-room/
monotype/
```

Each strategy contains:
- metadata
- Pokémon
- moves
- items
- explanations

---

# Why Internal Strategy Data?

Reason:
- full control
- curated quality
- easier balancing
- consistent UX

---

# Sprite Asset Sources

## IMPORTANT

Sprites are one of the most important visual systems.

---

# Recommended Sprite Sources

Recommended:
- official Pokémon sprites
- Pokémon Showdown sprites optional
- PokéAPI sprite CDN optional

---

# Sprite Philosophy

The MVP uses:
```text
2D sprites only
```

Team Builder:
```text
normal sprites only
```

Team Card Generator:
- normal sprites
- shiny sprites

---

# Recommended Sprite Strategy

BEST PRACTICE:
```text
download and locally host sprites
```

inside:

```text
public/sprites/
```

Avoid:
- runtime dependency on external sprite URLs

---

# Why Local Sprite Hosting?

Advantages:
- faster loading
- stable URLs
- no third-party downtime
- easier caching
- cleaner exports

---

# Sprite Folder Structure

```text
public/sprites/
│
├── normal/
└── shiny/
```

---

# Trainer Assets

## Source Type

Internally stored assets.

Folder:

```text
public/trainers/
```

---

# Trainer Asset Philosophy

The MVP supports:
```text
preset trainers only
```

No custom uploads.

---

# Background Assets

## Source Type

Internally stored assets.

Folder:

```text
public/backgrounds/
```

---

# Team Card Background Philosophy

Use:
- curated backgrounds
- lightweight images
- visually clean assets

Avoid:
- giant noisy artwork

---

# Type Icons

## Recommended Format

```text
SVG
```

Folder:

```text
public/types/
```

---

# Type Icon Philosophy

Type icons should:
- remain lightweight
- scale cleanly
- support dark mode

---

# Caching Strategy

## Philosophy

Pokémon data changes extremely rarely.

Therefore:
```text
aggressive caching is recommended
```

---

# Recommended Cache Targets

Cache:
- Pokémon data
- move data
- ability data
- strategy metadata

---

# React Query Caching

Recommended:

```ts
staleTime: 1000 * 60 * 60
```

for stable Pokémon data.

---

# Static Data Philosophy

Prefer:
```text
static internal files
```

for:
- type chart
- stat tiers
- role definitions
- strategy metadata

---

# API Rate Limit Philosophy

PokéAPI is free but public.

Avoid:
- excessive repeated requests
- uncontrolled runtime fetching

---

# Recommended Pokémon Data Strategy

BEST PRACTICE:

At build time or initialization:
```text
fetch + normalize Pokémon data
```

Then:
```text
store/cache internally
```

---

# Offline Resilience Philosophy

The application should still function reasonably if:
- PokéAPI temporarily fails

This is easier if:
- normalized data
- cached data
- static assets

exist locally.

---

# Data Normalization Philosophy

All external data should pass through:
```text
normalization layer
```

before entering:
- stores
- calculations
- UI systems

---

# Recommended Normalization Folder

```text
src/lib/normalizers/
```

Examples:

```text
normalize-pokemon.ts
normalize-move.ts
normalize-ability.ts
```

---

# Naming Consistency Rules

Use:
```text
lowercase-kebab-case slugs
```

Examples:

```text
rotom-wash
great-tusk
iron-valiant
```

Avoid:
- inconsistent naming
- raw API naming everywhere

---

# Data Validation Philosophy

Never fully trust external API data.

Validate:
- required fields
- move lists
- type arrays
- stat values

before usage.

---

# Internal Source Priority

Preferred priority order:

```text
1. Internal static metadata
2. Cached normalized data
3. External API fallback
```

---

# Copyright Philosophy

IMPORTANT:
Pokémon assets and data belong to:
- Nintendo
- Game Freak
- The Pokémon Company

PokemonTeamForge should remain:
- educational
- portfolio-focused
- non-commercial

---

# Attribution Philosophy

Optional recommended README attribution:

```text
Pokémon data provided by PokéAPI.
Pokémon and Pokémon character names are trademarks of Nintendo/Game Freak/The Pokémon Company.
```

---

# Future Expansion Support

The data architecture should support future additions such as:
- advanced metadata
- AI systems
- public APIs
- competitive statistics
- matchup systems

without major restructuring.

---

# Important Data Rules

## Normalize external data

Avoid:
```text
raw API structures everywhere
```

---

# Cache aggressively

Pokémon data changes very rarely.

---

# Prefer internal metadata for recommendation logic

Recommendation systems should remain:
- deterministic
- internally controlled

---

# Host important assets locally

Especially:
- sprites
- type icons
- backgrounds

---

# Keep MVP lightweight

Avoid:
- unnecessary gigantic datasets
- over-fetching
- excessive external dependencies

---

# Final Goal

The data source architecture should provide:
- stable Pokémon data
- maintainable integrations
- scalable metadata systems
- fast loading
- lightweight runtime behavior
- recommendation-friendly structures

The data systems should support:
```text
a fast, modern, maintainable Pokémon strategy platform
```

without creating:
- fragile dependencies
- uncontrolled API usage
- inconsistent data behavior