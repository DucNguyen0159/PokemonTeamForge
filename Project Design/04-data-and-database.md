# Data and database

## SQL run order (Supabase SQL Editor)

```text
1. supabase/auth-saved-teams.sql
2. supabase/app-data.sql
3. supabase/app-storage.sql
4. supabase/pokemon-forms.sql         (after app-data)
5. supabase/evolution-chains.sql      (after app-data)
6. supabase/champions-extension.sql   (Champions mode, battle plans, stars, comments)
7. supabase/champions-community-grants.sql  (public community browse grants)
8. supabase/champions-mega-stones.sql (Mega Dimension stone items)
```

Then: `notify pgrst, 'reload schema';`

Import: `npm run import:all-data` → validate: `npm run validate:supabase-data`

Optional Champions: `npm run import:champion-presets`, `npm run seed:champions-community` (dev QA, needs service role key)

## Tables

### Auth and user data (`auth-saved-teams.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | `id` → `auth.users`, `username`, `avatar_url` |
| `teams` | User teams: name, format, `is_public`, optional `mode`, `format_support`, `champions_ruleset_id`, `team_notes` |
| `team_pokemon` | Slots 1–6: `pokemon_id`, ability, item, 4 moves, shiny; Champions adds SP columns, `stat_alignment`, `use_mega_by_default` |
| `team_cards` | **Schema only** — not used by app export yet |
| `favorite_strategy_teams` | **Schema only** — no UI yet |

### Champions (`champions-extension.sql`)

| Table | Purpose |
|-------|---------|
| `champions_battle_plans` | Per-team Singles/Doubles plans (selected slots, leads, notes) |
| `champions_team_stars` | User stars on public Champions teams |
| `champions_team_comments` | Discussion on public Champions teams |

Public browse requires `champions-community-grants.sql` (`GRANT SELECT` for `anon` + `authenticated` on community tables and public profile usernames).

RLS: users read/write own rows; public can read `mode = 'champions' AND is_public = true` teams and related stars/comments/plans.

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
- `champions-presets.ts` — 30 curated Champions teams + battle plans
- `champions-preset-display.ts` — generated sprites/types for preset cards (from `import:champion-presets`)
- `champions-mega-stones.ts` — Mega Dimension stone catalog (source of truth)
- `champions-battle-plan-templates.ts` — quick-start plan templates
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
| `check:mega-stones` | `check-mega-stone-consistency.mjs` | Champions mega stone catalog vs DB |
| `import:champion-presets` | `import-champion-presets.mjs` | Regenerate `champions-preset-display.ts` |
| `seed:champions-community` | `seed-champions-community.mjs` | 10 public dev community teams |

Shared helpers: `scripts/lib/import-utils.mjs`, `pokemon-form-metadata.mjs`.

## External sources

- **PokéAPI** — primary catalog import
- **PokeAPI sprites** — referenced URLs
- **Bulbagarden** — Masters trainer sprites (non-commercial; see manifest)
- **Curated internal** — ability tags, recommendation weights, team card presets

Review upstream licenses before commercial use.
