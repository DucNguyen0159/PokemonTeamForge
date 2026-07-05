# Pokemon Champions UI/UX plan

**Status:** Shipped (v1) — July 2026  
**Scope:** Dedicated Pokemon Champions experience inside PokemonTeamForge

## Shipped status (July 2026)

Champions Phases **1–11 are implemented** in code. `npm test` (42 files, 185 tests) and `npm run build` (43 routes) pass.

| Area | Routes / entry | Key modules |
|------|----------------|-------------|
| Dashboard | `/champions` | `champions-dashboard.tsx`, `active-team-snapshot.ts`, identity bar |
| Builder + Plans | `/champions/builder`, `?tab=plans` | `champions-team-builder.tsx`, `champions-builder-plans-panel.tsx` |
| Damage Lab | `/champions/damage` | `champions-damage-lab.tsx`, `damage-calc-adapter.ts` |
| Matchup Coach | `/champions/coach` | `champions-matchup-coach.tsx`, `matchup-coach-analysis.ts` |
| Presets | `/champions/presets`, `/[presetId]` | 30 teams in `champions-presets.ts` |
| Community | `/champions/community`, `/[teamId]` | `champions-community-service.ts`, explorer, cards, preview drawer |

**Note:** `/champions/plans` redirects to `/champions/builder?tab=plans` (plans live in Builder, not a separate workspace file).

### Future work (not in v1)

**Product**

- Community moderation (report teams, admin review)
- Server API wrappers for presets/community (audit logging, rate limiting)
- Per-species mega stone filtering in item picker; per-stone real sprites
- Profile page Champions visual parity (generic team cards today)
- Identity bar `mini` variant on community detail header
- “Open in Damage Lab” shortcut from preset cards
- Matchup Coach auto-suggestions inside plan editor
- Export/share battle plan as image or text card
- Opponent archetype picker with curated threat hints
- Load drawer “Recent” / “By ID” tabs; lazy detail fetch for non-focused Builder slots

**Ops (production / fresh Supabase)**

- Run `champions-mega-stones.sql` and `champions-community-grants.sql` if not already applied
- Optional: upload `mega-stone-generic.png` to `item-icons` bucket
- Restart dev server after mega-stones SQL; run `npm run check:mega-stones -- --strict`
- Optional dev QA: `npm run seed:champions-community`

The phase checklists below record **what shipped** (`[x]`). Open work lives in **Future work** above — not as scattered `[ ]` items.

---

## Implementation checklist

### Completed in this implementation pass

- [x] Added top-level `Champions` entry to main navbar.
- [x] Added dedicated Champions route tree under `src/app/champions/`.
- [x] Added Champions layout shell with left desktop sub-navbar and mobile sticky section menu.
- [x] Added section routes: Dashboard, Team Builder, Damage Lab, Strategy Presets, Battle Plan Guide, Matchup Coach, Community Teams.
- [x] Added dynamic detail route scaffolds for Presets and Community team detail pages.
- [x] Added champions domain types (`ChampionsTeam`, `ChampionsPokemon`, `ChampionsBattlePlan`, SP spread).
- [x] Added shared champions data/constants for rules, nav items, and implementation tracking.
- [x] Added Supabase SQL extension scaffold: champions mode columns, battle plans table, stars/comments tables, and RLS policies.
- [x] Added Battle Plan CRUD in Champions Builder and persisted it through Champions team save/load.
- [x] Added curated Champions preset dataset, preset list/detail pages, and "Load into Champions Builder" flow.
- [x] Integrated `@smogon/calc` and shipped a functional Champions Damage Lab adapter UI (SP conversion, fixed IV assumptions, move/field inputs, result + KO text).
- [x] Implemented Community Teams data flow (public list/detail, publish/unpublish, stars, comments, and fork-to-builder).

### Launch checklist (code complete)

All core launch items below are shipped. See **Future work** for optional follow-ups.

- [x] Build baseline Champions Team Builder editing UX (6 slots, team metadata, species-locked ability suggestions, item/move inputs, Nature dropdown with effect hints, SP sliders).
- [x] Wire Champions saved-team CRUD in Supabase and profile pages with mode-aware loading.
- [x] Expand Damage Lab with baseline legality-aware move/ability/item pickers and stronger Mega compatibility warnings for Champions custom metas.
- [x] Add baseline legality checks in Champions Builder (duplicate species/item checks, SP allocation checks, and battle-plan slot sanity checks).
- [x] Build Matchup Coach baseline computations (defensive weakness map, speed tiers, threat checklist, lead suggestions, SP optimizer hints).
- [x] Phase 6.2: enforce 66 total SP cap at input-time (auto-clamp per stat after considering remaining SP budget).
- [x] Phase 6.2: simplify Mega UX in Builder by using Item-only Mega handling (removed separate Mega Stone and Use Mega by default controls from Builder UI).
- [x] Update credits/disclaimer pages with Champions data references and unofficial fan-tool notice.

