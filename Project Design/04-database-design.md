# Database Design

## Overview

This document defines the database architecture for PokemonTeamForge.

The database is designed for:
- scalability
- maintainability
- clean relational structure
- efficient querying
- future expansion
- compatibility with recommendation systems

Database provider:
- Supabase PostgreSQL

The database should support:
- user accounts
- saved teams
- preset strategy teams
- Pokémon data
- recommendation systems
- future community features

The architecture should avoid:
- duplicated data
- deeply nested structures
- unnecessary complexity
- over-normalization
- difficult querying patterns

---

# Database Philosophy

PokemonTeamForge is primarily:
- a team builder platform
- a team analysis platform
- a strategy recommendation platform

The database should prioritize:
- fast reads
- clean relationships
- predictable structures
- easy recommendation calculations

The MVP intentionally avoids:
- EV storage
- IV storage
- Nature storage
- battle logs
- replay systems
- competitive ladder systems

---

# Database Categories

The database can be logically separated into:

1. Authentication
2. Pokémon Core Data
3. Team Builder Data
4. Strategy Team Data
5. Recommendation Support Data
6. User Data
7. Future Expansion Data

---

# Authentication Tables

Authentication is primarily handled by:
- Supabase Auth

Supabase automatically creates:
- auth.users

Additional profile-related data should exist in a separate table.

---

# profiles Table

Stores additional user information.

```sql
profiles
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Matches auth.users.id |
| username | text | Unique username |
| avatar_url | text | Optional avatar |
| created_at | timestamp | Account creation time |

Notes:
- username should be unique
- profile data remains lightweight
- avoid unnecessary user metadata in MVP

---

# Pokémon Core Data

The MVP uses simplified Pokémon data focused on:
- team building
- analysis
- recommendations

NOT:
- lore
- breeding
- training
- encounter locations

---

# pokemon Table

Main Pokémon table.

```sql
pokemon
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | integer | Internal Pokémon ID |
| name | text | Pokémon name |
| slug | text | URL-friendly name |
| generation | integer | Generation number |
| primary_type | text | Main type |
| secondary_type | text | Secondary type nullable |
| hp | integer | Base HP |
| attack | integer | Base Attack |
| defense | integer | Base Defense |
| special_attack | integer | Base Sp. Atk |
| special_defense | integer | Base Sp. Def |
| speed | integer | Base Speed |
| total | integer | Total base stats |
| sprite_normal | text | Normal sprite URL |
| sprite_shiny | text | Shiny sprite URL |
| is_legendary | boolean | Legendary/Mythical combined category |
| region | text | Pokémon region |
| created_at | timestamp | Record creation |

IMPORTANT:
- Legendary and mythical Pokémon are treated as one category for simplicity
- slug should be unique
- total should be precomputed

Examples:
- charizard
- rotom-wash
- great-tusk

---

# abilities Table

Stores Pokémon abilities.

```sql
abilities
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | integer | Ability ID |
| name | text | Ability name |
| slug | text | URL-friendly name |
| description | text | Short ability description |
| created_at | timestamp | Record creation |

---

# pokemon_abilities Table

Many-to-many relationship between Pokémon and abilities.

```sql
pokemon_abilities
```

Columns:

| Column | Type | Description |
|---|---|---|
| pokemon_id | integer | Pokémon reference |
| ability_id | integer | Ability reference |
| is_hidden | boolean | Hidden ability flag |

IMPORTANT:
One Pokémon can have multiple abilities.

---

# moves Table

Stores move information.

```sql
moves
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | integer | Move ID |
| name | text | Move name |
| slug | text | URL-friendly name |
| type | text | Move type |
| category | text | Physical/Special/Status |
| power | integer | Move power nullable |
| accuracy | integer | Move accuracy nullable |
| pp | integer | Move PP |
| description | text | Move description |
| priority | integer | Move priority |
| is_spread_move | boolean | Spread move flag |
| created_at | timestamp | Record creation |

IMPORTANT:
Move data should support:
- coverage analysis
- checklist analysis
- recommendation logic

---

# pokemon_moves Table

Many-to-many relationship between Pokémon and moves.

```sql
pokemon_moves
```

Columns:

| Column | Type | Description |
|---|---|---|
| pokemon_id | integer | Pokémon reference |
| move_id | integer | Move reference |

---

# items Table

Stores held items.

```sql
items
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | integer | Item ID |
| name | text | Item name |
| slug | text | URL-friendly name |
| description | text | Item description |
| icon_url | text | Item icon |
| created_at | timestamp | Record creation |

---

# Pokémon Role System

The recommendation engine depends heavily on role classification.

A Pokémon can have multiple roles.

Examples:
- Physical Sweeper
- Pivot
- Hazard Setter
- Hazard Removal
- Support
- Tank
- Trick Room Setter
- Weather Setter

---

# roles Table

Stores role definitions.

```sql
roles
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | integer | Role ID |
| name | text | Role name |
| description | text | Role explanation |

---

# pokemon_roles Table

Many-to-many relationship between Pokémon and roles.

```sql
pokemon_roles
```

Columns:

| Column | Type | Description |
|---|---|---|
| pokemon_id | integer | Pokémon reference |
| role_id | integer | Role reference |

IMPORTANT:
This table is extremely important for:
- recommendation engine
- checklist system
- strategy analysis

---

# Teams System

Users can create and save teams.

Each team contains:
- format
- Pokémon
- moves
- items
- abilities

---

# teams Table

