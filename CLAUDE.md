# Resistance Training Tracker — CLAUDE.md

This file is the entry point for any Claude session working on this codebase. Read it before touching any code.

## Repo

- **GitHub:** https://github.com/learningwithsnoopy101/resistance-training-tracker
- **Live app:** https://learningwithsnoopy101.github.io/resistance-training-tracker
- **Stack:** React 18 + Vite + Tailwind CSS + Supabase (Postgres + auth) + GitHub Pages
- **Deploy:** `npm run deploy` (gh-pages)
- **Dev:** `npm run dev` → http://localhost:5173/resistance-training-tracker/

## Project spec

`DESIGN_SPEC.md` in the repo root is the authoritative v2 design doc. Always read it before starting new work. It covers:
- Full color palette and design system tokens
- Smart suggestion engine rules
- Screen-by-screen information architecture
- Build order with completed milestones marked ✅

## Architecture

```
App.jsx                  — root: auth gate, data fetching, routing
main.jsx                 — entry, wraps App in HashRouter (GitHub Pages-friendly)
index.html               — single HTML shell

components/
  Auth.jsx               — sign in / sign up UI
  ExerciseForm.jsx       — log/edit form (full mode only; quick mode was removed)
  ExerciseList.jsx       — renders exercise cards grouped by date
  ExerciseCard.jsx       — single exercise row with 4px type-color left bar
  TabNavigation.jsx      — pill-style nav (Log / Analytics / History)
  SuggestedSession.jsx   — "suggested for today" banner on Log tab
  Analytics.jsx          — Progress screen (step 5, partially built)
  BulkImport.jsx         — CSV import tool
  DataPortability.jsx    — export tool

lib/
  supabase.js            — Supabase client (project URL + anon key)
  suggestions.js         — pure suggestion engine logic (no React)

styles/
  globals.css            — Tailwind base + custom CSS variables
tailwind.config.js       — warm palette tokens (see Design System below)
```

## Supabase tables

### `exercises` — logged sessions (one row per exercise entry)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | references auth.users, RLS-enforced |
| name | text | exercise name |
| type | text | Upper Body / Lower Body / Abs / Peak 8 |
| date | date | |
| sets | integer | |
| reps | integer | |
| weight | text | null for bodyweight |
| unit | text | 'lbs' default |
| is_max_weight | boolean | PR flag |
| is_max_reps | boolean | PR flag |
| notes | text | nullable |
| created_at | timestamptz | auto |

### `exercise_library` — shared catalog (68 exercises, read-only for users)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | unique |
| type | text | Upper Body / Lower Body / Abs / Peak 8 |
| primary_muscle | text | |
| secondary_muscles | text[] | |
| equipment | text | |
| movement_pattern | text | Squat, Hinge, Push (horizontal/vertical), Pull (horizontal/vertical), Core, Isolation, Anti-rotation, etc. |
| created_at | timestamptz | auto |

RLS: users see only their own `exercises` rows; anyone authenticated can read `exercise_library`.

## Data flow in App.jsx

- Auth state managed via `supabase.auth.onAuthStateChange`
- On login: fetches all `exercises` (desc by date, created_at) + full `exercise_library`
- `fromDb` / `toDb` helpers map snake_case DB fields ↔ camelCase app state
- Library loaded once, passed down as prop; `ExerciseList` memoizes a `Map<name, libraryRow>` for O(1) lookup in cards
- Edit: sets `editingId` + `editingData`, navigates to `/`
- Copy: sets `copyData`, navigates to `/` — form pre-fills and clears `copyData` after consuming

## Design system

All tokens live in `tailwind.config.js` and `styles/globals.css`.

