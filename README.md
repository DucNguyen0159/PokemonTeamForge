# PokemonTeamForge

Battle-focused Pokemon team building app for planning teams, analyzing type coverage, browsing competitive Pokemon data, exploring abilities, using strategy presets, getting recommendations, and exporting shareable team cards.

**Pokemon Champions (Legends Z-A)** has a dedicated workspace: 6-Pokémon rosters, Singles 3v3 / Doubles 4v4 battle plans, Mega-only rules, SP spreads, damage lab, matchup coach, 30 curated presets, and community team browse/share.

## Project Status

PokemonTeamForge is in active development. The current app focuses on practical team-building workflows: build a team, analyze its strengths and weaknesses, improve it with data-driven recommendations, and share it with polished team card exports.

## Live Demo

https://poketeamforge.com

## Core Workflow

PokemonTeamForge is designed around a simple loop:

1. Build a team with Pokemon, abilities, items, moves, and battle format.
2. Analyze defensive and offensive type coverage.
3. Improve the team with strategy presets, ability insights, and recommendations.
4. Share the result with an exportable team card.

**Champions loop** (separate workspace at `/champions`):

1. Build or load a 6-Pokémon Champions roster (presets, community fork, or scratch).
2. Author Singles/Doubles battle plans and fix legality (SP budget, duplicates, Mega items).
3. Analyze with Damage Lab and Matchup Coach.
4. Save to cloud, publish to Community, star/comment on others' teams.

## Core Features

- Team Builder with Pokemon, ability, item, move, shiny, and battle format support.
- Type coverage analysis for defensive weaknesses and offensive pressure.
- Battle-ready Pokedex with card/table views, search, sorting, type filters, generation filters, and ability filters.
- Pokemon detail pages with stats, typing, abilities, descriptions, full ability effects, and move previews.
- Ability browser with battle-focused tags, search, detail panel, Pokemon availability, and hidden ability markers.
- Recommendation engine with role, type coverage, format, stat tier, and ability-aware scoring.
- Strategy presets for common team archetypes and editable starting points.
- Team Card generator with style presets, backgrounds, trainer details, layouts, export sizes, sprite options, and shareable image export.
- Static home page previews using local curated Pokemon preview assets for fast loading.

### Pokemon Champions (`/champions`)

Dedicated **Legends Z-A / Mega Dimension** competitive workspace (not a reskin of the standard Builder):

- **Dashboard** — active team identity bar, readiness-driven next step, saved teams, community preview.
- **Team Builder** — 6 slots, Nature/SP/Mega item editing, legality panel, cloud save/load (your saved teams), publish/unpublish.
- **Battle Plans** — Singles 3v3 and Doubles 4v4 plans (builder `?tab=plans`; `/champions/plans` redirects there).
- **Damage Lab** — `@smogon/calc` with Champions SP/IV/mega adapter, field/weather inputs.
- **Matchup Coach** — defensive heatmap, offensive coverage, speed ladder, threats, SP hints, preset compare.
- **Strategy Presets** — 30 curated full-roster teams with battle plans; load into Builder.
- **Community Teams** — browse, preview, star others' teams, comment, fork to Builder; publish after cloud save (authors cannot star their own team).

Rules modeled: **Mega only**, **66 SP** (32 max/stat), **Singles 3v3 / Doubles 4v4**, regulation `regulation-m-a`.

