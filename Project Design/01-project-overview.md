# PokemonTeamForge — Project Overview

## Overview

PokemonTeamForge is a modern Pokémon team builder platform focused on:

- team building
- team analysis
- strategy presets
- recommendation systems
- team visualization

The website is inspired by:
- https://mypokemonteam.com
- https://pokemondb.net

However, the project should NOT directly clone either website.

Instead, the goal is to create:
- a cleaner UI
- a more modern UX
- a more scalable architecture
- a stronger team-building workflow
- a better overall user experience

The project should prioritize:
- speed
- usability
- maintainability
- responsive design
- scalable architecture
- clean visual presentation

---

# Core Product Philosophy

PokemonTeamForge is NOT intended to be:
- a battle simulator
- a hardcore competitive calculator
- a full Pokédex encyclopedia

The platform intentionally avoids overly complex competitive mechanics such as:
- EVs
- IVs
- Natures
- damage calculations
- Smogon usage statistics
- AI-generated recommendations

The website should remain:
- approachable
- visually clean
- easy to use
- fast to navigate
- understandable for casual and intermediate players

The recommendation system should be logic-based and rule-based, NOT AI-based.

---

# Main Target Users

The website targets:
- Pokémon fans
- casual competitive players
- intermediate team builders
- strategy-focused players
- Pokémon content creators
- users who enjoy building and sharing teams

---

# Core MVP Features

The MVP version of the website must include:

1. Manual Team Builder
2. Defensive Coverage Analysis
3. Offensive Type Coverage Analysis
4. Team Checklist System
5. Recommendation Engine
6. Preset Strategy Teams
7. Lightweight Pokédex
8. Import / Export / Copy Team
9. Team Card Generator

---

# Main Website Sections

The website should contain the following primary pages:

- Home
- Team Builder
- Pokédex
- Strategy Teams
- Team Card Generator
- Login/Profile

The Team Builder should be the primary focus of the platform.

---

# Team Builder Philosophy

The Team Builder is the most important feature of the project.

The builder must support:
- Singles
- Doubles
- Triples

Each team can contain up to 6 Pokémon.

Each Pokémon slot should include:
- Pokémon name
- 2D normal sprite
- ability selection
- item selection
- four move slots
- remove button
- replace button

For the MVP:
- only 2D normal sprites are used inside the Team Builder
- no animated 3D models
- no heavy motion assets

Reasoning:
- better performance
- simpler implementation
- faster loading
- lower maintenance complexity

The Team Builder should feel:
- responsive
- smooth
- lightweight
- modern
- clean

---

# Coverage Analysis System

Coverage analysis must update in real time whenever:
- Pokémon changes
- abilities change
- items change
- moves change

Two major systems are required:

## Defensive Coverage

Analyze:
- weaknesses
- resistances
- immunities

for all Pokémon types.

The UI should visually indicate:
- weaknesses in red
- resistances in green
- neutral values in gray

## Offensive Coverage

Offensive coverage MUST be based on selected moves.

It should NOT rely only on Pokémon typings.

Example:
If a team contains:
- Thunderbolt
- Wild Charge

then the team has Electric offensive coverage.

The system should identify:
- missing offensive coverage
- strong offensive pressure
- uncovered types

---

# Team Checklist System

The Team Checklist evaluates whether a team contains important battle roles and utilities.

Checklist logic changes depending on:
- Singles
- Doubles
- Triples

Example checklist categories include:
- hazards
- hazard removal
- pivots
- recovery
- setup sweepers
- speed control
- weather support
- Trick Room support
- Fake Out
- spread moves

The checklist should dynamically update as the team changes.

---

# Recommendation Engine

The recommendation engine is fully rule-based.

No AI-generated recommendations should be used.

The recommendation system should analyze:
- defensive weaknesses
- offensive gaps
- missing roles
- type synergy
- ability synergy
- format compatibility
- stat tier compatibility