**Backgrounds:** `bg-page` (#FAF6EC), `bg-cream` (#FAF7F0), `bg-beige` (#F0EBE0)  
**Borders:** `border-taupe` (#E0D9C4), `border-taupe-dark` (#D4CCB8)  
**Text:** `text-ink` (#4A3F32 warm brown), `text-ink-muted` (#6B6354)  
**Border radius:** `rounded-card` (10px), `rounded-input` (6px)  
**Typography classes:** `text-h1-warm` (18px/500), `text-h2-warm` (14px/500), `text-h3-warm` (13px/500), `text-sm-warm` (13px), `text-xs-warm` (12px), `text-tiny` (11px), `text-micro` (10px UPPERCASE)

**Exercise type colors (all use same pattern):**
| Type | Accent | Fill | Ink |
|---|---|---|---|
| Lower Body | `bg-lower-body` #8FA968 | `bg-lower-body-fill` #E5EDD5 | `text-lower-body-ink` #4A5C36 |
| Upper Body | `bg-upper-body` #6F89A8 | `bg-upper-body-fill` #DEE5EE | `text-upper-body-ink` #3D4F66 |
| Abs/Core | `bg-abs-core` #C8855E | `bg-abs-core-fill` #EDD9C9 | `text-abs-core-ink` #7A4A2C |
| Peak 8 | `bg-peak-8` #B89856 | `bg-peak-8-fill` #EBE0C2 | `text-peak-8-ink` #6B5410 |

**Semantic:** `bg-pr-fill` / `text-pr-ink` (gold PR badge), `bg-warn-fill` / `text-warn-ink` (soft coral recovery warning)

Design rule: sentence case everywhere, never bold text heavier than weight 500, shadows only on active tab.

## Suggestion engine (`lib/suggestions.js`)

Pure functions — no React, no Supabase. Key exports:
- `normalizePattern(raw)` — maps 23 raw movement_pattern values → 8 canonical buckets
- `computeRecoveryState(exercises, library)` — 48h block / 48-72h deprioritize / 72h+ fresh per primary muscle
- `computeMuscleFrequency(exercises, library)` — trailing-7-day session count per muscle group
- `buildSession(exercises, library, count)` — returns a session array of `count` exercises
- `attachLastUsed(picks, exercises)` — enriches each pick with most-recent logged stats

**Slot structure (hard ratio by TYPE, not soft bonus):**  
`1 core + ceil((count-1)/2) lower + floor((count-1)/2) upper`  
At default count=6: 3 lower / 2 upper / 1 core.

**Core and Peak 8:** exempt from recovery rules (can be suggested daily). Peak 8 is excluded from suggestions entirely (tracked separately).

## Routing

HashRouter (GitHub Pages-friendly, no 404.html fallback needed).
- `/` → Log tab (form + SuggestedSession + recent activity)
- `/analytics` → Analytics/Progress screen
- `/history` → full ExerciseList

## Build order status

1. ✅ Theme/palette refactor
2. ✅ Exercise card redesign
3. ✅ Tab navigation
4. ✅ Smart suggestion engine
5. ⬜ **Progress screen** (next) — ship in 3 chunks:
   - 5a: per-exercise progression line chart + exercise dropdown + estimated-1RM toggle (Epley: `weight × (1 + reps/30)`)
   - 5b: time-to-progress table (current vs previous working set, days + sessions to progress, plateau flag at 28+ days)
   - 5c: 3 KPI cards (consistency streak, this week's wins, active progression set) + weekly pulse card
   - Tab label: "Analytics" → "Progress"; route can stay `/analytics` or rename to `/progress`
   - Chart: **inline SVG** (not Recharts — bundle size not worth it for one chart)
6. ⬜ History screen filtering by muscle group
7. ⬜ Polish — transitions, empty states, mobile responsiveness

## Open decisions

- **Peak 8 catalog:** currently empty in the DB. Add "Peak 8 Sprints" when Lisa confirms her protocol.
- **Focus field:** currently free-text. Could be promoted to enum for filtering.
- **Chart library:** resolved — use inline SVG, not Recharts.
- **Dark mode:** not in scope for v2.

## Key conventions

- No TypeScript — plain JS/JSX throughout
- Tailwind only — no inline styles, no CSS modules
- Supabase client is a singleton in `lib/supabase.js`
- All DB field names: snake_case. All app state: camelCase.
- `exercise_library` lookup always via the memoized Map in ExerciseList, not re-queried per card
- Custom exercise names (not in library) get neutral gray styling — no pill, no sub-line (graceful fallback)