### Phase 7 — Mega Stone catalog backfill (Legends Z-A / Mega Dimension)

Track implementation against `src/data/champions-mega-stones.ts` (source of truth) and `supabase/champions-mega-stones.sql` (DB backfill).

#### Data layer

- [x] Create curated mapping file `src/data/champions-mega-stones.ts` (species ↔ stone ↔ mega form, aliases, supplement vs PokéAPI catalog).
- [x] Export helpers: `isMegaStoneItem`, `isMegaStoneCompatibleWithSpecies`, `resolveMegaPokemonSlug`, `resolveMegaPokemonSlugForShowdown`, `filterMegaStonesForSpecies`.
- [x] Cover special cases: Raichunite X/Y, Staraptite (not Staraptorite), Meowsticite, Tatsugirinite, Magearnite, Z-variant stones.
- [x] Omit Rayquaza (no stone in games).

#### Supabase

- [x] Add `supabase/champions-mega-stones.sql` with `INSERT … ON CONFLICT (slug) DO UPDATE` for ~46 supplement stones.
- [x] Set `competitive_group = 'mega_stones'`, `is_competitive = true`, generic `icon_url` → `mega-stone-generic.png`.

Deploy: run SQL in Supabase, then restart dev server — see root `README.md` and **Future work** above.

#### App integration (no new UI — builders already use competitive items API)

- [x] Replace fragile `endsWith("ite")` legality in `ruleset-legality.ts` with curated mapping re-exports.
- [x] Update `damage-calc-adapter.ts` to resolve mega Showdown IDs from stone mapping (not `-Mega-X` string guessing).
- [x] Verify Eviolite / Meteorite no longer treated as Mega Stones in Champions legality.

#### Verification

- [x] Add unit tests `src/data/champions-mega-stones.test.ts`.
- [x] Add `npm run check:mega-stones` consistency script (`scripts/check-mega-stone-consistency.mjs`).

### Phase 8 — Battle Plan Workspace

Track implementation against `src/components/champions/champions-builder-plans-panel.tsx` (Builder `?tab=plans`) and shared battle-plan modules.

#### Page shell & data sync

- [x] Rename page positioning to **Battle Plan Workspace** (`/champions/plans`).
- [x] Update Champions sub-nav label/description.
- [x] Consume pending preset/community team loads on workspace mount (same as Builder).
- [x] Show rules chips: Mega only, Singles 3v3, Doubles 4v4, ruleset id.

#### Roster summary

- [x] Add `ChampionsRosterSummary` with 6 compact roster cards.
- [x] Show sprite, types, ability, item (+ Mega badge), nature, SP focus.
- [x] Link to Team Builder when roster needs editing.
- [x] Resolve species details by `pokemonId` or slugified name (preset-safe).

#### Plan authoring

- [x] Add shared `ChampionsBattlePlanEditor` (visual member cards, lead/backup toggles).
- [x] Create/edit: plan name, matchup label, format, win/avoid/general notes.
- [x] Visual Pokémon selection with sprites (not plain checkboxes).
- [x] Lead must be subset of selected; deselect clears lead/backup tokens.
- [x] Store actions: `addBattlePlanFromTemplate`, `duplicateBattlePlan`.
- [x] Refactor Champions Builder to reuse shared editor.

#### Templates & saved plans

- [x] Add `src/data/champions-battle-plan-templates.ts` (10 quick-start templates).
- [x] Template buttons prefill name/matchup/note prompts only.
- [x] Saved plans list with collapse/expand (first plan expanded by default).
- [x] Duplicate and delete actions on each plan.
- [x] Sort plans: Singles first, then Doubles, then name.

#### Quality checks & help

- [x] Add `evaluateBattlePlanQuality` warnings (counts, leads, notes, mega coverage).
- [x] Show per-plan quality panel in editor.
- [x] Collapsible **How to build a battle plan** help section with Champions rules reminder.

#### Tests & verification

- [x] Add `src/lib/champions/battle-plan-utils.test.ts`.

### Phase 9 — Champions Strategy Presets UI

Track implementation against `src/components/champions/champions-preset-explorer.tsx`, `champions-preset-card.tsx`, and `champions-preset-detail-view.tsx`.

#### Preset metadata

