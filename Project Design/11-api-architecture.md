# API Architecture

## Overview

This document defines the API architecture for PokemonTeamForge.

The project uses:
- Next.js API Routes
- Supabase PostgreSQL
- server-side business logic
- REST-style endpoint structure

The API architecture should prioritize:
- simplicity
- scalability
- predictable responses
- maintainability
- fast response times
- clean separation of concerns

The API should avoid:
- overengineering
- deeply nested endpoints
- inconsistent response structures
- duplicated logic
- bloated payloads

---

# API Philosophy

PokemonTeamForge is primarily:
- a Team Builder platform
- a team analysis platform
- a recommendation platform

The APIs should therefore focus on:
- fast data retrieval
- lightweight calculations
- predictable outputs
- responsive UX support

The API layer should remain:
- modular
- deterministic
- cache-friendly
- frontend-friendly

---

# Backend Architecture Philosophy

The project uses:
```text
Next.js API Routes
```

instead of:
```text
separate Express backend
```

Reasoning:
- simpler deployment
- lower infrastructure complexity
- easier free-tier hosting
- faster MVP development
- easier maintenance

This architecture is fully sufficient for the MVP.

---

# API Categories

The API layer is divided into:

1. Pokémon APIs
2. Recommendation APIs
3. Coverage APIs
4. Checklist APIs
5. Team APIs
6. Strategy APIs
7. Authentication APIs
8. Team Card APIs

---

# Recommended Folder Structure

```text
src/app/api/
│
├── pokemon/
├── recommendation/
├── coverage/
├── checklist/
├── teams/
├── strategies/
├── team-card/
└── auth/
```

---

# API Design Philosophy

Each API route should:
- do one clear responsibility
- remain lightweight
- remain reusable
- avoid hidden side effects

Business logic should live inside:
```text
src/lib/
```

NOT directly inside route handlers.

---

# API Response Philosophy

All APIs should return:
- consistent response structures
- predictable error handling
- readable payloads

Recommended structure:

```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

---

# Error Response Structure

Recommended structure:

```ts
interface ApiError {
  code: string;
  message: string;
}
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEAM",
    "message": "Team format is invalid."
  }
}
```

---

# Success Response Example

```json
{
  "success": true,
  "data": {
    "results": []
  }
}
```

---

# Pokémon API

## Purpose

Handles:
- Pokémon retrieval
- Pokémon search
- Pokémon filtering
- Pokémon detail pages

---

# Pokémon Routes

Recommended routes:

```text
/api/pokemon
/api/pokemon/[pokemonSlug]
```

Examples:

```text
/api/pokemon
/api/pokemon/charizard
/api/pokemon/rotom-wash
```

---

# Pokémon List API

## Route

```text
GET /api/pokemon
```

## Purpose

Retrieve Pokémon list with:
- filters
- pagination
- searching

---

# Pokémon Query Parameters

Supported query params:

```text
search
generation
type
region
legendary
page
limit
sort
```

Example:

```text
/api/pokemon?type=fire&generation=3
```

---

# Pokémon List Response

Example:

```json
{
  "success": true,
  "data": {
    "pokemon": [],
    "total": 151,
    "page": 1,
    "limit": 30
  }
}
```

---

# Pokémon Detail API

## Route

```text
GET /api/pokemon/[pokemonSlug]
```

## Purpose

Retrieve:
- stats
- typing
- abilities
- moves
- optional evolution data

---

# Pokémon API Philosophy

The Pokédex is intentionally lightweight.

The API should NOT include:
- breeding
- training
- encounter locations
- giant lore entries

Keep payloads:
- focused
- compact
- fast

---

# Recommendation API

## Purpose

Core recommendation engine endpoint.

This is one of the MOST IMPORTANT APIs.

---

# Recommendation Route

```text
POST /api/recommendation
```

---

# Recommendation Request

Example:

```json
{
  "team": {},
  "filters": {}
}
```

The request contains:
- current team
- selected format
- recommendation filters

---

# Recommendation Workflow

```text
Request
→ Validate Team
→ Analyze Team
→ Generate Candidate Pool
→ Score Candidates
→ Rank Results
→ Generate Explanations
→ Return Results
```

---

# Recommendation Response

Example:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "pokemon": {
          "name": "Rotom-Wash"
        },
        "score": 91,
        "reasons": [
          {
            "type": "defensive_synergy",
            "message": "Provides Ground immunity."
          }
        ]
      }
    ]
  }
}
```

---

# Recommendation Performance Philosophy

The recommendation endpoint must feel:
- fast
- responsive
- near real-time

Avoid:
- giant payloads
- expensive recalculation loops
- blocking synchronous operations

---

# Coverage APIs

## Purpose

Handles:
- defensive coverage calculations
- offensive coverage calculations

---

# Coverage Routes

Recommended:

```text
POST /api/coverage/defensive
POST /api/coverage/offensive
```

---

# Defensive Coverage Request

```json
{
  "team": {}
}
```

---

# Defensive Coverage Response

```json
{
  "success": true,
  "data": {
    "entries": [],
    "summary": {}
  }
}
```

---

# Offensive Coverage Philosophy

IMPORTANT:
Offensive coverage must derive from:
```text
selected moves
```

NOT:
```text
Pokémon typing
```

---

# Checklist API

## Purpose

Evaluates:
- role completeness
- utility support
- strategic tools

