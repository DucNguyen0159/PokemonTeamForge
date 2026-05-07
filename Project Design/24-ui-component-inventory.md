# UI Component Inventory

## Overview

This document defines the complete UI component inventory for PokemonTeamForge.

The purpose of this document is to:
- centralize reusable UI systems
- prevent duplicated components
- improve frontend consistency
- simplify development
- improve maintainability
- help Cursor AI understand reusable architecture

PokemonTeamForge contains many interconnected systems:
- Team Builder
- recommendation systems
- coverage analysis
- Pokédex browsing
- Team Card generation
- authentication flows

Therefore:
```text
UI consistency is extremely important
```

The component inventory should ensure:
- reusable design patterns
- consistent interactions
- predictable UX
- scalable frontend architecture

The project should avoid:
- duplicated components
- inconsistent UI patterns
- repeated styling logic
- feature-specific reinventions
- fragmented design systems

---

# Component Philosophy

The UI system should follow:
```text
build once, reuse everywhere
```

Every reusable pattern should ideally become:
- a shared component
- a reusable primitive
- a composable system

The UI should feel:
- unified
- modern
- predictable
- polished

---

# Component Categories

The UI inventory is divided into:

1. Layout Components
2. Navigation Components
3. Team Builder Components
4. Coverage Components
5. Recommendation Components
6. Pokédex Components
7. Search Components
8. Form Components
9. Modal Components
10. Team Card Components
11. Feedback Components
12. Utility Components
13. Authentication Components
14. Shared Display Components

---

# Recommended Folder Structure

```text
src/components/
│
├── builder/
├── coverage/
├── recommendation/
├── pokedex/
├── search/
├── team-card/
├── auth/
├── layout/
├── shared/
├── feedback/
├── modals/
└── ui/
```

---

# Layout Components

## Purpose

Layout components define:
- page structure
- spacing systems
- responsive wrappers

---

# PageContainer

## Purpose

Primary responsive content wrapper.

Responsibilities:
- max width
- padding
- responsive spacing

Used in:
- all pages

---

# SectionWrapper

## Purpose

Reusable section spacing component.

Responsibilities:
- vertical spacing
- section consistency

---

# DashboardLayout

## Purpose

Main application dashboard structure.

Used for:
- Team Builder page
- analysis pages

---

# SidebarLayout

## Purpose

Responsive sidebar system.

Supports:
- desktop sidebar
- mobile collapse

---

# Navigation Components

---

# Navbar

## Purpose

Primary site navigation.

Features:
- logo
- navigation links
- responsive menu
- auth buttons

---

# MobileMenu

## Purpose

Mobile navigation drawer.

Features:
- hamburger menu
- slide-out navigation

---

# Breadcrumbs

## Purpose

Optional route navigation support.

Used for:
- Pokémon pages
- strategy pages

---

# Team Builder Components

## MOST IMPORTANT COMPONENT CATEGORY

The Team Builder is the core platform feature.

---

# TeamBuilder

## Purpose

Main Team Builder orchestration component.

Responsibilities:
- slot coordination
- builder layout
- panel composition

---

# TeamHeader

## Purpose

Displays:
- team title
- format selector
- controls

---

# TeamSlots

## Purpose

Container for all Pokémon slots.

---

# PokemonSlot

## Purpose

Single Pokémon slot system.

Responsibilities:
- Pokémon display
- move management
- item selection
- ability selection

---

# PokemonSlotHeader

## Purpose

Displays:
- sprite
- name
- typing

---

# PokemonSprite

## Purpose

Reusable Pokémon sprite renderer.

Supports:
- normal sprite
- shiny sprite optional

---

# TypeBadges

## Purpose

Displays Pokémon typing.

Reusable across:
- Team Builder
- Pokédex
- recommendation cards

---

# AbilitySelector

## Purpose

Ability selection dropdown.

---

# ItemSelector

## Purpose

Item selection dropdown.

---

# MoveList

## Purpose

Container for move slots.

