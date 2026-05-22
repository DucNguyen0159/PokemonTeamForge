# Calculations and recommendations

## Type coverage (`src/lib/calculations/`)

Runs **in the browser** (builder panels), not via `/api/coverage`.

| Function | Output |
|----------|--------|
| `calculateDefensiveCoverage` | Per-slot and team defensive weak/resist/immune summary |
| `calculateOffensiveCoverage` | STAB and move-type pressure vs defending types |
| `type-matchup-matrix` | Shared effectiveness grid for type chart UI |

Uses `src/data/type-chart.ts` and normalized Pokémon types from the current team.

## Team checklist (`src/lib/calculations/checklist.ts`)

Rule-based role coverage (hazards, recovery, speed control, etc.) against `TeamRole` in `src/types/shared.ts`. Displayed in `checklist-panel`; API route is a stub.

## Recommendation engine (`src/lib/recommendation/`)

Triggered by **POST `/api/recommendation`** with current team + filters.

Pipeline (simplified):

```text
team + filters
  → filter-candidates (format, role, tiers, tags, duplicates)
  → score-candidate (weights: coverage gaps, role fit, ability tags, stat tier)
  → rank-recommendations
  → JSON results to recommendation-store / panel
```

- **Not** ML/AI — weighted heuristics in `scoring/`, `filters/`, `ranking/`
- Ability awareness via `src/data/ability-tags.ts`
- Format rules from `src/data/format-rules.ts`

## Parsing (`src/lib/parsing/`)

Showdown-style import/export formatters for team strings (builder integration).

## Validations (`src/lib/validations/team-validation.ts`)

Slot completeness and team constraints before save/export.

## Normalizers (`src/lib/normalizers/normalize-pokemon.ts`)

Consistent Pokémon shape from API/DB for UI and calculations.