- [x] Extend `ChampionsPreset` with `accentTheme`, `difficulty`, `bestFor`, `featuredMega`.
- [x] Add `formatSupportLabel()` helper for display chips.
- [x] Annotate all curated presets with theme/difficulty/featured Mega metadata.

#### List page (`/champions/presets`)

- [x] Add `ChampionsPresetExplorer` with playstyle + format chip filters.
- [x] Add `ChampionsPresetCard` — accent border, tags, Featured Mega, 2×3 roster sprite grid, plan preview, Load + Preview CTAs.
- [x] Batch sprite hydration via static preset display data (`champions-preset-display.ts`, generated at import time).
- [x] Wire list page to `ChampionsPresetExplorer` (replace inline cards).

#### Detail page (`/champions/presets/[presetId]`)

- [x] Add `ChampionsPresetDetailView` with accent header, difficulty/format chips, best-for line.
- [x] Roster section: sprite, types, ability, item (+ Mega badge), nature, SP total, moves.
- [x] Battle plans section: format chip, selected/leads, win/avoid notes.
- [x] Load into Builder + back navigation.

#### Shared UI helpers

- [x] Add `src/lib/champions/preset-ui.ts` (accent classes, filter chips, difficulty labels).

#### Tests & verification

- [x] Run `npm run lint && npm run build`.

### Phase 10 — Champions Pokémon Catalog Layer

Track implementation against `src/hooks/queries/use-pokemon-catalog.ts`, `src/app/api/champions/pokemon-summaries/route.ts`, and `src/data/champions-preset-display.ts`.

#### S1 — Foundation

- [x] Add `PokemonSummary` type and batch summaries API (`GET /api/champions/pokemon-summaries`).
- [x] Add React Query hooks: `usePokemonSummary`, `usePokemonSummaries`, `usePokemonSummariesBySlot`, `usePokemonDetail`.
- [x] Add unit tests for catalog utils and data-access.

#### S2 — Static preset display + layout warmup

- [x] Extend `scripts/import-champion-presets.mjs` to emit `src/data/champions-preset-display.ts` (sprites + types from PokeAPI cache).
- [x] Add `getAllChampionsPresetSpeciesSlugs()` and `getPresetSpeciesDisplay()`.
- [x] Add `ChampionsCatalogWarmup` on presets page to prefetch preset species summaries via React Query.

#### S3 — Presets migration

- [x] Preset cards/detail use static display (zero network on Presets tab).
- [x] Remove `useChampionsPresetSprites` hook.

#### S4 — Champions tabs migration

- [x] Migrate Builder, Battle Plan Workspace, Matchup Coach, and Damage Lab to catalog hooks.
- [x] Add `useChampionsRosterCatalog` and shared `useCompetitiveItems` query.

#### S5 — Progressive loading UX

- [x] Roster summary skeleton tiles while summaries load; per-slot error affordance for missing species.

#### S6 — Cleanup

- [x] Verify Champions display code no longer uses ad-hoc `useEffect` + full detail fetch loops.

### Phase 11 — Active Team Command Center

**Status:** Shipped July 2026 (M1–M6 complete).

**Goal:** Unify Dashboard, Team Builder, and Community Teams around the **Team Identity Bar** and readiness-driven next steps.

**Design principle:** One team, three modes — **Dashboard** (orient), **Builder** (edit), **Community** (share & discover).

**Primary artifacts:**

| Artifact | Path |
|----------|------|
| Snapshot + next-step logic | `src/lib/champions/active-team-snapshot.ts` (+ `active-team-snapshot.test.ts`) |
| Identity bar component | `src/components/champions/champions-team-identity-bar.tsx` |
| Slot tile (shared) | `src/components/champions/champions-roster-slot-tile.tsx` |
| Load team drawer | `src/components/champions/champions-load-team-drawer.tsx` |
| Community team card | `src/components/champions/champions-community-team-card.tsx` |
| Dashboard shell | `src/components/champions/champions-dashboard.tsx` |
| Snapshot hook | `src/hooks/use-active-team-snapshot.ts` |

#### Shipped by milestone

| Milestone | Delivered |
|-----------|-----------|
| **M1** | Snapshot types, `buildActiveTeamNextStep`, identity bar (expanded / compact / mini), roster slot tiles, `useActiveTeamSnapshot`, unit tests |
| **M2** | `ChampionsDashboard` command center, next-step CTA, saved teams row, community preview, collapsed rules |
| **M3** | Builder sticky header, slot focus + overview toggle, load team drawer, publish in header, legality panel, deep links (`?slot=`, `?focus=sp`) |
| **M4** | Community card + explorer, preview drawer, detail tabs (roster / plans / comments), fork to Builder |
| **M5** | Cross-surface slot navigation, inline save/publish/fork feedback |
| **M6** | `active-team-snapshot.test.ts`, lint + build + full vitest suite pass |

