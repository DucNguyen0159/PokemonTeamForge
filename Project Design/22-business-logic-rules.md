# Business Logic Rules

## Overview

This document defines the core business logic rules for PokemonTeamForge.

This is one of the MOST IMPORTANT documents in the entire project.

The purpose of this document is to define:
- how the platform evaluates teams
- how recommendations work
- how roles are classified
- how synergy is interpreted
- how strategy logic functions
- how stat tiers are categorized
- how analysis systems think

This document effectively defines:
```text
how PokemonTeamForge understands Pokémon strategy
```

The rules in this document should remain:
- deterministic
- explainable
- maintainable
- scalable
- beginner-friendly
- recommendation-friendly

The system should avoid:
- black-box logic
- unexplained scoring
- random classifications
- hidden heuristics
- overly niche competitive assumptions

---

# Core Philosophy

PokemonTeamForge is NOT:
```text
a hardcore competitive simulator
```

PokemonTeamForge IS:
```text
a strategy-oriented team-building assistant
```

Therefore:
- logic should remain understandable
- classifications should remain readable
- recommendations should remain explainable

The platform should prioritize:
- team balance
- synergy
- coverage
- usability
- strategic clarity

NOT:
- hyper-competitive edge cases
- tournament-only assumptions
- obscure advanced interactions

---

# Business Logic Categories

The system is divided into:

1. Role Classification Rules
2. Stat Tier Rules
3. Recommendation Rules
4. Synergy Rules
5. Coverage Rules
6. Strategy Rules
7. Checklist Rules
8. Format Rules
9. Search Rules
10. Import Rules

---

# Role Classification Rules

## Overview

Every Pokémon may contain:
- primary role
- secondary roles

Roles are used for:
- recommendations
- checklist systems
- team analysis
- strategy generation

---

# Core Team Roles

Primary role categories:

1. Physical Sweeper
2. Special Sweeper
3. Tank
4. Wall
5. Pivot
6. Support
7. Utility
8. Hazard Setter
9. Hazard Removal
10. Speed Control

---

# Physical Sweeper Rules

A Pokémon is considered a Physical Sweeper if:

```text
Attack >= 110
AND
Speed >= 80
```

OR:
- possesses strong setup potential
- possesses strong offensive abilities

Examples:
- Dragonite
- Garchomp
- Weavile

---

# Special Sweeper Rules

A Pokémon is considered a Special Sweeper if:

```text
Sp. Atk >= 110
AND
Speed >= 80
```

Examples:
- Gengar
- Hydreigon
- Alakazam

---

# Tank Rules

A Pokémon is considered a Tank if:

```text
HP + Defense + Sp. Def is high
```

AND:
- possesses decent offensive presence

Recommended threshold:

```text
Combined bulk >= 260
```

Examples:
- Swampert
- Tyranitar
- Goodra

---

# Wall Rules

A Pokémon is considered a Wall if:

```text
Very high defensive stats
```

AND:
- lower offensive emphasis

Examples:
- Toxapex
- Blissey
- Corviknight

---

# Pivot Rules

A Pokémon is considered a Pivot if it has:
- U-turn
- Volt Switch
- Flip Turn
- Parting Shot

OR:
- strong switching utility

Examples:
- Rotom-Wash
- Landorus-Therian
- Scizor

---

# Support Rules

Support Pokémon provide:
- healing
- screens
- status
- redirection
- utility support

Examples:
- Grimmsnarl
- Clefable
- Amoonguss

---

# Utility Rules

Utility Pokémon provide:
- disruption
- status spreading
- support flexibility

Examples:
- Sableye
- Whimsicott
- Rotom forms

---

# Hazard Setter Rules

Hazard setters include Pokémon with:
- Stealth Rock
- Spikes
- Toxic Spikes
- Sticky Web

---

# Hazard Removal Rules

Hazard removal includes:
- Rapid Spin
- Defog
- Mortal Spin

---

# Speed Control Rules

Speed control includes:
- Tailwind
- Trick Room
- Thunder Wave
- Icy Wind
- Electroweb

---

# Multi-Role Philosophy

IMPORTANT:
Pokémon may have:
```text
multiple simultaneous roles
```

Example:

