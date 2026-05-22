# Architecture

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router (Turbopack dev) |
| UI | React 19, Tailwind CSS 4, Radix slot + CVA buttons |
| Client state | Zustand 5 |
| Server/cache | TanStack Query 5 (saved teams, prefetch on login) |
| Backend data | Supabase (Postgres + Auth + Storage) |
| Tests | Vitest 4 |

## Repo layout

```text
src/app/              Routes (pages + route handlers under api/)
src/components/       Feature UI (builder, pokedex, auth, …)
src/data/             Static presets, tags, type chart, strategy teams
src/lib/              Business logic, services, calculations, Supabase helpers
src/store/            Zustand stores
src/types/            Shared TypeScript types
src/hooks/            React hooks (auth availability, queries)
src/providers/        Theme, Query, Toast, AppProviders wrapper
src/constants/        Route/sort constants
scripts/              Data import, validation, trainer asset download
supabase/             SQL schema (run in Supabase SQL Editor)
public/               Sprites, team-card assets, previews
Project Design/       This frozen design archive
```

## Runtime composition

`src/app/layout.tsx` → `AppProviders`:

- `ThemeProvider` (next-themes, default dark)
- `QueryProvider`
- `ToastProvider`
- `AuthInitializer` — hydrates session on load
- `GuestTeamSyncPrompt` — offers to merge guest team after sign-in

Global chrome: `SiteHeader` on every page.

## Client vs server

| Pattern | Where |
|---------|--------|
| Server Components | Home, Pokédex list shell, Pokémon detail fetch, Abilities list shell |
| Client components | Builder, Team Card, Profile, all auth forms, strategy explorer |
| Route handlers | Read-only catalog APIs + recommendation POST; no custom auth API |
| Direct Supabase browser client | Auth, profile, team save/load/rename/delete |

Auth pages using `useSearchParams()` split into `*-form.tsx` wrapped by server `page.tsx` + `<Suspense>` + `AuthPageFallback`.

## Key conventions

- Pokémon names in URLs: slugified (`format-slug` / detail routes)
- Current team: Zustand `team-store` persisted to `localStorage` key `pokemon-team-forge-current-team`
- Saved teams: Supabase `teams` + `team_pokemon` via `src/lib/supabase/team-service.ts`
- Strategy presets: **not** in DB — `src/data/strategy-teams.ts` + `strategy-service.ts`
- Errors: `ErrorMessage` + `toFriendlySupabaseMessage` for auth/Supabase UX

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # import scripts only; never expose to client
```

See root `README.md` for install, SQL order, and import commands.