**Definition of done (met):** Orient on Dashboard, edit in Builder, browse Community with a consistent team identity — repeat visits stay cache-friendly.

Deferred polish is listed under **Future work** at the top of this doc. The detailed M1–M6 task lists from the planning phase were removed after ship to avoid stale unchecked boxes.

## Product direction

Add a top-level **Champions** tab to the main navbar. This area should be a dedicated Pokemon Champions workspace, not a reskin of the normal Builder.

The Champions experience should focus on:

- Full 6-Pokemon Champions team building.
- Single 3v3 and Double 4v4 battle planning.
- Mega Evolution as the only currently available battle gimmick.
- Champions Stat Points: 66 total SP, 32 max per stat, fixed IV assumptions.
- Strategy presets, damage calculation, matchup coaching, and community teams.
- Beginner-friendly explanations without removing advanced controls.

Do not include Tera, Dynamax, Gigantamax, or Z-Move controls unless the live Pokemon Champions ruleset later supports them.

## Core product decisions

### Teams are always 6 Pokemon

Pokemon Champions uses a 6-Pokemon roster, then the player chooses 3 Pokemon for Singles or 4 Pokemon for Doubles at battle time. PokemonTeamForge should model that same flow.

A Champions team should therefore be:

- A full roster of up to 6 Pokemon.
- One or more Singles or Doubles battle plans.
- Saved as a Champions-specific team, separate from standard PokemonTeamForge teams.

Do not make Champions Builder only 3 or 4 Pokemon. That would remove the team-preview and selection strategy that matters in Pokemon Champions.

### Battle Plans represent the selected 3 or 4

A **Battle Plan** is a saved selection from the 6-Pokemon roster.

For Singles:

- Select exactly 3 Pokemon.
- Choose 1 lead.
- Add matchup notes and win condition notes.

For Doubles:

- Select exactly 4 Pokemon.
- Choose 2 leads.
- Optionally mark backup roles.
- Add matchup notes and win condition notes.

Example battle plans for one 6-Pokemon team:

- Safe Default
- Vs Rain
- Vs Sun
- Vs Trick Room
- Vs Fast Offense
- Vs Bulky Balance
- Rain Physical Core
- Rain Special Core

Battle Plan notes should be saved with the team because they describe how that team is intended to be played.

### Strategy presets are 6-Pokemon teams

Pokemon Champions Strategy Presets should also be full 6-Pokemon teams, not isolated 3- or 4-Pokemon squads.

Each preset should include:

- Full 6-Pokemon roster.
- Format support: Singles, Doubles, or Both.
- Recommended Battle Plans.
- Ability, item, moves, SP spread, Nature, and Mega information for each Pokemon.
- A short explanation of how to use the team.

This gives users a realistic team structure while still teaching common strategic patterns.

### Community Teams are 6-Pokemon teams

Community Teams should also use the same Champions team structure:

- Full 6-Pokemon roster.
- Format support: Singles, Doubles, or Both.
- Battle Plans.
- Strategy notes.
- Star count.
- Comments.
- Author and created date.

Default sorting should be **Highest Rated** first, with an option for **Newest**.

## Information architecture

The main navbar gets one new item:

- Champions

The Champions tab uses a vertical sub-navbar on desktop:

- Champions Dashboard
- Team Builder
- Damage Lab
- Strategy Presets
- Battle Plan Guide
- Matchup Coach
- Community Teams

On smaller screens, the vertical sub-navbar should collapse into a mobile-friendly navigation pattern:

- Sticky top segmented navigation when space allows.
- Otherwise, a **Champions Menu** button that opens a slide-out drawer.
- The active section should remain clear after navigation.

## Visual design and UI

### Visual direction

The Champions tab should feel like a **dark tactical battle lab with collectible roster cards**, not a generic AI dashboard and not a copy of Pokemon Showdown.

Visual traits:

- Dark background, but not pure black. Use layered dark surfaces with depth.
- Subtle panels with borders, soft glow, and shadow instead of flat blocks.
- Pokemon sprites and icons as the primary visual anchors on every page.
- Compact but readable stat blocks and SP bars.
- Clear status chips: `Mega Ready`, `3v3 Plan`, `4v4 Plan`, `Legal`, `Needs Item`.
- Type colors used sparingly for identity, not as full backgrounds.
- More "battle lab UI", less "AI glassmorphism".

Avoid:

- Heavy purple/blue gradients everywhere.
- Large vague hero sections.
- Generic glowing orbs and decorative AI patterns.
- Overly empty cards with lots of padding and little information.
- Marketing filler text such as "Unlock your strategy potential".
- Repetitive identical rounded SaaS cards.