```text
Corviknight
→ Wall
→ Pivot
→ Hazard Removal
```

---

# Role Priority Rules

Each Pokémon should contain:
- one primary role
- optional secondary roles

The recommendation engine should prioritize:
```text
primary role first
```

---

# Stat Tier Rules

## Overview

Stat tiers simplify recommendation filtering.

The system intentionally avoids:
- advanced EV calculations
- competitive optimization math

---

# Speed Tier Rules

## Low Speed

```text
< 60
```

---

# Medium Speed

```text
60–100
```

---

# High Speed

```text
> 100
```

---

# Attack Tier Rules

## Low Attack

```text
< 70
```

---

# Medium Attack

```text
70–110
```

---

# High Attack

```text
> 110
```

---

# Defense Tier Rules

## Low Defense

```text
< 70
```

---

# Medium Defense

```text
70–100
```

---

# High Defense

```text
> 100
```

---

# Special Attack Tier Rules

## Low Sp. Atk

```text
< 70
```

---

# Medium Sp. Atk

```text
70–110
```

---

# High Sp. Atk

```text
> 110
```

---

# Special Defense Tier Rules

## Low Sp. Def

```text
< 70
```

---

# Medium Sp. Def

```text
70–100
```

---

# High Sp. Def

```text
> 100
```

---

# Recommendation Rules

## Overview

Recommendations are:
- deterministic
- score-based
- explainable

The recommendation system should prioritize:
- synergy
- balance
- weakness mitigation
- role completion

---

# Recommendation Priorities

Priority order:

1. Missing role coverage
2. Defensive synergy
3. Offensive coverage
4. Format synergy
5. Strategy synergy
6. Stat balance

---

# Missing Role Priority

IMPORTANT:
Missing critical roles receive:
```text
very high recommendation weight
```

Examples:
- no hazard removal
- no speed control
- no pivot

---

# Defensive Synergy Rules

Recommendations should reward:
- resistance coverage
- immunity coverage
- weakness mitigation

Examples:
- Levitate supporting Ground weakness
- Steel resisting Fairy/Ice
- Water resisting Fire

---

# Duplicate Weakness Rules

The recommendation system should penalize:
- repeated major weaknesses

Examples:
- too many Ground weaknesses
- too many Fairy weaknesses

---

# Duplicate Type Rules

The system should mildly penalize:
- excessive duplicate typings

BUT:
- monotype teams remain supported

---

# Offensive Coverage Rules

Recommendations should reward:
- broader move coverage
- fixing uncovered offensive gaps

IMPORTANT:
Offensive coverage derives from:
```text
selected moves
```

NOT:
```text
Pokémon typing
```

---

# Format Synergy Rules

Recommendations should adapt based on:
- Singles
- Doubles
- Triples

---

# Singles Rules

Singles prioritizes:
- hazards
- pivots
- setup pressure
- defensive stability

---

# Doubles Rules

Doubles prioritizes:
- Protect
- Fake Out
- Intimidate
- redirection
- spread moves
- speed control

---

# Triples Rules

Triples prioritizes:
- spread pressure
- positioning support
- wide team synergy

---

# Strategy Rules

## Weather Teams

---

# Rain Team Rules

Rain teams reward:
- Swift Swim
- Water offense
- Thunder synergy

Examples:
- Pelipper
- Barraskewda
- Kingdra

---

# Sun Team Rules

Sun teams reward:
- Chlorophyll
- Fire offense
- Protosynthesis optional future

Examples:
- Torkoal
- Venusaur

---

# Sand Team Rules

Sand teams reward:
- Sand Rush
- Rock/Ground/Steel synergy

---

# Snow Team Rules

Snow teams reward:
- Ice defensive synergy
- Slush Rush

---

# Trick Room Rules

Trick Room prioritizes:
```text
low Speed Pokémon
```

Examples:
- Hatterene
- Torkoal
- Amoonguss

---

# Tailwind Rules

Tailwind prioritizes:
- offensive pressure
- speed abuse

---

# Monotype Rules

Monotype teams:
- allow duplicate typings freely
- reduce duplicate type penalties

---

# Hyper Offense Rules

Hyper Offense prioritizes:
- offensive pressure
- setup sweepers
- fast pacing

