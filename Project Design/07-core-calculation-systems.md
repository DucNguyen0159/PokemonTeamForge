# Core Calculation Systems

## Overview

This document defines the core calculation systems used throughout PokemonTeamForge.

These systems are the "brain" of the application.

They power:
- defensive coverage analysis
- offensive coverage analysis
- team checklist analysis
- recommendation engine scoring
- strategy validation

These systems are among the MOST IMPORTANT parts of the entire project.

The calculation architecture should prioritize:
- accuracy
- consistency
- performance
- scalability
- maintainability
- deterministic behavior

The systems should avoid:
- duplicated calculations
- inconsistent logic
- hidden side effects
- hardcoded UI-specific logic
- tightly coupled systems

---

# Core System Philosophy

PokemonTeamForge is fundamentally:
- a team analysis platform
- a recommendation platform
- a team optimization platform

The calculation systems should therefore:
- remain centralized
- remain reusable
- remain deterministic
- remain explainable

All major systems should derive from:
```text
current team state
```

The architecture should follow:

```text
Team State
→ Core Calculations
→ Analysis Results
→ UI Rendering
```

---

# Core Calculation Categories

The project contains 4 major calculation systems:

1. Defensive Coverage System
2. Offensive Coverage System
3. Team Checklist System
4. Recommendation Support Calculations

---

# Recommended Folder Structure

```text
src/lib/calculations/
│
├── defensive/
├── offensive/
├── checklist/
├── recommendation-support/
├── shared/
└── types/
```

---

# Shared Calculation Philosophy

Shared utilities should exist inside:

```text
shared/
```

Examples:
- type effectiveness helpers
- Pokémon type extraction
- move filtering
- role extraction
- stat tier utilities

Avoid duplicating logic across systems.

---

# Type Chart System

The Type Chart is the foundation of almost every calculation system.

It powers:
- defensive coverage
- offensive coverage
- recommendation analysis
- weakness analysis

---

# Type Chart Structure

Recommended file:

```text
src/data/type-chart.ts
```

Recommended structure:

```ts
export const TYPE_CHART = {
  fire: {
    weakTo: ["water", "ground", "rock"],
    resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    immuneTo: []
  }
};
```

Alternative structure:

```ts
export const TYPE_EFFECTIVENESS = {
  fire: {
    grass: 2,
    water: 0.5,
    rock: 0.5
  }
};
```

IMPORTANT:
Choose ONE consistent structure and use it across the entire project.

---

# Type Effectiveness Philosophy

The system should support:
- 0x immunity
- 0.25x resistance
- 0.5x resistance
- 1x neutral
- 2x weakness
- 4x weakness

The calculations must correctly support:
- dual typings
- immunities
- stacked resistances

---

# Defensive Coverage System

## Purpose

The Defensive Coverage System analyzes:
- team weaknesses
- resistances
- immunities

This system helps users identify:
- dangerous shared weaknesses
- missing resistances
- strong defensive synergy

---

# Defensive Coverage Workflow

Main flow:

```text
Current Team
→ Extract Pokémon typings
→ Calculate type effectiveness
→ Aggregate results
→ Generate coverage summary
```

---

# Defensive Coverage Calculations

For every attacking type:
- calculate effectiveness against each Pokémon
- classify:
  - weakness
  - resistance
  - immunity
  - neutral

Example:

```text
Ground:
- Weak: 3
- Resist: 1
- Immune: 1
```

---

# Dual Typing Calculations

Dual typing must multiply effectiveness.

Example:

```text
Charizard
Fire/Flying

Electric:
1x against Fire
2x against Flying

Final:
2x weakness
```

Example:

```text
Scizor
Bug/Steel

Fire:
2x against Bug
2x against Steel

Final:
4x weakness
```

---

# Immunity Handling

Immunities override multipliers.

Example:

```text
Ground vs Flying
0x effectiveness
```

Final result:
```text
immune
```

even if secondary typing would normally take damage.

---

# Defensive Coverage Output

Recommended result structure:

```ts
interface DefensiveCoverageResult {
  entries: DefensiveCoverageEntry[];
  summary: DefensiveCoverageSummary;
}
```

The system should provide:
- raw effectiveness data
- UI-friendly summaries
- recommendation-ready metadata

---

# Major Weakness Detection

The system should detect:
- dangerous stacked weaknesses

Example:

```text
3+ Pokémon weak to Ground
```

This should trigger:
- warning indicators
- recommendation penalties

---

# Defensive Synergy Detection

The system should also identify:
- good defensive coverage balance

Examples:
- Ground immunity support
- Steel resistance support
- Dragon/Fairy synergy

This becomes useful for:
- recommendation explanations
- strategy evaluations

---

# Offensive Coverage System

## Purpose

The Offensive Coverage System analyzes:
- attack move coverage
- offensive pressure
- uncovered types

IMPORTANT:
This system MUST use:
```text
selected moves
```

NOT only Pokémon typings.

---

# Offensive Coverage Workflow

```text
Current Team
→ Extract selected moves
→ Extract move types
→ Calculate super-effective coverage
→ Aggregate coverage
→ Generate offensive summary
```

---

# Offensive Coverage Logic

For every defending type:
- determine whether the team has super-effective move coverage

Example:

```text
Team contains:
- Thunderbolt
- Wild Charge

Result:
Electric offensive coverage exists
```

---

# Offensive Coverage Rules

The system should analyze:
- move types
- move categories
- optional utility tags

Coverage should be determined by:
```text
move type effectiveness
```

NOT:
```text
Pokémon typing
```

---

# Offensive Coverage Output

Recommended structure:

```ts
interface OffensiveCoverageResult {
  entries: OffensiveCoverageEntry[];
  summary: OffensiveCoverageSummary;
}
```