The rule of thumb: if an element does not communicate Pokemon or team-building information, use it very lightly.

### Desktop layout

```txt
┌─────────────────────────────────────────────┐
│ Main Site Navbar                            │
├──────────────┬──────────────────────────────┤
│ Champions    │ Page Header                  │
│ Subnav       │ Main Content                 │
│              │                              │
│ Dashboard    │ Cards / Builder / Tools      │
│ Builder      │                              │
│ Damage Lab   │                              │
│ Presets      │                              │
│ Plans        │                              │
│ Coach        │                              │
│ Community    │                              │
└──────────────┴──────────────────────────────┘
```

- Main site navbar stays on top.
- Left vertical sub-navbar is sticky.
- Main content area on the right.
- Optional right-side summary panel on builder-heavy pages.

### Mobile layout

- Hide the left sub-navbar.
- Use a sticky **Champions Menu** button or horizontal scroll tabs.
- Keep Pokemon cards stacked in a single column.
- Avoid dense table layouts; convert tables into stacked cards.

### Per-section UI feel

**Champions Dashboard** — a command center. Rules card, Singles/Doubles format cards, Mega-only mechanic card, SP system card, recent saved teams, and quick action cards. It should quickly answer "what can I do here, and what are the Champions rules?"

**Champions Team Builder** — the best-looking page, built around a 6-slot roster grid:

```txt
[ Pokemon 1 ] [ Pokemon 2 ] [ Pokemon 3 ]
[ Pokemon 4 ] [ Pokemon 5 ] [ Pokemon 6 ]
```

Each Pokemon card shows sprite, name + form, item, ability, four moves, SP mini bars, Mega readiness from item compatibility, and warning chips. Battle Plans panel, team notes, and legality summary sit beside or below the grid. This keeps the page visual and game-like instead of form-heavy.

**Battle Plan Guide** — a playbook of plan cards. Each card shows plan name (for example `Vs Rain`), a format badge (`Singles 3v3` or `Doubles 4v4`), selected Pokemon icons, a lead marker, a notes preview, and strength/warning chips.

**Damage Lab** — clean and modern, with the result as the star:

```txt
[ Attacker Panel ]  ->  [ Result Panel ]  <-  [ Defender Panel ]
```

The Result Panel highlights a big damage range, KO chance, hits to KO, a plain-English explanation, and small SP suggestions. Advanced controls stay collapsible. Example result copy: "Mega Absol has a guaranteed 2HKO. Add 4 Atk SP to reach a 93.8% OHKO chance."

**Matchup Coach** — visual analysis, not walls of text. Coverage grid, weakness heatmap, speed tier ladder, threat checklist, Mega dependency warning, and lead pair suggestions. Each insight should feel actionable.

**Community Teams** — attractive team cards showing team name, six Pokemon icons, format support, star count, comment count, author, battle plan count, and "View Team" / "Load into Builder" actions. Default sort is Highest Rated.

### Avoiding an AI-generated look

The strongest way to avoid a generic AI look is to make the UI **specific to Pokemon Champions**. Lean on real domain elements: Pokemon sprites, type badges, SP bars, battle plan cards, move chips, Mega-ready item indicators, team legality states, and strategy labels based on real gameplay. Decorative, non-informational elements should be minimal.

The target feel: a dark battle lab with collectible roster cards, tactical plan cards, and clean analysis panels — a tool a competitive player respects, but friendly enough that a beginner knows where to click.

## Section plan

### Champions Dashboard

The dashboard is the overview hub for Pokemon Champions.

Main components:

- Current rules summary.
- Singles 3v3 and Doubles 4v4 format cards.
- Mega Evolution-only reminder.
- SP system summary: 66 total, 32 per stat, fixed IVs.
- Quick actions for Builder, Damage Lab, Strategy Presets, Matchup Coach, and Community Teams.
- Saved Champions team shortcuts.

The dashboard should make new users understand how Champions differs from the normal Builder.

### Champions Team Builder

The Team Builder is the main 6-Pokemon roster editor.

Main components:

- Six Pokemon roster slots.
- Format support selector: Singles, Doubles, or Both.
- Pokemon, form, ability, item, moves, Nature, and SP editor.
- Mega eligibility indicator.
- Mega item compatibility validation.
- Legality warnings for duplicate species, duplicate held items, invalid roster size, invalid moves, and invalid Champions data.
- Battle Plans panel.
- Import and export controls.
- Team notes.

The Battle Plans panel should let users create multiple 3v3 or 4v4 selections from the same 6-Pokemon roster.

### Champions Damage Lab

