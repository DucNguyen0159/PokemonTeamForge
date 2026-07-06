# UI and components

## Design system

- **Tailwind 4** + CSS variables in `src/app/globals.css` (`background`, `primary`, `border`, etc.)
- **Dark default** via `next-themes` / `ui-store`
- **Typography:** system stack, tight headings on feature pages (`page-intro`)
- **Components:** shadcn-style `Button` + `Card` in `src/components/ui/`
- **Feedback:** `ErrorMessage`, `RetryButton`, toast provider, emerald success banners on auth forms

## Layout

| Component | Role |
|-----------|------|
| `site-header` | Nav: Builder, **Champions**, Pokédex, Abilities, Strategies, Team Card, auth/profile |
| `brand-mark` | Logo mark |
| `page-intro` | Eyebrow + title + description on feature pages |
| `auth-layout` | Centered auth card + `PasswordInput` |

## Component map by feature

| Folder | Main files |
|--------|------------|
| `builder/` | `team-builder`, `team-slots`, `pokemon-slot`, `pokemon-picker`, `builder-controls` |
| `pokedex/` | `pokedex-explorer` |
| `pokemon/` | Detail body, stats table, abilities, evolution, alternate forms, STAB, defense grid |
| `abilities/` | `ability-browser` |
| `strategies/` | `strategy-explorer` |
| `coverage/` | `coverage-panel` |
| `checklist/` | `checklist-panel` |
| `recommendation/` | `recommendation-panel` |
| `type-chart/` | Matrix, list, dialog, overlay a11y, `type-chart-reference` |
| `team-card/` | Generator, preview, backgrounds, trainers, export, pickers |
| `auth/` | `auth-initializer`, `auth-layout`, `auth-pending-notice`, `guest-team-sync-prompt`, `auth-page-fallback` |
| `profile/` | `profile-change-password-panel` |
| `champions/` | Dashboard, builder, damage lab, coach, presets, community; `champions-shell`, `champions-subnav`, identity bar, roster tiles, community cards, preview drawer |
| `shared/` | `type-badge`, `pokemon-sprite` |
| `error/` | `error-boundary`, `error-message` |

## Responsive notes

- Builder and Pokédex use stacked layouts on small screens; type chart opens as full-screen dialog
- Team Card export presets include multiple aspect ratios
- Header collapses to mobile menu via `ui-store`

## Assets

- Pokémon sprites: `get-pokemon-sprite-path` + public / remote URLs
- Item icons: Supabase storage bucket
- Team card: local backgrounds + Masters trainers manifest
- Home previews: `src/data/preview-pokemon.ts` (not live DB query)
