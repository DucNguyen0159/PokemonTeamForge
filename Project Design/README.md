# Project Design (frozen archive)

**Snapshot:** July 2026 — reflects the app as shipped in development (auth, password reset, builder, Pokédex, abilities, strategies, team card, Supabase catalog + saved teams, **Pokemon Champions workspace**).

This folder is a **one-time reference** for future you. Day-to-day setup and production deploy live in the repo root `README.md` and local ops docs (`Production_Deployment_Plan.md`, `AUTH.md`, `*_guide.md` — not committed by default).

## Reading order

| # | File | Contents |
|---|------|----------|
| 1 | [01-overview-and-scope.md](./01-overview-and-scope.md) | Product goals, users, in/out of scope |
| 2 | [02-architecture.md](./02-architecture.md) | Stack, repo layout, runtime patterns |
| 3 | [03-routes-auth-and-apis.md](./03-routes-auth-and-apis.md) | Pages, auth flows, API routes |
| 4 | [04-data-and-database.md](./04-data-and-database.md) | Supabase schema, imports, static data |
| 5 | [05-state-and-features.md](./05-state-and-features.md) | Stores, feature areas, persistence |
| 6 | [06-calculations-and-recommendations.md](./06-calculations-and-recommendations.md) | Coverage, checklist, recommendation engine |
| 7 | [07-ui-and-components.md](./07-ui-and-components.md) | UI system, component map |
| 8 | [08-testing-limits-and-gaps.md](./08-testing-limits-and-gaps.md) | Tests, scripts, known limits, unused schema |
| 9 | [09-pokemon-champions-ui-ux-plan.md](./09-pokemon-champions-ui-ux-plan.md) | **Champions shipped spec** — scope, UX, data model, phase checklist |

## Quick facts

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Zustand, TanStack Query, Supabase, Vitest, `@smogon/calc`
- **Domain (planned):** `poketeamforge.com` — see local deployment plan
- **Tests:** 42 files, 185 tests (`npm test`) — July 2026
- **Champions:** `/champions` — 9 routes, 30 presets, community browse, cloud save with `mode = 'champions'`