---

# MoveSlot

## Purpose

Single move selection row.

---

# MoveSelector

## Purpose

Move search dropdown.

Supports:
- move filtering
- search matching

---

# SlotActions

## Purpose

Contains:
- remove button
- replace button

---

# EmptyPokemonSlot

## Purpose

Placeholder for empty slots.

---

# BuilderControls

## Purpose

Contains:
- import
- export
- clear team
- copy team

---

# FormatSelector

## Purpose

Switch between:
- Singles
- Doubles
- Triples

---

# Coverage Components

---

# CoveragePanel

## Purpose

Main coverage analysis container.

---

# DefensiveCoverage

## Purpose

Displays:
- weaknesses
- resistances
- immunities

---

# OffensiveCoverage

## Purpose

Displays offensive move coverage.

---

# CoverageSummary

## Purpose

High-level team coverage overview.

---

# CoverageGrid

## Purpose

Grid/table visualization for type matchups.

---

# CoverageCell

## Purpose

Single matchup cell.

Reusable:
- weakness tables
- resistance tables

---

# TypeMatchupBadge

## Purpose

Displays:
- 2x
- 4x
- immunity
- resistance indicators

---

# Recommendation Components

---

# RecommendationPanel

## Purpose

Main recommendation section.

---

# RecommendationFilters

## Purpose

Contains:
- generation filters
- role filters
- stat filters

---

# RecommendationList

## Purpose

Recommendation card container.

---

# RecommendationCard

## Purpose

Displays:
- recommended Pokémon
- explanation
- synergy info

---

# RecommendationReason

## Purpose

Human-readable explanation text.

Example:

```text
Provides Ground immunity and hazard removal.
```

---

# RecommendationScore

## Purpose

Displays recommendation score.

Optional MVP visibility.

---

# AddToTeamButton

## Purpose

One-click add recommendation action.

---

# Pokédex Components

---

# PokedexGrid

## Purpose

Displays Pokémon cards.

---

# PokemonCard

## Purpose

Reusable Pokémon preview card.

Used in:
- Pokédex
- recommendations
- strategy pages

---

# PokemonHero

## Purpose

Main Pokémon detail header.

Displays:
- sprite
- name
- typing
- stats

---

# PokemonStats

## Purpose

Displays base stats.

---

# StatBar

## Purpose

Visual stat progress bar.

---

# PokemonAbilities

## Purpose

Displays ability list.

---

# PokemonMoves

## Purpose

Displays move list.

---

# EvolutionChain

## Purpose

Displays lightweight evolution flow.

---

# PokemonFilters

## Purpose

Pokédex filtering system.

---

# Search Components

---

# SearchInput

## Purpose

Reusable search field.

Supports:
- debounce
- clear button

---

# SearchModal

## Purpose

Reusable searchable modal.

Used for:
- Pokémon selection
- move selection
- item selection

---

# SearchResults

## Purpose

Displays searchable result list.

---

# SearchResultItem

## Purpose

Single result row.

---

# EmptySearchResults

## Purpose

No-result state.

---

# Form Components

---

# FilterDropdown

## Purpose

Reusable filtering dropdown.

---

# MultiSelectFilter

## Purpose

Supports multiple filter selections.

---

# ToggleSwitch

## Purpose

Reusable boolean toggle.

Examples:
- shiny toggle
- no legendary toggle

---

# CheckboxGroup

## Purpose

Reusable grouped checkboxes.

---

# SliderInput

## Purpose

Optional stat range control.

---

# Modal Components

---

# BaseModal

## Purpose

Shared modal wrapper.

---

# ImportModal

## Purpose

Team import interface.

---

# ExportModal

## Purpose

Team export interface.

---

# ConfirmationModal

## Purpose

Destructive action confirmation.

Examples:
- clear team
- delete team

---

# Team Card Components

---

# TeamCardGenerator

## Purpose

Main Team Card orchestration component.

---

# TeamCardPreview

## Purpose