---

# Checklist Route

```text
POST /api/checklist
```

---

# Checklist Workflow

```text
Request Team
→ Analyze Moves
→ Analyze Roles
→ Analyze Utilities
→ Generate Checklist Result
```

---

# Checklist Response Example

```json
{
  "success": true,
  "data": {
    "completionPercentage": 72,
    "sections": []
  }
}
```

---

# Team APIs

## Purpose

Handles:
- saving teams
- loading teams
- updating teams
- deleting teams

Requires:
- authentication

---

# Team Routes

Recommended:

```text
GET /api/teams
POST /api/teams
GET /api/teams/[teamId]
PUT /api/teams/[teamId]
DELETE /api/teams/[teamId]
```

---

# Team API Philosophy

The Team API should:
- remain lightweight
- avoid giant nested payloads
- validate all imported data

Teams should store:
- Pokémon
- moves
- abilities
- items
- format

The MVP intentionally excludes:
- EVs
- IVs
- Natures

---

# Save Team Workflow

```text
User Clicks Save
→ Validate Team
→ Authenticate User
→ Save Team
→ Return Success
```

---

# Strategy APIs

## Purpose

Handles:
- preset strategy teams
- strategy browsing
- strategy filtering

---

# Strategy Routes

```text
GET /api/strategies
GET /api/strategies/[strategySlug]
```

---

# Strategy Query Parameters

Examples:

```text
strategyType
format
difficulty
generation
```

Example:

```text
/api/strategies?strategyType=rain
```

---

# Strategy API Philosophy

Preset strategy teams act as:
```text
editable templates
```

NOT:
```text
locked competitive presets
```

Users should load strategy teams directly into:
```text
Team Builder
```

---

# Team Card APIs

## Purpose

Handles:
- team card metadata
- export generation support

---

# Team Card Routes

Recommended:

```text
POST /api/team-card/generate
```

---

# Team Card Workflow

```text
Select Team
→ Select Background
→ Select Trainer
→ Generate Preview
→ Export PNG
```

IMPORTANT:
Actual image generation should primarily happen client-side.

Reason:
- lower server load
- simpler architecture
- better free-tier support

---

# Authentication APIs

Authentication primarily uses:
- Supabase Auth

Avoid:
- custom auth systems
- JWT management complexity

---

# Protected Route Philosophy

Protected APIs:
- validate authenticated user
- verify ownership
- prevent unauthorized modifications

Examples:
- saved teams
- favorites
- profile actions

---

# Validation Layer

Validation should happen:
- before business logic
- before database writes

Recommended validation areas:
- team validation
- move validation
- import validation
- route parameter validation

---

# Validation Folder Structure

```text
src/lib/validations/
│
├── validate-team.ts
├── validate-import.ts
├── validate-pokemon.ts
└── validate-filters.ts
```

---

# API Utility Layer

Recommended utilities:

```text
src/lib/api/
│
├── success-response.ts
├── error-response.ts
├── parse-query.ts
└── auth-helpers.ts
```

---

# API Error Philosophy

Errors should remain:
- predictable
- readable
- recoverable

Avoid:
- raw database errors
- stack traces
- internal implementation leakage

---

# Status Code Philosophy

Recommended status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

Avoid:
- inconsistent status handling

---

# API Security Philosophy

The MVP should prioritize:
- basic security
- safe validation
- ownership checks

Important:
- never trust client input
- validate all IDs
- validate ownership
- sanitize imported data

---

# Database Access Philosophy

API routes should NOT directly contain:
- giant SQL logic
- complex calculations

Prefer:
```text
API Route
→ Service Layer
→ Database Layer
```

---

# Recommended Service Structure

```text
src/lib/services/
│
├── pokemon-service.ts
├── recommendation-service.ts
├── coverage-service.ts
├── checklist-service.ts
├── strategy-service.ts
└── team-service.ts
```

---

# Caching Philosophy

Recommended caching:
- React Query client caching
- lightweight API caching
- static Pokémon data caching

Avoid:
- unnecessary repeated Pokémon fetches

---

# Performance Philosophy

The APIs should feel:
- instant
- responsive
- lightweight

Priority endpoints:
- recommendation
- coverage
- checklist

These endpoints power real-time Team Builder interactions.

---

# Rate Limiting Philosophy

The MVP may avoid advanced rate limiting initially.

Future expansion may add:
- request throttling
- abuse prevention
- public API limitations

---

# Scalability Philosophy

The API architecture should support future features such as:
- public teams
- social systems
- advanced recommendations
- battle simulation
- mobile applications

without requiring major rewrites.

---

# Important Development Rules

## Keep route handlers thin

GOOD:

```text
Route Handler
→ Validation
→ Service Function
→ Response
```

BAD:

```text
Huge route files containing all logic
```

---

## Keep business logic centralized

Business logic belongs in:
```text
src/lib/
```

NOT:
```text
inside API route handlers
```

---

## Maintain consistent response structure

All endpoints should return:
```text
success/data/error
```

---

## Validate everything

Never trust:
- client payloads
- imported teams
- URL params

---

# Final Goal

The API Architecture should provide:
- scalable backend structure
- predictable responses
- fast Team Builder support
- maintainable service organization
- lightweight deployment
- production-ready foundations

The API layer should remain:
- clean
- modular
- deterministic
- performant