The Damage Lab should use reliable calculation logic but provide a custom PokemonTeamForge UI. The Smogon damage calculator project is a strong reference or engine candidate because it powers the official Pokemon Showdown calculator: https://github.com/smogon/damage-calc

Main components:

- Attacker panel.
- Defender panel.
- Move/result panel.
- Field conditions.
- Weather, terrain, screens, boosts, status, and critical hit controls.
- Mega state toggle.
- Champions SP editor.
- Import attacker or defender from the Champions Builder.
- Plain-English result explanations.

The UI should avoid the dense Pokemon Showdown calculator layout. It should explain what the result means and provide useful guidance, such as whether a KO is guaranteed or which SP adjustment changes the result.

Do not show Tera, Dynamax, Gigantamax, or Z-Move controls.

### Champions Strategy Presets

Strategy Presets are curated 6-Pokemon Champions teams.

Main components:

- Preset cards.
- Strategy name.
- Format support.
- Six Pokemon icons.
- Team style, such as Rain, Sun, Trick Room, Bulky Offense, Balance, Hyper Offense, or Stall.
- Recommended Battle Plans.
- "Load into Champions Builder" action.
- "Open in Damage Lab" shortcut.
- Short strategy explanation.

Presets should be practical starting points that teach users how a team works, not just static examples.

### Battle Plan Guide

The Battle Plan Guide replaces the earlier Team Preview Simulator idea.

Instead of requiring users to imagine or input an opponent's exact 6-Pokemon team, this feature helps users prepare Battle Plans for common matchup situations.

Main components:

- Battle Plan list for the current team.
- Matchup labels such as Safe Default, Vs Rain, Vs Sun, Vs Trick Room, Vs Fast Offense, Vs Bulky Balance, and Vs Stall.
- Selected 3 or 4 Pokemon.
- Lead Pokemon or lead pair.
- Win condition note.
- Avoid note.
- General plan note.
- Optional "copy from existing plan" action.

This feature should stay lightweight. It stores planning information and uses simple team data; it should not run expensive automatic simulations.

### Champions Matchup Coach

The Matchup Coach analyzes the currently loaded 6-Pokemon Champions team and its Battle Plans.

Main components:

- Offensive coverage chart.
- Defensive weakness chart.
- Speed tier tool.
- Threat checklist.
- Mega dependency warnings.
- Lead pair suggestions for Doubles.
- SP optimizer suggestions.
- Physical/special balance.
- Battle Plan warnings, such as plans with no speed control, too many shared weaknesses, or weak Mega usage.

This section should answer: "What is my team good at, what is it weak against, and how should I adjust it?"

### Community Teams

Community Teams is the interactive sharing area.

Main components:

- Uploaded 6-Pokemon Champions teams.
- Default sort: Highest Rated.
- Secondary sort: Newest.
- Star button.
- Comment section.
- Team detail page.
- Load into Champions Builder.
- Copy or fork team.
- Filter by Singles, Doubles, or Both.

Community teams should include their Battle Plans and plan notes so users understand how the author intended the team to be played.

## Saved team model

Saved teams need a clear mode so the app knows which builder should open them.

Recommended fields:

```ts
type SavedTeamMode = "standard" | "champions";

type ChampionsBattlePlan = {
  id: string;
  name: string;
  format: "single" | "double";
  matchupLabel: string;
  selectedPokemonIds: string[];
  leadPokemonIds: string[];
  backupPokemonIds?: string[];
  winConditionNote?: string;
  avoidNote?: string;
  generalNote?: string;
};

type ChampionsTeam = {
  id: string;
  name: string;
  mode: "champions";
  formatSupport: "single" | "double" | "both";
  rulesetId: string;
  pokemon: ChampionsPokemon[];
  battlePlans: ChampionsBattlePlan[];
  teamNotes?: string;
};
```

Routing behavior:

- Standard teams open in the normal Builder.
- Champions teams open in the Champions Team Builder.
- If a Champions team is opened from the normal Builder, prompt the user to open it in Champions Builder.
- If a standard team is opened from Champions Builder, offer an optional conversion flow.

Suggested routes:

- `/builder?teamId=...` for standard teams.
- `/champions/builder?teamId=...` for Champions teams.

### Champions Pokemon slot model

Each roster slot needs its own shape. Extend the saved team model with:

```ts
type ChampionsSpSpread = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

type ChampionsPokemon = {
  id: string; // client slot id, stable within a team
  speciesId: string;
  formId?: string;
  nickname?: string;
  ability: string;
  item?: string;
  moves: string[]; // up to 4
  statAlignment: string; // Nature name
  sp: ChampionsSpSpread;
};
```