## Tech Stack

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Vitest](https://vitest.dev)

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Required for local import scripts. Never expose in client code or Vercel.
SUPABASE_SERVICE_ROLE_KEY=

# Optional — footer, legal pages, sitemap (defaults exist if omitted)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_CONTACT_EMAIL=
NEXT_PUBLIC_GITHUB_PROFILE_URL=
NEXT_PUBLIC_GITHUB_REPO_URL=
NEXT_PUBLIC_KOFI_URL=
```

Do not commit `.env.local`. The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must only be used by trusted local import/validation scripts.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Data Setup

PokemonTeamForge uses Supabase for catalog data (Pokédex, abilities, moves, items), user auth, and saved teams.

### SQL files (run in Supabase SQL Editor, in this order)

| Order | File | Purpose |
|------:|------|---------|
| 1 | `supabase/auth-saved-teams.sql` | Profiles, teams, team slots, RLS for per-user cloud sync |
| 2 | `supabase/app-data.sql` | Public catalog tables (`pokemon`, `abilities`, `moves`, `items`, …) |
| 3 | `supabase/app-storage.sql` | Storage bucket `item-icons` (public read for item sprites) |
| 4 | `supabase/pokemon-forms.sql` | Form columns on `pokemon` (Mega, G-Max, regional grouping, Pokédex sort) |
| 5 | `supabase/evolution-chains.sql` | `evolution_chains` table + `pokemon.evolution_chain_id` for detail pages |

**Champions** (after steps 1–5; required for `/champions` cloud save + community):

| Order | File | Purpose |
|------:|------|---------|
| 6 | `supabase/champions-extension.sql` | Champions mode on `teams`/`team_pokemon`; `champions_battle_plans`, stars, comments; RLS |
| 7 | `supabase/champions-community-grants.sql` | Community browse (`SELECT` for anon) + authenticated save/social grants on battle plans, stars, comments |
| 8 | `supabase/champions-mega-stones.sql` | ~46 Mega Dimension stone rows in `items` |

```text
supabase/auth-saved-teams.sql
supabase/app-data.sql
supabase/app-storage.sql
supabase/pokemon-forms.sql
supabase/evolution-chains.sql
supabase/champions-extension.sql
supabase/champions-community-grants.sql
supabase/champions-mega-stones.sql
```

**Existing project that only ran steps 1–3?** Run files 4 and 5, then Champions files 6–8 if using Champions, then `notify pgrst`, then re-run import + validate so form metadata and evolution data populate.

### Reload schema (after any SQL change)

```sql
notify pgrst, 'reload schema';
```

### Import and validate catalog data

```bash
npm run import:all-data
npm run validate:supabase-data
```

`import:all-data` runs items, then Pokémon/abilities/moves. `import:pokemon-data` expects `pokemon-forms.sql` to be applied first (see comment at top of `scripts/import-pokemon-data.mjs`).

### Auth redirect URLs (local dev)

In Supabase → **Authentication → URL Configuration**, add at least:

- **Site URL:** `http://localhost:3000` (or your production domain when deployed)
- **Redirect URLs:** `http://localhost:3000/**`, `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password`

Without these, sign-up confirmation and password-reset links may fail or land on the wrong host.

### Delete account RPC (production / Profile feature)

Run once **after** `auth-saved-teams.sql`:

| File | Purpose |
|------|---------|
| `supabase/delete-own-account.sql` | `delete_own_account()` RPC so users can delete their own auth row from Profile |

The app calls this RPC with the anon key only. Do not put `SUPABASE_SERVICE_ROLE_KEY` in the browser or Vercel client env.

### First-run checklist

1. Create a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
3. Run SQL files **1–5** in order.
4. Run `notify pgrst, 'reload schema';`.
5. Run `npm run import:all-data` then `npm run validate:supabase-data`.
6. Configure Auth Site URL + redirect URLs (above).
7. Run `delete-own-account.sql` before enabling Profile → Delete account in production.
8. Register locally, confirm Profile saved-teams state, and save a cloud team from Builder.

**Champions first-run (optional):**

9. Run SQL files **6–8** (above), then `notify pgrst, 'reload schema';`.
10. Restart dev server after mega-stones SQL (competitive items cache).
11. `npm run check:mega-stones -- --strict` — stone catalog consistency.
12. `npm run import:champion-presets` — regenerate preset sprite/type display data.
13. `npm run seed:champions-community` — 10 public dev community teams (requires `SUPABASE_SERVICE_ROLE_KEY`).

### Troubleshooting (data)

| Symptom | Fix |
|---------|-----|
| Missing megas / regional forms in Pokédex | Run `pokemon-forms.sql`, `notify pgrst`, re-run `npm run import:all-data` |
| Empty evolution tree on Pokémon detail | Run `evolution-chains.sql`, `notify pgrst`, re-run `npm run import:pokemon-data` (or `import:all-data`) |
| Delete account fails in Profile | Run `delete-own-account.sql` in Supabase |
| API “table not found” / schema cache errors | Run `notify pgrst, 'reload schema';` after SQL changes |
| Champions community browse fails when logged in | Run `champions-community-grants.sql` in Supabase |
| Champions save fails (“session does not have access”) | Re-run `champions-community-grants.sql` — authenticated needs INSERT on `champions_battle_plans`; then `notify pgrst, 'reload schema';` |
| Cannot star a published team | By design if it is **your** team — stars are for other trainers' teams only |
| Mega stones missing in Champions Builder | Run `champions-mega-stones.sql`, restart dev server |
| “Team unavailable” on old community URL | Re-seed changes team IDs — open team from `/champions/community` grid |

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run import:pokemon-data
npm run import:item-data
npm run import:all-data
npm run validate:supabase-data
npm run download:masters-trainers
npm run check:mega-stones
npm run import:champion-presets
npm run seed:champions-community
```

## Testing and Validation

Run lint:

```bash
npm run lint
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Run tests:

```bash
npm test
```

Validate Supabase catalog data:

```bash
npm run validate:supabase-data
```

## Project Structure

```text
src/app/                 Next.js app routes and API routes
src/app/champions/       Pokemon Champions workspace (dashboard, builder, coach, etc.)
src/components/          UI components by feature area
src/components/champions/ Champions-specific UI
src/constants/           Shared route and sort constants
src/data/                Static app metadata, tags, presets, and preview data
src/data/champions-presets.ts   30 curated Champions teams
src/lib/champions/       Champions legality, damage adapter, coach analysis, etc.
src/lib/                 Services, calculations, normalizers, and data access
src/store/               Zustand stores (incl. champions-team-store)
src/types/               Shared TypeScript types
scripts/                 Import, validation, and asset scripts
supabase/                SQL schema (auth, catalog, storage, forms, evolution, Champions, delete RPC)
public/                  Static assets
Project Design/          Frozen architecture reference (see README there)
```

## Data Sources and Credits

PokemonTeamForge combines imported public Pokemon data, curated battle metadata, and local app assets.

- [PokeAPI](https://pokeapi.co/) is the primary source for Pokemon, species, stats, types, abilities, moves, items, descriptions, effects, and sprite or official artwork references.
- [PokeAPI sprites](https://github.com/PokeAPI/sprites) are used where sprite image URLs reference the public PokeAPI sprite repository.
- [Bulbagarden Archives](https://archives.bulbagarden.net/wiki/Category:Pok%C3%A9mon_Masters_Trainer_sprites) is used by the local trainer asset download script for Pokemon Masters trainer sprites. These assets are listed as CC BY-NC-SA 2.5 / non-commercial in the generated manifest.
- Supabase stores imported catalog data used by the app at runtime.
- PokemonTeamForge includes curated internal metadata for ability tags, move tags, strategy presets, recommendation scoring, Team Card presets, and home page preview examples.

Review each upstream source's terms before using this project commercially or redistributing generated assets.

## Known Limitations

- Recommendation scoring is heuristic and intended as team-building guidance, not a guaranteed competitive ranking.
- Data freshness depends on running the import and validation scripts.
- Some visual preview assets are curated local examples rather than live database queries.
- Battle formats are simplified around app-supported singles, doubles, and triples workflows.
- **Standard Builder** has no damage calc; **Champions Damage Lab** uses `@smogon/calc` with simplified SP/IV assumptions — not a full VGC simulator.
- Community moderation (reporting, admin review) is not implemented; users can delete their own comments only.

## Deployment

Production hosting uses [Vercel](https://vercel.com) with env vars matching `.env.local` (use the publishable Supabase anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Set Supabase **Site URL** and redirect URLs to your production domain. Do not deploy `SUPABASE_SERVICE_ROLE_KEY` to Vercel unless you add a dedicated server-only admin route.

Public site: https://poketeamforge.com

## Support

PokemonTeamForge is free to use. Optional support helps cover domain, hosting, database/auth, and maintenance costs while keeping the app free for everyone.
Support is optional and does not unlock paid features.

- [Ko-fi](https://ko-fi.com/poketeamforge)
- To show support buttons in-app, set `NEXT_PUBLIC_KOFI_URL` and/or `NEXT_PUBLIC_GITHUB_SPONSORS_URL`.

## Roadmap

- Continue tuning recommendation scoring and explanations.
- Expand ability, strategy, move, and item metadata.
- Improve team sharing, import, and export flows.
- Add more polished mobile interactions across complex builder screens.
- Champions follow-ups: community moderation, per-species mega stone filtering in item picker, Profile visual parity with Champions cards.

## Disclaimer

PokemonTeamForge is a fan-made project and is not affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, Creatures, or The Pokemon Company. Pokemon names, sprites, artwork, and related marks belong to their respective owners.
