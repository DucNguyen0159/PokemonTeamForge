# Routing Structure

## Overview

This document defines the routing structure for PokemonTeamForge.

The project uses:
- Next.js App Router
- file-based routing
- route groups when necessary
- API Routes for backend functionality

The routing structure should prioritize:
- simplicity
- scalability
- clean URLs
- maintainability
- predictable navigation
- SEO-friendly page structure

The website should avoid:
- overly nested routes
- confusing route names
- inconsistent naming
- duplicated page functionality

---

# Routing Philosophy

PokemonTeamForge is primarily:
- a Team Builder platform
- a strategy and analysis platform

NOT:
- a lore encyclopedia
- a battle simulator

Therefore:
- Team Builder routes should remain central
- Pokédex routes should remain lightweight
- routes should feel intuitive and fast

---

# Primary Website Routes

Main application routes:

```text
/
 /builder
 /pokedex
 /pokemon/[pokemonName]
 /strategies
 /team-card
 /profile
 /login
 /register
```

These are the primary user-facing routes.

---

# Homepage Route

```text
/
```

Purpose:
- landing page
- feature overview
- navigation hub

Main homepage goals:
- introduce the platform
- direct users toward Team Builder
- showcase strategy teams
- showcase Pokémon browsing

The homepage should contain:
- hero section
- quick action buttons
- feature highlights
- strategy previews
- featured Pokémon/team cards

The homepage should remain lightweight and fast.

---

# Team Builder Route

```text
/builder
```

This is the most important route in the application.

The Team Builder page should contain:
- Pokémon slots
- coverage analysis
- recommendation system
- checklist system
- import/export tools

The route should support:
- Singles
- Doubles
- Triples

Preferred URL examples:

```text
/builder
/builder?format=singles
/builder?format=doubles
```

The builder route should avoid unnecessary sub-routes unless needed later.

---

# Builder Route Philosophy

The Team Builder should function like:
- a dashboard
- a workspace
- a live analysis environment

The builder should remain:
- responsive
- fast
- interactive

Most important systems should remain visible without excessive navigation.

---

# Pokédex Route

```text
/pokedex
```

Purpose:
- browse Pokémon
- search Pokémon
- filter Pokémon
- quickly add Pokémon into teams

The Pokédex should remain lightweight.

The Pokédex route should support:
- search
- filtering
- sorting

Example query parameters:

```text
/pokedex?type=fire
/pokedex?generation=3
/pokedex?search=char
```

The Pokédex should NOT become:
- a lore encyclopedia
- a giant wiki replacement

---

# Pokémon Detail Route

```text
/pokemon/[pokemonName]
```

Examples:

```text
/pokemon/charizard
/pokemon/garchomp
/pokemon/rotom-wash
```

Purpose:
- display simplified Pokémon details
- support team building workflow

The page should contain:
- sprite
- typing
- base stats
- abilities
- moves
- optional evolution chart
- type defense chart
- Add to Team button

The route should remain:
- lightweight
- readable
- easy to navigate

---

# Dynamic Pokémon Route Philosophy

Use:
```text
pokemonName
```

instead of:
```text
pokemonId
```

Reason:
- cleaner URLs
- more readable
- SEO-friendly
- better UX

Examples:
GOOD:
```text
/pokemon/charizard
```

BAD:
```text
/pokemon/6
```

---

# Strategy Teams Route

```text
/strategies
```

Purpose:
- browse preset strategy teams
- explore playstyles
- load preset teams into Team Builder

The page should support:
- filtering
- searching
- format selection

Example filters:
- strategy type
- format
- difficulty
- region
- monotype

---

# Optional Strategy Detail Route

Optional future route:

```text
/strategies/[strategySlug]
```

Examples:

```text
/strategies/rain
/strategies/trick-room
/strategies/hyper-offense
```

Purpose:
- explain strategies
- show multiple preset teams
- strategy-specific recommendations

This route is optional for MVP.

---

# Team Card Generator Route

```text
/team-card
```

Purpose:
- generate shareable Pokémon team cards

The page should contain:
- background selection
- trainer selection
- shiny toggle
- team preview
- export button

This route should remain visually polished.

---

# Team Card Philosophy

The Team Card Generator is:
- visual
- social
- presentation-focused

The route should feel:
- clean
- smooth
- visually appealing

It should avoid:
- clutter
- excessive settings
- unnecessary complexity

---

# Authentication Routes

```text
/login
/register
```

Purpose:
- user authentication
- account creation