Validation rules for each slot:

- SP total across six stats must not exceed 66.
- No single stat may exceed 32 SP.
- Moves must be legal for that Pokemon in Champions.
- Ability must be legal for that Pokemon in Champions.
- Item must be legal in Champions and not duplicated on the same team.
- Mega is item-driven in Builder (compatible Mega Stone as held item). Separate Mega Stone input is not required in Builder.
- Species must be legal in the active Champions ruleset.

## Implementation readiness decisions

These decisions should be locked before coding the Champions feature.

### Champions data source

Pokemon Champions does not provide a public official API for full competitive catalog data. PokemonTeamForge should treat Champions data as a **curated internal dataset**, similar to `src/data/strategy-teams.ts`, backed where possible by existing catalog tables.

Recommended data layers:

| Data | Source | Notes |
|------|--------|-------|
| Pokemon names, types, sprites | Existing Supabase `pokemon` + PokéAPI import | Reuse current catalog pipeline |
| Champions base stats | Curated Champions stat file | Manual or imported from community-maintained public lists; version per ruleset |
| Mega forms and Mega Stones | Curated Champions file | Map species/form → allowed Mega Stone items |
| Moves and abilities | Existing catalog + Champions legality overlay | Filter by ruleset |
| Held items | Existing `items` table + Champions legality overlay | Filter by ruleset |
| Strategy presets | Static `src/data/champions-strategy-teams.ts` (or similar) | Same pattern as current Strategies tab |
| Legality rules | `src/data/champions-format-rules.ts` | Duplicate species, duplicate items, roster size, allowed Megas |

Ruleset handling:

- Store a `rulesetId` on Champions teams (for example `regulation-m-a`).
- Legality checks read from the active ruleset file.
- When Nintendo changes regulations, update the ruleset file and Champions stat overlays. No Regulation Badge UI is required, but the data model should still know which ruleset a team was built against.

### Damage calculator integration

Use **`@smogon/calc` as the calculation engine** behind a PokemonTeamForge adapter. Do not copy the Showdown calculator UI. Do not fork `smogon/damage-calc` unless a hard requirement appears later.

Integration approach:

1. Install `@smogon/calc` (MIT license).
2. Build a `champions-calc-adapter` that converts Champions inputs into calc-compatible values:
   - Champions SP → equivalent calc EV/internal stat contribution at Level 50.
   - Fixed IV 31 for all stats.
   - Nature → nature modifier.
   - Mega state → correct form, stats, and ability in calc.
3. Build a custom Damage Lab UI on top of the adapter.
4. Add snapshot tests comparing adapter output against known Showdown Champions calc results for a small set of reference matchups.

Do not bundle Tera, Dynamax, Gigantamax, or Z-Move logic in the adapter until Champions rules support them.

### Route structure

Use dedicated routes under `/champions`, not one scroll-only mega page.

| Route | Purpose |
|-------|---------|
| `/champions` | Dashboard |
| `/champions/builder` | Team Builder |
| `/champions/damage` | Damage Lab |
| `/champions/presets` | Strategy Presets list |
| `/champions/presets/[presetId]` | Preset detail |
| `/champions/plans` | Battle Plan Guide for the loaded team |
| `/champions/coach` | Matchup Coach for the loaded team |
| `/champions/community` | Community Teams list |
| `/champions/community/[teamId]` | Community team detail |

Query parameters:

- `?teamId=...` on builder, plans, coach, and damage pages to load a saved Champions team.
- `?presetId=...` on builder to load a strategy preset.

Shared layout:

- `/champions/layout.tsx` renders the left sub-navbar (desktop) and mobile Champions Menu.
- Active route highlights the current section.

### Community Teams permissions

Align with existing auth patterns: guest tools for building, account required for cloud persistence and social actions.

| Action | Guest | Logged-in user |
|--------|-------|----------------|
| Browse community teams | Yes | Yes |
| View team detail | Yes | Yes |
| Star a team | No | Yes |
| Comment on a team | No | Yes |
| Upload / publish a team | No | Yes |
| Edit own published team | No | Yes (author only) |
| Delete own published team | No | Yes (author only) |
| Fork team into own Builder | Yes (local copy) | Yes (save as new team) |
| Star own team | No | No |
| Edit/delete others' comments | No | No (author of comment only for edit/delete) |

Additional rules:

- One star per user per team.
- Stars are toggleable (star / unstar).
- Fork creates a new private saved team owned by the current user; it does not modify the original.
- Published teams are snapshots at publish time unless the author explicitly updates them.
- Moderation hooks (report comment, hide team) can be added later without changing the core permission model.

### Database additions (Supabase)

