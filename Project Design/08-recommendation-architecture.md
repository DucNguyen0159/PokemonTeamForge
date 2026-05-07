# Recommendation Architecture

## Overview

This document defines the architecture of the Recommendation Engine used in PokemonTeamForge.

The Recommendation Engine is one of the core systems of the platform.

It powers:
- Pokémon suggestions
- team improvement guidance
- synergy analysis
- strategic recommendations
- role balancing
- weakness mitigation

The recommendation system is:
- rule-based
- deterministic
- explainable
- score-based

IMPORTANT:
The MVP does NOT use AI-generated recommendations.

The recommendation system should remain:
- understandable
- transparent
- maintainable
- scalable
- fast

The architecture should avoid:
- black-box recommendations
- hidden logic
- random suggestions
- unexplained scores
- overly complex competitive simulation

---

# Recommendation Philosophy

PokemonTeamForge is intended to help users:
- build better teams
- identify weaknesses
- improve synergy
- discover useful Pokémon
- understand team composition

The recommendation system should act like:
```text
an intelligent assistant
```

NOT:
```text
an unbeatable competitive AI coach
```

The system should provide:
- helpful suggestions
- understandable reasoning
- transparent logic

The recommendations should feel:
- practical
- logical
- readable
- beginner-friendly
- intermediate-friendly

---

# Recommendation System Goals

The engine should:
- identify missing team roles
- identify defensive weaknesses
- identify offensive coverage gaps
- identify duplicated weaknesses
- identify format incompatibilities
- identify role imbalances
- suggest synergistic Pokémon

The system should support:
- Singles
- Doubles
- Triples

---

# Recommendation Engine Workflow

High-level workflow:

```text
Current Team
→ Apply Filters
→ Analyze Team
→ Generate Candidate Pool
→ Score Candidates
→ Rank Candidates
→ Generate Explanations
→ Return Top Results
```

---

# Core Recommendation Pipeline

Recommended architecture:

```text
Recommendation Request
│
├── Filter Pipeline
├── Team Analysis Pipeline
├── Candidate Generation
├── Scoring Pipeline
├── Penalty Pipeline
├── Ranking Pipeline
└── Explanation Generator
```

Each stage should remain modular.

---

# Recommended Folder Structure

```text
src/lib/recommendation/
│
├── filters/
├── scoring/
├── penalties/
├── explanations/
├── candidates/
├── ranking/
├── format/
├── roles/
├── synergy/
├── weights/
└── utils/
```

---

# Recommendation Request

Input structure:

```ts
interface RecommendationRequest {
  team: Team;
  filters: RecommendationFilters;
}
```

The request contains:
- current team
- selected format
- filters
- user restrictions

---

# Recommendation Filters

Supported filters:

- No legendary / mythical
- Region
- Generation
- Type
- Role
- Format
- Attack tier
- Defense tier
- Sp. Atk tier
- Sp. Def tier
- Speed tier

IMPORTANT:
Legendary and mythical Pokémon are treated as ONE category.

---

# Filter Pipeline

Purpose:
- eliminate invalid candidates early
- reduce unnecessary calculations

Workflow:

```text
All Pokémon
→ Apply legendary filter
→ Apply generation filter
→ Apply region filter
→ Apply role filter
→ Apply stat filters
→ Remaining candidates
```

This pipeline improves:
- performance
- recommendation quality

---

# Candidate Pool Philosophy

The candidate pool should:
- remain reasonably large
- avoid overly strict elimination
- still provide variety

Avoid:
- returning only 1–2 Pokémon
- hyper-restrictive filtering

The recommendation engine should still feel exploratory.

---

# Team Analysis Pipeline

This stage analyzes the current team.

The analysis should identify:

## Defensive Analysis
- shared weaknesses
- missing resistances
- immunity gaps

## Offensive Analysis
- missing offensive coverage
- weak offensive pressure

## Role Analysis
- missing roles
- duplicated roles
- overloaded archetypes

## Format Analysis
- format incompatibilities
- missing format-specific tools

---

# Team Analysis Output