Stores high-level team information.

```sql
teams
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Team ID |
| user_id | uuid | User reference nullable |
| name | text | Team name |
| format | text | Singles/Doubles/Triples |
| is_public | boolean | Public visibility |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

IMPORTANT:
- guest users may not save teams permanently
- authenticated users can save/load teams

---

# team_pokemon Table

Stores Pokémon inside teams.

```sql
team_pokemon
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Team Pokémon ID |
| team_id | uuid | Team reference |
| slot | integer | Team slot 1-6 |
| pokemon_id | integer | Pokémon reference |
| ability_id | integer | Ability reference |
| item_id | integer | Item reference |
| move_1_id | integer | Move reference |
| move_2_id | integer | Move reference |
| move_3_id | integer | Move reference |
| move_4_id | integer | Move reference |
| is_shiny | boolean | Shiny flag for Team Card |
| created_at | timestamp | Creation time |

IMPORTANT:
- Team Builder itself uses normal sprites only
- is_shiny exists for Team Card Generator customization

---

# Strategy Teams System

Preset strategy teams are stored separately from user teams.

This allows:
- curated teams
- difficulty ratings
- strategy categorization

---

# strategy_teams Table

Stores preset strategy teams.

```sql
strategy_teams
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Strategy Team ID |
| name | text | Team name |
| strategy_type | text | Rain/Sun/etc |
| format | text | Singles/Doubles/Triples |
| difficulty | text | Beginner/Intermediate/Advanced |
| short_description | text | Short explanation |
| created_at | timestamp | Creation time |

---

# strategy_team_pokemon Table

Stores Pokémon inside preset strategy teams.

```sql
strategy_team_pokemon
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Record ID |
| strategy_team_id | uuid | Strategy Team reference |
| slot | integer | Team slot |
| pokemon_id | integer | Pokémon reference |
| ability_id | integer | Ability reference |
| item_id | integer | Item reference |
| move_1_id | integer | Move reference |
| move_2_id | integer | Move reference |
| move_3_id | integer | Move reference |
| move_4_id | integer | Move reference |
| role_id | integer | Main role |
| explanation | text | Short explanation |

---

# Team Card System

Stores generated team card metadata.

The MVP does NOT support custom uploads.

Only prepared assets are used.

---

# team_cards Table

```sql
team_cards
```

Columns:

| Column | Type | Description |
|---|---|---|
| id | uuid | Team Card ID |
| team_id | uuid | Team reference |
| background_slug | text | Background asset |
| trainer_slug | text | Trainer asset |
| created_at | timestamp | Creation time |

IMPORTANT:
Images themselves are NOT stored in database.
Only metadata references are stored.

---

# Favorites System

Allows users to favorite strategy teams.

---

# favorite_strategy_teams Table

```sql
favorite_strategy_teams
```

Columns:

| Column | Type | Description |
|---|---|---|
| user_id | uuid | User reference |
| strategy_team_id | uuid | Strategy Team reference |
| created_at | timestamp | Creation time |

---

# Recommendation Support Data

The recommendation engine requires:
- stat tiers
- role systems
- type systems
- format systems

Some of this may remain:
- local static data
- JSON-based
- hardcoded constants

NOT everything must be stored in SQL.

---

# Recommended Hybrid Data Philosophy

Use database for:
- users
- saved teams
- strategy teams
- Pokémon core data

Use local static files for:
- type charts
- stat tier definitions
- recommendation weights
- checklist definitions
- region definitions

Reason:
- faster performance
- easier iteration
- less database complexity

---

# Suggested Local Static Data

Examples:

```text
src/data/
│
├── type-chart.ts
├── role-definitions.ts
├── checklist-rules.ts
├── recommendation-weights.ts
├── stat-tiers.ts
└── format-rules.ts
```

---

# Important Relationships

Main relationships:

```text
pokemon
  ↳ pokemon_abilities
  ↳ pokemon_moves
  ↳ pokemon_roles

teams
  ↳ team_pokemon

strategy_teams
  ↳ strategy_team_pokemon
```

---

# Indexing Recommendations

IMPORTANT:
Create indexes for frequently queried fields.

Recommended indexes:
- pokemon.slug
- pokemon.name
- pokemon.generation
- pokemon.primary_type
- pokemon.region
- abilities.slug
- moves.slug
- teams.user_id
- strategy_teams.strategy_type

Reason:
- faster filtering
- faster searching
- faster recommendations

---

# Slug Philosophy

All public-facing entities should have slugs.

Examples:
- charizard
- rotom-wash
- trick-room
- heavy-duty-boots

Reasons:
- SEO-friendly URLs
- readable URLs
- cleaner routing
- predictable identifiers

---

# Future Expansion Support

The database should support future features such as:
- public team sharing
- comments
- community strategy voting
- advanced recommendation systems
- battle simulation
- public profiles

without major restructuring.

---

# Database Performance Philosophy

The database should prioritize:
- simple queries
- predictable relationships
- fast reads
- scalable filtering

Avoid:
- unnecessary joins
- giant JSON blobs
- duplicated Pokémon data
- deeply nested structures

---

# MVP Database Philosophy

The MVP database should remain:
- understandable
- maintainable
- scalable
- lightweight

The architecture should support growth without becoming unnecessarily complex early in development.

---

# Final Goal

The database architecture should provide:
- a strong foundation for the Team Builder
- efficient recommendation systems
- scalable strategy management
- clean user data handling
- long-term maintainability
- production-ready structure