Live Team Card preview.

---

# BackgroundSelector

## Purpose

Background selection grid.

---

# TrainerSelector

## Purpose

Trainer selection system.

---

# SpriteModeToggle

## Purpose

Switch:
- normal sprites
- shiny sprites

---

# ExportButton

## Purpose

PNG export trigger.

---

# Feedback Components

---

# LoadingSpinner

## Purpose

General loading state.

---

# SkeletonCard

## Purpose

Loading placeholder card.

---

# ErrorMessage

## Purpose

Reusable error display.

---

# RetryButton

## Purpose

Retry failed actions.

---

# EmptyState

## Purpose

Generic empty state UI.

---

# ToastNotification

## Purpose

Lightweight notifications.

Examples:
- team saved
- import successful

---

# Utility Components

---

# TypeBadge

## Purpose

Reusable Pokémon type badge.

Used everywhere.

---

# Divider

## Purpose

Reusable section separator.

---

# IconButton

## Purpose

Reusable compact icon button.

---

# TooltipWrapper

## Purpose

Reusable tooltip system.

---

# ScrollContainer

## Purpose

Styled scrollable wrapper.

---

# Authentication Components

---

# LoginForm

## Purpose

User login form.

---

# RegisterForm

## Purpose

User registration form.

---

# UserMenu

## Purpose

Authenticated user dropdown.

---

# ProtectedRoute

## Purpose

Auth-gated page wrapper.

---

# Shared Display Components

---

# SectionTitle

## Purpose

Reusable section heading.

---

# InfoCard

## Purpose

Reusable informational card.

---

# StatDisplay

## Purpose

Reusable stat row.

---

# BadgeGroup

## Purpose

Reusable grouped badges.

---

# Responsive Component Rules

All components should:
- support responsive layouts
- avoid fixed widths
- adapt cleanly

Especially:
- Team Builder systems
- recommendation panels

---

# Accessibility Component Rules

Components should support:
- keyboard navigation
- focus states
- readable contrast
- touch-friendly interaction

---

# Performance Component Rules

Components should:
- rerender minimally
- avoid unnecessary calculations
- isolate updates

Especially:
- PokemonSlot
- RecommendationCard
- CoverageCell

---

# Reusability Rules

Before creating a new component:
```text
check if an existing reusable component already solves the problem
```

---

# Naming Rules

Use:
```text
PascalCase component naming
```

Examples:

```text
PokemonCard
RecommendationPanel
CoverageGrid
```

---

# File Naming Rules

Use:
```text
kebab-case filenames
```

Examples:

```text
pokemon-card.tsx
coverage-grid.tsx
team-header.tsx
```

---

# Styling Rules

Use:
- Tailwind utilities
- shadcn/ui primitives
- reusable variants

Avoid:
- giant CSS files
- duplicated styling logic

---

# Component Ownership Rules

Business logic belongs in:
```text
src/lib/
```

State belongs in:
```text
src/store/
```

UI components should remain:
```text
primarily presentation-focused
```

---

# Future Scalability

The component inventory should support future systems such as:
- AI systems
- public profiles
- community systems
- advanced analysis
- battle simulators

without requiring major frontend rewrites.

---

# Important Component Inventory Rules

## Reuse aggressively

Avoid:
```text
duplicate dropdown systems
```

---

# Keep components focused

Avoid:
```text
mega-components with too many responsibilities
```

---

# Prioritize Team Builder quality

The Team Builder is:
```text
the heart of the platform
```

---

# Keep naming consistent

Consistency improves:
- maintainability
- Cursor AI understanding
- onboarding speed

---

# Final Goal

The UI component inventory should provide:
- scalable frontend organization
- reusable UI systems
- consistent interactions
- maintainable architecture
- performant rendering structure
- predictable component reuse

The UI system should make PokemonTeamForge feel:
```text
modern, polished, maintainable, and professionally structured
```

without becoming:
```text
a fragmented frontend full of duplicated components and inconsistent UI patterns
```