Recommended structure:

```ts
interface TeamAnalysis {
  defensiveWeaknesses: PokemonType[];
  missingCoverage: PokemonType[];

  missingRoles: TeamRole[];
  duplicateRoles: TeamRole[];

  formatWarnings: string[];

  offensiveStrengths: PokemonType[];
  defensiveStrengths: PokemonType[];
}
```

This output becomes the foundation for scoring.

---

# Candidate Generation

After filtering:
- generate candidate Pokémon list

Candidate generation should remain:
- broad
- lightweight
- efficient

The MVP should NOT:
- generate candidates dynamically via AI
- use machine learning
- simulate battles

---

# Scoring Pipeline

This is the core of the recommendation system.

Each candidate receives:
- bonuses
- penalties
- synergy scores

Final score determines ranking.

---

# Scoring Philosophy

Recommendations should prioritize:
- team improvement
- synergy
- coverage balance
- role balance

NOT:
- raw stat totals alone
- popularity
- Smogon usage
- competitive meta rankings

---

# Scoring Categories

Recommended categories:

1. Defensive Synergy
2. Offensive Coverage
3. Missing Role Bonus
4. Ability Synergy
5. Format Compatibility
6. Stat Tier Compatibility
7. Strategy Compatibility
8. Duplicate Weakness Penalty
9. Duplicate Role Penalty
10. Duplicate Type Penalty

---

# Defensive Synergy Scoring

Examples:
- Ground immunity support
- Fire resistance support
- Dragon/Fairy defensive synergy

Positive examples:
- Levitate supporting Ground weakness
- Steel resisting Fairy/Dragon/Ice
- Water absorbing Fire pressure

The system should reward:
- defensive balancing
- immunity coverage
- resistance coverage

---

# Offensive Coverage Scoring

Examples:
- adding Ground coverage
- improving anti-Steel options
- improving Fairy coverage

The system should reward:
- broader offensive reach
- fixing uncovered types
- strong offensive synergy

The system should NOT:
- calculate exact damage
- simulate competitive matchups

---

# Missing Role Bonus

Examples:
- no hazard removal
- no speed control
- no pivot
- no setup pressure

Candidates that solve missing roles should receive:
```text
large positive bonuses
```

This is one of the MOST IMPORTANT scoring systems.

---

# Ability Synergy Scoring

Examples:
- Intimidate synergy
- Rain synergy
- Sun synergy
- Levitate synergy
- Trick Room synergy

The MVP should keep this system:
- understandable
- moderate complexity
- explainable

Avoid:
- obscure competitive edge cases

---

# Format Compatibility Scoring

Recommendations should adapt to:
- Singles
- Doubles
- Triples

Examples:

## Doubles bonuses
- Protect
- Fake Out
- Intimidate
- Speed control
- spread moves

## Singles bonuses
- hazards
- recovery
- pivots

## Triples bonuses
- spread pressure
- positioning support

---

# Stat Tier Compatibility

Stat tiers help:
- filtering
- recommendation balancing

Examples:
- fast revenge killer
- bulky wall
- offensive pressure

The system should NOT:
- recommend only high-stat Pokémon

Balance matters more than raw power.

---

# Strategy Compatibility

Recommendations should support:
- weather teams
- Trick Room
- Tailwind
- monotype teams
- stall
- hyper offense

Examples:
- Chlorophyll synergy in Sun
- Swift Swim synergy in Rain
- slow attackers in Trick Room

---

# Penalty Pipeline

Candidates should receive penalties for:
- duplicate weaknesses
- duplicate typings
- redundant roles
- poor format synergy

Examples:
- too many Ground weaknesses
- too many physical attackers
- too many passive walls

The penalty system prevents:
- poor recommendations
- repetitive teams
- unhealthy team structure

---

# Duplicate Weakness Penalty

Example:

```text
Current Team:
3 Ground weaknesses

Candidate:
also weak to Ground

→ penalty applied
```

This is one of the most important penalties.

---

# Duplicate Role Penalty

Example:

