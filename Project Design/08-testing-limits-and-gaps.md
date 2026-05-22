# Testing, limits, and gaps

## Quality commands

```bash
npm run lint
npx tsc --noEmit
npm test          # vitest run — 29 files, 131 tests (May 2026)
npm run build
```

## What tests cover

| Area | Examples |
|------|----------|
| Auth | `auth-store`, password reset, change password, auth-utils, session-ready, logout-utils |
| Teams | guest sync, local safety, add-pokemon, saved-team filters, default ability |
| Pokémon | data-access, forms, evolution, navigation, list display |
| Calculations | type-matchup matrix |
| Recommendation | scoring |
| Supabase | errors, team-service auth assumptions |
| Data/scripts | ability-tags, form metadata import helpers, team-card config |

## What tests do not cover

- E2E / Playwright
- Most page components and API route handlers
- Team Card PNG export pipeline
- Full builder UI integration

## Known limitations

- Recommendations are heuristic guidance, not competitive tier lists
- Catalog freshness depends on re-running import + validate scripts
- `/api/teams`, `/api/coverage`, `/api/checklist` are intentional stubs
- `team_cards` and `favorite_strategy_teams` tables have no app UI yet
- Strategy data is static TS, not admin-editable in DB
- No middleware-based route protection — pages gate on client auth state
- Battle formats are simplified (singles/doubles/triples)

## Operational docs (outside this folder)

| Doc | Location | Topic |
|-----|----------|--------|
| Setup & scripts | `/README.md` | Clone, env, SQL, import |
| Auth URLs & SMTP | `AUTH.md` (local) | Supabase redirects, Resend |
| Production deploy | `Production_Deployment_Plan.md` (local) | Vercel, domain, phases |
| Vercel detail | `vercel_guide.md` (local) | Smoke tests, env vars |

## Historical note

The previous 24-file `Project Design/` set (numbered `01`–`24`) described pre-auth roadmap phases, DB strategy tables, and API routes that were never built or were replaced. This archive replaces that set entirely.
