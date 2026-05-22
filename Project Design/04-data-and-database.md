# Data and database

## SQL run order (Supabase SQL Editor)

```text
1. supabase/auth-saved-teams.sql
2. supabase/app-data.sql
3. supabase/app-storage.sql
4. supabase/evolution-chains.sql      (after app-data)
5. supabase/pokemon-forms.sql         (after app-data)
```

Then: `notify pgrst, 'reload schema';`

Import: `npm run import:all-data` → validate: `npm run validate:supabase-data`

## Tables

### Auth and user data (`auth-saved-teams.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | `id` → `auth.users`, `username`, `avatar_url` |
| `teams` | User teams: name, format, `is_public` |
| `team_pokemon` | Slots 1–6: `pokemon_id`, ability, item, 4 moves, shiny |
| `team_cards` | **Schema only** — not used by app export yet |
| `favorite_strategy_teams` | **Schema only** — no UI yet |

RLS: users read/write own rows only.

### Catalog (`app-data.sql`)

| Table | Purpose |
|-------|---------|
| `pokemon` | Stats, types, sprites, form metadata columns |
| `abilities`, `pokemon_abilities` | Ability catalog + learnset |
| `moves`, `pokemon_moves` | Move catalog + learnset |
| `items` | Held items |
| `import_runs` | Import audit trail |

### Extensions

- `evolution_chains` + `pokemon.evolution_chain_id`
- Form columns: `form_kind`, `base_slug`, `pokedex_display_no`, `list_sort_rank`

### Storage (`app-storage.sql`)

- Bucket `item-icons` — public read for item sprites

## Static app data (`src/data/`)

Not in Postgres:

- `strategy-teams.ts` — strategy presets
- `ability-tags.ts`, `format-rules.ts`, `stat-tiers.ts`, `type-chart.ts`
- `team-card-presets.ts`, `preview-pokemon.ts`, masters trainer manifest JSON

## Import scripts (`scripts/`)

| npm script | Script | Role |
|------------|--------|------|
| `import:all-data` | `import-all-data.mjs` | Items then Pokémon pipeline |
| `import:pokemon-data` | `import-pokemon-data.mjs` | PokéAPI → catalog tables |
| `import:item-data` | `import-item-data.mjs` | Items + storage icons |
| `validate:supabase-data` | `validate-supabase-data.mjs` | Spot-check vs PokéAPI |
| `download:masters-trainers` | `download-pokemon-masters-trainers.mjs` | CC BY-NC-SA trainer sprites → `public/team-card/trainers/masters/` |

Shared helpers: `scripts/lib/import-utils.mjs`, `pokemon-form-metadata.mjs`.

## External sources

- **PokéAPI** — primary catalog import
- **PokeAPI sprites** — referenced URLs
- **Bulbagarden** — Masters trainer sprites (non-commercial; see manifest)
- **Curated internal** — ability tags, recommendation weights, team card presets

Review upstream licenses before commercial use.