```text
Team already has:
- 3 walls

Candidate:
another passive wall

→ penalty
```

The engine should encourage:
- balanced role distribution

---

# Duplicate Type Penalty

Example:

```text
Team:
already contains 3 Water types

Candidate:
another Water type

→ penalty
```

This penalty should remain:
- moderate
- not absolute

Monotype teams should still remain possible.

---

# Ranking Pipeline

After scoring:
- sort candidates by final score

The system should return:
- Top 5–10 recommendations

Avoid:
- overwhelming users with giant lists

The top recommendations should feel:
- high quality
- diverse
- understandable

---

# Explanation Generator

Each recommendation should contain:
- short explanation
- synergy reasoning

Example:

```text
Rotom-Wash improves Ground immunity,
adds Electric coverage,
and supports defensive balance.
```

IMPORTANT:
This is NOT AI-generated text.

Use:
- templates
- rule-based explanation generation

---

# Explanation Philosophy

Explanations should remain:
- short
- readable
- beginner-friendly
- transparent

Avoid:
- giant paragraphs
- unexplained technical jargon
- competitive elitism

---

# Explanation Categories

Possible explanation reasons:
- defensive synergy
- offensive coverage
- missing role support
- format compatibility
- strategy synergy
- immunity support

---

# Recommendation Weights

Recommended file:

```text
src/lib/recommendation/weights/
```

Example:

```ts
export const RECOMMENDATION_WEIGHTS = {
  defensiveSynergy: 25,
  offensiveCoverage: 20,
  missingRole: 30,
  abilitySynergy: 15,
  formatCompatibility: 20,
  duplicateWeaknessPenalty: -25,
  duplicateRolePenalty: -15
};
```

IMPORTANT:
Weights should remain:
- centralized
- tweakable
- configurable

---

# Recommendation Utilities

Recommended utilities:

```text
utils/
│
├── calculate-final-score.ts
├── apply-role-bonuses.ts
├── apply-penalties.ts
├── generate-explanations.ts
├── filter-candidates.ts
└── rank-recommendations.ts
```

---

# Recommendation Performance Philosophy

The recommendation engine should feel:
- fast
- responsive
- instant

Avoid:
- expensive nested loops
- unnecessary recalculations
- giant candidate pools

---

# Optimization Strategy

Recommended optimizations:
- memoization
- candidate pre-filtering
- cached Pokémon metadata
- lightweight scoring passes

Heavy calculations should remain:
- deterministic
- cache-friendly

---

# Recommendation Trigger Philosophy

Recommendations should update:
- automatically
- in near real-time

Triggers:
- Pokémon changes
- move changes
- format changes
- filter changes

Avoid:
- unnecessary recomputation spam

Debouncing may be useful for:
- rapid filter changes

---

# Recommendation UI Philosophy

Recommendations should feel:
- helpful
- visible
- readable
- non-intrusive

The recommendation panel should:
- remain easy to scan
- prioritize clarity
- avoid overwhelming users

Each recommendation card should contain:
- Pokémon sprite
- name
- typing
- key reasons
- score indicator optional

---

# Future Expansion Support

The architecture should support future systems such as:
- AI-assisted recommendations
- matchup simulation
- meta analysis
- advanced synergy analysis
- public team optimization

without requiring major rewrites.

---

# Important Development Rules

## Recommendations must remain explainable

Every major recommendation should have:
```text
clear reasons
```

Avoid:
```text
mysterious scoring
```

---

## Avoid hardcoding recommendation logic inside components

Business logic belongs inside:
```text
src/lib/recommendation/
```

NOT inside:
```text
React components
```

---

## Keep scoring modular

Each scoring category should remain:
- isolated
- reusable
- independently adjustable

---

## Keep recommendation logic deterministic

The same team + filters should always produce:
```text
consistent results
```

---

# Final Goal

The Recommendation Architecture should provide:
- intelligent suggestions
- transparent reasoning
- balanced team guidance
- scalable scoring systems
- fast performance
- maintainable logic

The recommendation engine should become one of the defining features of PokemonTeamForge.