Authentication should remain:
- lightweight
- optional for basic usage

Guest users should still be able to:
- build teams
- analyze teams
- use recommendations

Accounts are mainly for:
- saving teams
- favorites
- syncing user data

---

# Profile Route

```text
/profile
```

Purpose:
- manage saved teams
- manage favorites
- manage account settings

Potential sections:
- Saved Teams
- Favorite Teams
- Team Cards
- Account Settings

Protected route:
- requires authentication

---

# Future Optional Routes

These routes are NOT required for MVP but should remain possible later.

Examples:

```text
/community
/user/[username]
/team/[teamId]
/builder/[teamId]
/tier-list
/meta
```

The architecture should support future expansion without requiring major route restructuring.

---

# API Route Structure

API routes use:
- Next.js API Routes
- server-side handlers

Recommended structure:

```text
/api/
│
├── pokemon/
├── recommendation/
├── coverage/
├── checklist/
├── teams/
├── strategies/
└── auth/
```

---

# Pokémon API Routes

```text
/api/pokemon
/api/pokemon/[pokemonName]
```

Purpose:
- Pokémon search
- Pokémon detail retrieval
- filtering
- cached Pokémon data access

---

# Recommendation API Routes

```text
/api/recommendation
```

Purpose:
- calculate Pokémon recommendations
- apply filters
- apply scoring logic

Request examples:
- current team
- selected format
- filters

Response examples:
- ranked recommendations
- explanations
- synergy metadata

---

# Coverage API Routes

```text
/api/coverage
```

Purpose:
- defensive coverage calculations
- offensive coverage calculations

The API should remain:
- lightweight
- deterministic
- fast

---

# Checklist API Routes

```text
/api/checklist
```

Purpose:
- calculate checklist completeness
- evaluate missing utilities/roles

---

# Teams API Routes

```text
/api/teams
/api/teams/[teamId]
```

Purpose:
- save teams
- load teams
- update teams
- delete teams

Protected routes should require authentication.

---

# Strategies API Routes

```text
/api/strategies
/api/strategies/[strategySlug]
```

Purpose:
- retrieve preset strategy teams
- retrieve strategy metadata

---

# Auth API Routes

Handled primarily by:
- Supabase Auth

Minimal custom auth routes should be created unless necessary.

---

# Route Naming Conventions

Routes should use:
- lowercase
- kebab-case
- readable slugs

GOOD:
```text
/team-card
/trick-room
/rotom-wash
```

BAD:
```text
/TeamCard
/TRICKROOM
/RotomWash
```

---

# Query Parameter Philosophy

Use query parameters for:
- filters
- sorting
- formats
- searches

Examples:

```text
/pokedex?type=fire
/pokedex?generation=4
/builder?format=doubles
/strategies?difficulty=advanced
```

Avoid creating unnecessary nested routes for filters.

---

# Navigation Philosophy

Navigation should feel:
- simple
- fast
- intuitive

The user should always understand:
- where they are
- where to go next
- how to return

Avoid:
- deep navigation trees
- hidden critical features
- excessive route transitions

---

# Route Protection Rules

Public routes:
- homepage
- builder
- pokedex
- pokemon detail pages
- strategies
- team card generator

Protected routes:
- profile
- saved teams
- favorites

Authentication should NOT block core functionality.

---

# SEO Philosophy

Important public pages should remain indexable:
- homepage
- Pokédex pages
- Pokémon detail pages
- strategy pages

Dynamic Pokémon routes should include:
- metadata
- readable titles
- type-based keywords

Example:
```text
Charizard | PokemonTeamForge
```

---

# Loading Strategy

Routes should support:
- lazy loading
- skeleton states
- fast transitions

Heavy calculations should avoid blocking page rendering.

---

# Error Routes

The project should support:
- custom 404 page
- error boundaries
- loading states

Recommended routes/files:

```text
not-found.tsx
error.tsx
loading.tsx
```

---

# Mobile Routing Philosophy

The routing structure should remain:
- identical across devices
- predictable
- responsive

Do NOT create separate mobile routes.

Use responsive layouts instead.

---

# Scalability Philosophy

The routing structure should support future expansion such as:
- community systems
- public team sharing
- public profiles
- advanced strategies
- mobile app adaptation

without requiring major route restructuring.

---

# Final Routing Goal

The routing system should feel:
- clean
- predictable
- scalable
- easy to navigate
- production-ready

The Team Builder route should remain the center of the application experience.