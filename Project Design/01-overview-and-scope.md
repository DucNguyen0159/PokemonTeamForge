# Overview and scope

## What it is

PokemonTeamForge is a **battle-focused team planning** web app: build a 6-Pokémon team, analyze type coverage and role checklist, browse competitive-oriented catalog data, load strategy presets, get rule-based recommendations, and export a shareable **Team Card** image.

Inspired by mypokemonteam.com and PokemonDB, but with a cleaner UX and a maintainable Next.js + Supabase architecture.

## Who it is for

- Casual and intermediate team builders
- Players who want coverage/checklist feedback without a full damage calc
- Creators who want polished team images to share

## Product principles

| Do | Don't |
|----|--------|
| Fast, approachable team building | Battle simulator |
| Rule-based recommendations | AI/LLM suggestions |
| Type coverage + role checklist | EV/IV/nature tuning |
| Guest mode + optional cloud save | Hardcore Smogon meta clone |
| Static + Supabase catalog data | Live battle replay |

## Core workflow

```text
Build team → Coverage + checklist → Recommendations / strategies → Team Card export
                    ↑ optional: Pokédex / Abilities research
                    ↑ signed in: save/load teams on Profile

Champions (separate workspace):
Build/load 6-mon roster → Battle plans → Damage Lab / Coach → Save / publish / community
```

## Shipped feature set (MVP+)

- **Builder** — 6 slots, format (singles/doubles/triples), ability/item/moves/shiny per slot
- **Coverage** — defensive weaknesses and offensive pressure (client-side math)
- **Checklist** — team role gaps (client-side)
- **Recommendations** — POST `/api/recommendation` with filters (role, tier, format, tags)
- **Pokédex** — search, type/gen/ability filters, card/table views, detail pages, evolution/forms
- **Abilities** — tagged browser + detail with Pokémon that learn each ability
- **Strategies** — preset teams from static data (`src/data/strategy-teams.ts`), load into builder
- **Team Card** — presets, backgrounds, Masters trainer sprites, PNG export in browser
- **Type chart** — matrix overlay (FAB), not a standalone page (`/type-chart` redirects to Pokédex)
- **Auth** — register, login, logout, forgot/reset password, profile saved teams, change password
- **Home** — marketing page with local preview Pokémon assets
- **Pokemon Champions** (`/champions`) — full Legends Z-A workspace: 6-mon builder, battle plans, damage lab (`@smogon/calc`), matchup coach, 30 presets, community browse/share (see doc 09)

## Explicitly out of scope (for now)

- Standard Builder damage calc, speed tiers, usage stats (Champions has its own Damage Lab)
- REST CRUD for teams (`/api/teams` returns 501; teams use Supabase client from Profile)
- Server-side team card storage (`team_cards` table exists; export is client-only)
- Favorite strategies UI (`favorite_strategy_teams` table exists; unused in app)
- `/api/coverage` and `/api/checklist` (501 stubs; logic runs in builder panels)

## Status

App is **feature-complete for pre-production**; production deploy and prod auth URL setup are tracked outside this folder (local deployment plan).