---

# Stall Rules

Stall prioritizes:
- walls
- recovery
- defensive synergy

---

# Balance Rules

Balance prioritizes:
- role distribution
- flexible coverage
- mixed offense/defense

---

# Checklist Rules

## Overview

The checklist evaluates:
- role completeness
- strategic support
- utility availability

---

# Checklist Categories

Examples:
- hazard setter
- hazard removal
- speed control
- pivot
- wall
- sweeper

---

# Checklist Philosophy

The checklist should:
- guide users
- encourage balance

NOT:
```text
force rigid team structures
```

---

# Search Rules

## Pokémon Search

Search should support:
- exact match
- partial match
- case-insensitive matching

---

# Move Search Rules

Move search should:
- match real partial text
- avoid unrelated results

Example:

```text
Input:
flame

Allowed:
Flamethrower
Flame Charge

Disallowed:
Will-O-Wisp
```

---

# Import Rules

## Import Philosophy

Imports should:
- tolerate formatting variations
- fail gracefully
- preserve partial valid data

---

# Invalid Import Rules

Invalid entries should:
- display readable errors
- avoid crashing Team Builder

---

# Team Composition Rules

## Recommended Team Balance

Typical balanced teams should contain:
- offensive presence
- defensive backbone
- utility support
- speed control optional

---

# Role Diversity Rules

The recommendation system should encourage:
- role diversity
- strategic flexibility

Avoid:
- teams with 6 identical roles

---

# Coverage Rules

## Defensive Coverage

Defensive coverage evaluates:
- weaknesses
- resistances
- immunities

---

# Offensive Coverage

Offensive coverage evaluates:
- move typing
- move diversity

NOT:
- raw BST
- Pokémon popularity

---

# Immunity Rules

Immunities receive:
```text
high defensive value
```

Examples:
- Ground immunity
- Ghost immunity
- Electric immunity

---

# Ability Synergy Rules

Abilities may influence recommendations.

Examples:
- Intimidate
- Levitate
- Drizzle
- Drought

---

# Ability Philosophy

The MVP supports:
```text
important broad ability synergies
```

Avoid:
- hyper-obscure competitive interactions

---

# Legendary / Mythical Rules

The MVP treats:
```text
Legendary + Mythical
```

as:
```text
single filter category
```

Simplifies:
- UX
- filtering
- recommendation logic

---

# Region Rules

Regions are primarily:
- filtering metadata
- organizational metadata

NOT:
- competitive logic systems

---

# Evolution Rules

Evolution chains are:
- informational only

The MVP recommendation system does NOT:
- recommend evolutions dynamically

---

# Tier Philosophy

IMPORTANT:
The project intentionally avoids:
- Smogon tiers
- competitive ranking systems
- usage-based tiers

The project should remain:
```text
strategy-focused, not meta-slave focused
```

---

# AI Philosophy

IMPORTANT:
The MVP contains:
```text
NO AI recommendation logic
```

Recommendations remain:
- deterministic
- explainable
- rule-based

---

# Deterministic Logic Rules

The same:
- team
- filters
- format

should ALWAYS produce:
```text
consistent outputs
```

---

# Future Scalability Rules

The business logic architecture should support future additions such as:
- advanced synergy systems
- AI assistance
- public strategies
- matchup systems

without requiring major rewrites.

---

# Important Business Logic Rules

## Team Builder quality is highest priority

Everything supports:
```text
Team Builder UX
```

---

# Recommendations must remain explainable

Users should understand:
```text
why recommendations appear
```

---

# Avoid black-box systems

Logic should remain:
- understandable
- maintainable

---

# Avoid hyper-competitive overengineering

The MVP is:
```text
strategy-oriented
```

NOT:
```text
professional tournament software
```

---

# Preserve flexibility

The platform should:
- guide users
- not rigidly force structures

---

# Final Goal

The business logic system should provide:
- understandable strategy analysis
- explainable recommendations
- scalable role systems
- deterministic calculations
- balanced team evaluation
- maintainable architecture

The logic should make PokemonTeamForge feel:
```text
smart, strategic, reliable, and beginner-friendly
```

without becoming:
```text
an opaque hyper-competitive simulator
```