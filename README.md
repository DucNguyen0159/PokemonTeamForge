# PokemonTeamForge

Battle-focused Pokemon team building app for planning teams, analyzing type coverage, browsing competitive Pokemon data, exploring abilities, using strategy presets, getting recommendations, and exporting shareable team cards.

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

# Required for local import scripts. Never expose this in client-side code.
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit `.env.local`. The `SUPABASE_SERVICE_ROLE_KEY` value has elevated permissions and should only be used by trusted server-side scripts.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Data Setup

PokemonTeamForge uses Supabase for static catalog data and saved team data.

Run the SQL files in Supabase SQL Editor in this order:

```text
supabase/auth-saved-teams.sql
supabase/app-data.sql
supabase/app-storage.sql
supabase/delete-own-account.sql
```

Before using **Profile → Delete account** in production, run `supabase/delete-own-account.sql` once in the Supabase SQL Editor (creates the `delete_own_account` RPC). The app calls that RPC with the anon key only; do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

Then reload the Supabase REST schema cache:

```sql
notify pgrst, 'reload schema';
```

Import catalog data:

```bash
npm run import:all-data
```

Validate imported data:

```bash
npm run validate:supabase-data
```

The auth/saved-team SQL creates `profiles`, `teams`, `team_pokemon`, `team_cards`, and related RLS policies for account cloud sync. The catalog import covers Pokemon, abilities, Pokemon-ability relationships, moves, Pokemon-move relationships, and items.

First-run Supabase checklist:

1. Create a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
3. Run the three SQL files above in order.
4. Run `notify pgrst, 'reload schema';`.
5. Run `npm run import:all-data`.
6. Run `npm run validate:supabase-data`.
7. Register or log in locally, then confirm Profile can show an empty saved-teams state and Builder can save a cloud team.

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
src/components/          UI components by feature area
src/constants/           Shared route and sort constants
src/data/                Static app metadata, tags, presets, and preview data
src/lib/                 Services, calculations, normalizers, and data access
src/store/               Zustand stores
src/types/               Shared TypeScript types
scripts/                 Import, validation, and asset scripts
supabase/                Supabase schema, storage, and delete-own-account SQL
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

## Roadmap

- Continue tuning recommendation scoring and explanations.
- Expand ability, strategy, move, and item metadata.
- Improve team sharing, import, and export flows.
- Add more polished mobile interactions across complex builder screens.
- Add screenshots or demo media once the public presentation is finalized.

## Disclaimer

PokemonTeamForge is a fan-made project and is not affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, Creatures, or The Pokemon Company. Pokemon names, sprites, artwork, and related marks belong to their respective owners.