The engine should support filters such as:
- No legendary / mythical
- Generation
- Region
- Type
- Role
- Format
- Attack tier
- Defense tier
- Sp. Atk tier
- Sp. Def tier
- Speed tier

The engine should return:
- ranked recommendations
- short explanation text
- synergy reasoning

The recommendation system should remain understandable and transparent.

---

# Preset Strategy Teams

The website should include preset strategy teams.

Examples:
- Rain
- Sun
- Sand
- Snow
- Trick Room
- Tailwind
- Monotype
- Stall
- Balance
- Hyper Offense
- Bulky Offense
- Intimidate Core
- Trap

Each preset team should include:
- team name
- strategy type
- format
- Pokémon
- abilities
- items
- moves
- roles
- difficulty
- explanation

Users should be able to:
- browse preset teams
- select a preset
- instantly load the preset into the Team Builder
- modify the preset afterward

---

# Lightweight Pokédex

The Pokédex exists primarily to support the Team Builder.

The Pokédex is intentionally lightweight.

It should NOT attempt to replicate the full functionality of:
https://pokemondb.net

The Pokédex should include:
- Pokémon name
- sprite
- typing
- base stats
- abilities
- moves
- optional evolution chart
- type defense chart
- Add to Team button

The Pokédex should NOT include:
- breeding information
- training information
- lore-heavy Pokédex entries
- language translations
- massive sprite archives
- Q&A sections
- encounter locations

The Pokédex should remain:
- fast
- lightweight
- easy to browse

---

# Import / Export System

The website should support:
- Import Team
- Export Team
- Copy Team

Formatting should resemble Pokémon Showdown style formatting.

Example:

Charizard @ Heavy-Duty Boots
Ability: Blaze
- Flamethrower
- Air Slash
- Roost
- Dragon Pulse

EVs, IVs, and Natures are intentionally excluded.

---

# Team Card Generator

The Team Card Generator creates visual shareable team cards.

The MVP does NOT support custom uploads.

Only prepared assets should be used.

Prepared assets include:
- preset backgrounds
- preset trainer images
- Pokémon sprites

The Team Card Generator should support:
- normal sprites
- shiny sprites

The generated card should include:
- team name
- trainer image
- selected background
- Pokémon sprites
- format label
- optional type icons

The card should export as PNG.

---

# Authentication

Authentication uses:
- Supabase Auth

Guest users should still be able to:
- build teams
- analyze teams
- use recommendations
- import/export teams

Logged-in users can additionally:
- save teams
- load teams
- manage favorites
- manage team cards

---

# UI / UX Direction

The website should feel:
- modern
- responsive
- clean
- dark-theme focused
- dashboard-oriented

The Team Builder layout should generally follow:

LEFT SIDE:
- Pokémon slots

RIGHT SIDE:
- defensive coverage
- offensive coverage
- checklist
- recommendations

The website should avoid visual clutter.

The UI should feel cleaner and smoother than:
https://mypokemonteam.com

---

# Technical Stack

Frontend:
- Next.js
- TypeScript

Styling:
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js API Routes

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

Hosting:
- Vercel

State Management:
- Zustand

Async Fetching:
- TanStack Query

Icons:
- Lucide React

Image Export:
- html-to-image

---

# Performance Philosophy

Performance is extremely important.

The platform should:
- load quickly
- avoid unnecessary animations
- avoid heavy assets
- minimize unnecessary API requests

The MVP should avoid:
- 3D animated Pokémon models
- excessive visual effects
- constant frontend API fetching

Pokémon data should be:
- cached
- normalized
- optimized

---

# Final MVP Goal

The final MVP should feel like:

"A modern Pokémon team-building platform with clean UX, strong analysis systems, strategy presets, and visual team sharing tools."

The project should prioritize:
- usability
- clarity
- speed
- scalability
- maintainability
- enjoyable team-building workflows

The MVP should remain fully achievable using free-tier technologies and services.