Extend the existing saved-team schema rather than inventing a parallel system.

Recommended additions:

- `teams.mode` column: `"standard" | "champions"`.
- `teams.format_support` for Champions: `"single" | "double" | "both"`.
- `teams.champions_ruleset_id` (nullable).
- `teams.team_notes` (nullable text).
- `team_pokemon` extensions for Champions: `stat_alignment`, SP columns or JSON `sp` blob, `mega_stone`, `use_mega_by_default`.
- New table `champions_battle_plans` linked to `teams.id`.
- New table `champions_community_teams` (or `teams.is_public` + community metadata columns).
- New tables `champions_team_stars` and `champions_team_comments`.

RLS: same pattern as current teams — users read/write own rows; public read for published community teams.

## Licensing, cost, and donation-only model

PokemonTeamForge is donation-only (no merchandise, no affiliate links). The Champions feature can still be built with free or low-cost tooling if licenses and attribution are handled correctly.

### Free or low-cost to use

| Component | Cost | License / terms | Action required |
|-----------|------|-----------------|-----------------|
| `@smogon/calc` | Free | MIT | Add Smogon/damage-calc credit on Credits page; no payment or affiliate required |
| PokéAPI data | Free | Open data with attribution | Already credited; continue attributing |
| PokeAPI sprites | Free | Project terms on GitHub | Already credited; continue attributing |
| Supabase / Vercel / Resend | Free tier available | Service ToS | Existing infrastructure; monitor usage limits |
| Next.js, React, Tailwind, etc. | Free | Open source | Standard dependency licenses |

Using `@smogon/calc` does **not** require affiliate links, merchandise sales, or paid Smogon membership. MIT license allows commercial and non-commercial use with attribution.

### Requires care (not necessarily paid)

| Component | Concern | Recommendation |
|-----------|---------|----------------|
| Pokémon IP (names, sprites, game mechanics) | Fan project; not affiliated with Nintendo/The Pokémon Company | Keep donation-only model; add clear disclaimer on Champions pages and in Terms; no paid access gating |
| Bulbagarden Masters trainer sprites | CC BY-NC-SA 2.5 (non-commercial) | Already used for Team Card; donation-only site aligns with non-commercial use; do not sell access or ads |
| Champions stat data | No official API; community-sourced lists | Curate internally; cite public reference sources in Credits if used; do not scrape paywalled sites |
| `@smogon/calc` data sync | Must stay aligned with Showdown mechanics | Prefer importing the package over re-hosting their data files manually |

### What to avoid

- Affiliate links to Smogon, calc hosts, or data sites (not required and conflicts with your no-affiliate rule).
- Paywalled Champions data sources.
- Claiming official Pokémon Champions or Nintendo endorsement.
- Selling team access, premium presets, or Champions features behind payment (donations only).

### Credits page updates (when Champions ships)

Add to Credits:

- `@smogon/calc` / [smogon/damage-calc](https://github.com/smogon/damage-calc) — damage calculation engine (MIT).
- Any Champions stat reference sources used for curated data (community wikis, Serebii regulation pages, etc.) with links.
- Disclaimer: PokemonTeamForge is an unofficial fan tool and is not affiliated with Nintendo, Creatures Inc., GAME FREAK, or The Pokémon Company.

## Feature recommendations

Include these features in the final Champions experience:

- Battle Plan Builder.
- Battle Plan Guide.
- Threat Checklist.
- Speed Tier Tool.
- SP Optimizer.
- Lead Pair Suggestions.
- Import and Export.
- Team Notes.
- Community Comments.

Do not include these as standalone features:

- Beginner Tags.
- Regulation Badge.
- Full Team Preview Simulator.

## Performance guidance

Avoid expensive automatic simulations across many Pokemon combinations.

Recommended approach:

- Keep Battle Plan Guide mostly data-entry and note-driven.
- Compute simple derived stats on demand.
- Cache final stats, speed tiers, type weaknesses, coverage, and role summaries.
- Run damage calculations only when the user opens Damage Lab or explicitly requests a calculation.
- Avoid calculating every possible matchup for every community team card.

## Final experience summary

The Champions tab should feel like a complete Pokemon Champions Battle Lab:

- Build a real 6-Pokemon Champions roster.
- Save multiple 3v3 and 4v4 Battle Plans.
- Learn from curated Strategy Presets.
- Calculate damage with a clearer UI than Pokemon Showdown.
- Analyze threats, speed tiers, leads, and SP choices.
- Share, star, comment on, and fork community teams.

The goal is not to imitate Pokemon Showdown. The goal is to make Pokemon Champions team building more understandable, visual, and practical for both new and experienced players.
