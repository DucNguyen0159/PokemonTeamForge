# PokemonTeamForge — handoff

## 1. Project

**PokemonTeamForge** is a Next.js web app for casual and intermediate Pokémon team builders: a dashboard-style workspace to build teams (singles/doubles/triples), browse a Pokédex, explore preset strategy teams, analyze coverage and checklists, get recommendations, import/export Showdown-style text, generate shareable **team cards** (sprites, shiny per slot, trainer info, backgrounds, export), and optional **auth + saved teams** via Supabase.

## 2. Run locally

- **Package manager:** `npm` (lockfile: `package-lock.json`).
- **Commands:**
  - Dev: `npm run dev` (Next 16 + Turbopack).
  - Build: `npm run build`.
  - Start (production): `npm run start`.
  - Lint: `npm run lint`.
  - Tests: `npm run test` (Vitest).
  - Data script: `npm run download:masters-trainers` (Pokémon Masters trainer assets).
- **Env vars (names only):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for Supabase client (`src/lib/supabase/client.ts`); app throws if missing when that path runs.
- **Local URL:** http://localhost:3000

## 3. Git / PRs

- **Branch:** `main`, **up to date** with `origin/main` (as of this handoff).
- **Working tree:** clean (nothing uncommitted).
- **Open PRs:** not checked (`gh` CLI unavailable). **Needs confirmation** if you use GitHub PRs elsewhere.

## 4. Done

*Derived from recent git history and codebase layout; not an exhaustive product spec.*

- **Error handling / recovery:** app-wide patterns (e.g. error boundary, retry UI, API response helpers).
- **Team builder:** reactive slots, formats, Pokédex-backed picker with **limited fetch** fix (performance).
- **Strategies:** explorer with expanded preset set (**30** strategic presets per commit message); API `src/app/api/strategies/route.ts`, data `src/data/strategy-teams.ts`.
- **Team Card Generator** (`/team-card`): shiny toggle per slot, trainer info and sprites, card preview fixes, export (`html-to-image`), related UI in `src/components/team-card/*`, types `src/types/team-card.ts`, config `src/lib/team-card/config.ts`.
- **Dark mode UI** refresh (commit: “Change UI for Dark Mode”).
- **User can** run builder, strategies, team card flow, pokedex, login/register/profile routes (`src/constants/routes.ts`), and hit REST routes under `src/app/api/*` (pokemon, teams, checklist, coverage, recommendation, team-card, etc.).
- **Pokémon data:** server-side fetch from **PokéAPI** (`https://pokeapi.co/api/v2`) via `src/lib/services/pokemon-service.ts` (cached revalidate ~24h).

## 5. In progress

- **No in-repo WIP:** `main` is clean.
- **Assumption:** recent editor focus on `src/components/team-card/team-card-preview.tsx` may reflect ongoing polish; confirm with the human if team card work continues.

## 6. Next

1. **Confirm roadmap** with the human (home page still shows a “Foundation phase” placeholder in `src/app/page.tsx` while many features exist — may be stale copy). *Verify: landing text matches shipped features.*
2. **Replace boilerplate `README.md`** with real setup, env vars, and feature overview. *Verify: new contributor can run app from README alone.*
3. **Supabase:** document expected schema/RLS and test login/save flows if auth is production-critical. *Verify: sign-in and team persistence work end-to-end.*
4. **Optional:** run full `npm run build` and `npm run test` before releases; fix any regressions. *Verify: CI or local gates pass.*

## 7. Out of scope

- Do **not** re-architect auth, recommendation engine, or data layers unless explicitly requested.
- Do **not** bump Next/React major versions or replace PokéAPI without a task.
- Avoid broad refactors unrelated to the current task.

## 8. Gotchas

- **Supabase:** without env vars, anything that instantiates the Supabase client will error (`client.ts`).
- **PokéAPI:** external rate limits / availability affect builder and API routes.
- **Marketing vs code:** landing “Foundation phase” may undersell the app.
- **Tests:** Vitest is present; coverage may be partial; run `npm run test` after changes.
- **Theme:** `next-themes` + Tailwind v4; check light/dark when changing UI.

## 9. Open questions

- **Needs human:** product priorities after account move; whether open PRs exist on GitHub.
- **Needs confirmation:** is Supabase required for local dev of all flows, or only auth/saved teams?
- **Needs confirmation:** deployment target (Vercel?) and production env configuration.

---

For Cursor: Read docs/handoff/HANDOFF.md first and treat it as source of truth. If anything conflicts with the repo, prefer the repo and update HANDOFF.
