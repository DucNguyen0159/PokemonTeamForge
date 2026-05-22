# State and features

## Zustand stores (`src/store/`)

| Store | Responsibility |
|-------|----------------|
| `auth-store` | Session, user, profile, loading/logout flags, auth errors; register/login/logout/password flows |
| `team-store` | Current `Team` (6 slots); **persisted** `localStorage` |
| `filter-store` | Pokédex + strategy list filters, global recommendation role |
| `recommendation-store` | Panel filters, results, loading, error |
| `ui-store` | Menus/modals, theme preference |

## React Query

- `use-user-teams` — list saved teams for Profile
- Prefetch on successful login/reset when session ready

## Feature areas

### Team builder (`/builder`)

Components: `team-builder`, `team-slots`, `pokemon-slot`, `pokemon-picker`, `builder-controls`, selectors for ability/item/moves.

- Loads pending team from strategies or Profile via `pending-loaded-team` helpers
- **Coverage panel** — `calculateDefensiveCoverage` / `calculateOffensiveCoverage`
- **Checklist panel** — `calculateTeamChecklist`
- **Recommendation panel** — calls `/api/recommendation`
- **Type chart FAB** — overlay (`type-chart-reference`, dialog/matrix/list)
- Guest can build; sign-in prompts sync via `guest-team-sync`

### Pokédex (`/pokedex`, `/pokemon/[name]`)

- Server-driven list with client explorer; query params for search/sort/filters/view
- Detail: base stats, abilities, move preview, STAB summary, type defense grid, evolution, alternate forms
- Add to team from detail; return URL preserved

### Abilities (`/abilities`)

- Tag filters, search, detail with Pokémon list and hidden-ability markers
- Data via `/api/abilities`

### Strategies (`/strategies`)

- Static presets + API read; `strategy-to-team` maps into builder slots

### Team Card (`/team-card`)

- Style/layout/export presets from `team-card-presets` + `/api/team-card` metadata
- `html-to-image` PNG export in browser
- Masters trainers from `public/team-card/trainers/masters/`

### Profile (`/profile`)

- Saved teams: rename, load to builder, delete (Supabase `team-service`)
- `ProfileChangePasswordPanel` — current + new password
- No favorites UI despite DB table

### Home (`/`)

- Static marketing; curated `preview-pokemon` sprites

## Persistence model

```text
Guest current team     → team-store → localStorage
Signed-in saved teams  → teams + team_pokemon (Supabase, client SDK)
Strategy presets       → src/data (not DB)
Team card designs      → ephemeral in browser (not team_cards table)
```

## Types (`src/types/`)

Key modules: `team.ts`, `pokemon.ts`, `coverage.ts`, `strategy.ts`, `team-card.ts`, `saved-team.ts`, `api.ts`, `shared.ts` (formats, roles, tiers).