The output should identify:
- covered types
- uncovered types
- matching moves
- matching Pokémon

---

# Missing Offensive Coverage

Examples:
- no Ground coverage
- no Fairy coverage
- weak anti-Steel options

These become:
- recommendation opportunities
- checklist warnings

---

# Offensive Pressure Philosophy

The MVP should focus on:
- basic type coverage

NOT:
- damage calculations
- exact matchup simulations
- advanced competitive mathematics

Keep the system understandable.

---

# Team Checklist System

## Purpose

The Team Checklist System evaluates:
- utility completeness
- role completeness
- strategic tools

The checklist changes depending on:
- Singles
- Doubles
- Triples

---

# Checklist Workflow

```text
Current Team
→ Analyze moves
→ Analyze roles
→ Analyze abilities
→ Match checklist requirements
→ Generate completion report
```

---

# Checklist Categories

Examples:

Singles:
- Entry Hazard
- Hazard Removal
- Recovery
- Setup Sweeper
- Wallbreaker
- Pivot

Doubles:
- Protect
- Fake Out
- Speed Control
- Spread Moves
- Redirection

Triples:
- Spread Pressure
- Positioning Support
- Speed Control

---

# Checklist Detection Methods

Checklist items may derive from:
- move tags
- Pokémon roles
- abilities
- typing synergy

Examples:

```text
Stealth Rock
→ Entry Hazard
```

```text
Rapid Spin
→ Hazard Removal
```

```text
Tailwind
→ Speed Control
```

```text
Follow Me
→ Redirection
```

---

# Move Tag System

Move tags are extremely important.

Recommended file:

```text
src/data/move-tags.ts
```

Example:

```ts
{
  "stealth-rock": ["entry_hazard"],
  "rapid-spin": ["hazard_removal"],
  "roost": ["recovery"],
  "tailwind": ["speed_control"]
}
```

This system powers:
- checklist analysis
- recommendations
- strategy validation

---

# Role Detection System

Role detection should combine:
- stat profiles
- move tags
- abilities
- curated role data

Example:

```text
Corviknight
→ Pivot
→ Physical Wall
→ Hazard Removal
```

A Pokémon may have multiple roles.

---

# Checklist Completion Philosophy

Checklist completion should remain:
- informative
- understandable
- non-punitive

Avoid:
- "perfect team" assumptions
- overcomplicated grading systems

The goal is:
```text
helpful guidance
```

NOT:
```text
strict competitive enforcement
```

---

# Recommendation Support Calculations

These systems support:
- recommendation scoring
- synergy evaluation
- team balancing

These calculations should remain modular.

---

# Stat Tier System

Recommended file:

```text
src/data/stat-tiers.ts
```

Example:

```ts
export const ATTACK_TIERS = {
  low: [0, 70],
  medium: [71, 100],
  high: [101, 130],
  very_high: [131, 999]
};
```

Used for:
- recommendation filters
- strategy analysis

---

# Role Synergy Calculations

The system should identify:
- missing roles
- duplicated roles
- role balance

Examples:
- too many walls
- no speed control
- no pivot
- no setup pressure

These affect:
- recommendation scores
- checklist summaries

---

# Ability Synergy Calculations

Examples:
- Intimidate synergy
- Rain synergy
- Sun synergy
- Levitate support
- Trick Room synergy

The MVP should keep this system:
- moderate complexity
- understandable
- explainable

Avoid:
- hyper-specific competitive edge cases

---

# Format Modifier System

Calculations should adapt to:
- Singles
- Doubles
- Triples

Example:

```text
Protect
```

Highly valuable in:
- Doubles
- Triples

Less important in:
- Singles

---

# Recommendation Support Workflow

```text
Current Team
→ Analyze weaknesses
→ Analyze missing roles
→ Analyze offensive gaps
→ Analyze defensive gaps
→ Analyze format compatibility
→ Generate scoring metadata
```

This metadata feeds:
```text
Recommendation Engine
```

---

# Shared Calculation Utilities

Recommended utilities:

```text
shared/
│
├── calculate-type-effectiveness.ts
├── get-pokemon-types.ts
├── get-move-tags.ts
├── get-pokemon-roles.ts
├── get-stat-tier.ts
└── normalize-effectiveness.ts
```

---

# Memoization Philosophy

Heavy calculations should use:
- memoization
- derived state
- optimized selectors

Examples:
- coverage calculations
- recommendation scoring
- checklist generation

Avoid:
- recalculating entire systems unnecessarily

---

# Calculation Purity Rules

Core calculations should remain:
- pure
- deterministic
- side-effect free

GOOD:
```ts
calculateDefensiveCoverage(team)
→ returns result
```

BAD:
```ts
calculateDefensiveCoverage(team)
→ mutates store directly
```

---

# UI Separation Philosophy

Calculation systems should NOT:
- know about UI
- know about components
- know about styling

Core systems should only:
- receive data
- return results

---

# Error Handling Philosophy

Calculation systems should handle:
- missing Pokémon
- missing moves
- incomplete teams
- invalid move data

The systems should fail gracefully.

Example:
- empty move slots should not crash offensive coverage

---

# Performance Philosophy

The calculation systems must feel:
- instant
- lightweight
- responsive

The Team Builder should update smoothly while:
- changing Pokémon
- changing moves
- changing filters

Avoid:
- expensive repeated loops
- duplicated calculations
- large unnecessary recomputations

---

# Scalability Philosophy

The systems should support future features such as:
- advanced recommendations
- battle simulations
- matchup analysis
- AI systems
- competitive tiers

without major rewrites.

---

# Final Goal

The Core Calculation Systems should provide:
- accurate analysis
- fast calculations
- reusable logic
- deterministic behavior
- recommendation support
- scalable architecture

These systems are the analytical foundation of PokemonTeamForge.