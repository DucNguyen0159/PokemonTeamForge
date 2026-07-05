# Routes, auth, and APIs

## App pages

| Route | Rendering | Purpose |
|-------|-----------|---------|
| `/` | Static | Landing / feature overview |
| `/builder` | Static shell + client | Team builder, coverage, checklist, recommendations, type-chart FAB |
| `/pokedex` | Dynamic (`searchParams`) | List/explorer; preserves return state in query |
| `/pokemon/[pokemonName]` | Dynamic | Detail: stats, abilities, STAB, defense grid, forms, evolution |
| `/abilities` | Dynamic (`?ability=`) | Ability browser + detail panel |
| `/strategies` | Static + client | Preset teams; load into builder |
| `/team-card` | Static + client | Visual editor + PNG export |
| `/type-chart` | Redirect | → `/pokedex` (chart is overlay only) |
| `/login` | Client + Suspense | Sign-in; `?redirect=` supported |
| `/register` | Client | Sign-up + profile row |
| `/forgot-password` | Client + Suspense | Email reset link |
| `/reset-password` | Client + Suspense | PKCE `?code=` + new password |
| `/auth/callback` | Client | OAuth / email link code exchange |
| `/profile` | Client | Saved teams CRUD, change password, logout |

### Pokemon Champions (`/champions`)

| Route | Rendering | Purpose |
|-------|-----------|---------|
| `/champions` | Client | Dashboard — identity bar, next step, saved teams, community preview |
| `/champions/builder` | Client | 6-slot editor, legality, save/publish; `?tab=plans`, `?slot=N` |
| `/champions/plans` | Redirect | → `/champions/builder?tab=plans` |
| `/champions/damage` | Client | Damage Lab (`@smogon/calc` adapter) |
| `/champions/coach` | Client | Matchup Coach analysis |
| `/champions/presets` | Client | 30 curated preset explorer |
| `/champions/presets/[presetId]` | Client | Preset detail + load into builder |
| `/champions/community` | Client | Public team browse (sort, format, search) |
| `/champions/community/[teamId]` | Client | Roster, plans, comments; star, fork; `?tab=plans\|comments` |

Layout: `src/app/champions/layout.tsx` — desktop subnav + mobile sticky nav.

Also: `error.tsx`, `globals.css`, shared `layout.tsx` metadata (OG/Twitter).

## Auth flows

All auth via **Supabase Auth** (no `/api/auth/*`).

| Flow | Entry | Notes |
|------|-------|-------|
| Register | `/register` | `signUp`; may require email confirm |
| Login | `/login` | Fast path: session first, profile async; redirect default `/profile` |
| Forgot password | `/forgot-password` | `resetPasswordForEmail` → redirect `/reset-password` |
| Reset password | `/reset-password` | Exchange `?code=` then `updateUser({ password })` |
| Callback | `/auth/callback` | Recovery sessions → `/reset-password`; else safe redirect |
| Change password | Profile panel | Verify current password, then `updateUser` |
| Logout | Header / profile | Single `signOut`; clears guest/sync state via `logout-utils` |
| Session | `AuthInitializer` | `initializeAuth` + `onAuthStateChange` in `auth-store` |

Redirect helpers: `src/lib/auth/auth-utils.ts` (`appendAuthRedirectQuery`, `getPasswordResetRedirectUrl`, etc.).

## API routes (`src/app/api`)

| Route | Method | Behavior |
|-------|--------|----------|
| `/api/pokemon` | GET | List/filter Pokémon |
| `/api/pokemon/[pokemonName]` | GET | Single Pokémon |
| `/api/abilities` | GET | List (`search`, `tag`, `limit`) |
| `/api/abilities/[abilitySlug]` | GET | Detail |
| `/api/items` | GET | List (`search`, `competitiveOnly`, `limit`) |
| `/api/strategies` | GET | Strategy summaries |
| `/api/strategies/[strategyId]` | GET | Full preset (id or slug) |
| `/api/recommendation` | POST | `{ team, filters }` → ranked candidates |
| `/api/team-card` | GET | Preset metadata only (`storage.supported: false`) |
| `/api/teams` | GET | **501** — use Profile + `team-service` |
| `/api/coverage` | GET | **501** — use builder `coverage-panel` |
| `/api/checklist` | GET | **501** — use builder `checklist-panel` |
| `/api/champions/pokemon-summaries` | GET | Batch Pokémon summary (types, sprites) for Champions catalog hooks |

Responses use helpers in `src/lib/api/responses.ts`.
