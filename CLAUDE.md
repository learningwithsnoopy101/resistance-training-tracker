# Resistance Training Tracker — CLAUDE.md

Read this file before touching any code.

## Commands

```bash
npm run dev       # dev server → http://localhost:5173/resistance-training-tracker/
npm run build     # production build
npm run deploy    # build + push to gh-pages (GitHub Pages)
```

No test suite yet.

## Repo

- **GitHub:** https://github.com/learningwithsnoopy101/resistance-training-tracker
- **Live app:** https://learningwithsnoopy101.github.io/resistance-training-tracker
- **Stack:** React 18 + Vite + Tailwind CSS + Supabase (Postgres + auth) + GitHub Pages

## Project spec

Read `DESIGN_SPEC.md` before starting new work. It covers the full color palette, suggestion engine rules, screen-by-screen IA, and build order.

## Conventions

- Use plain JS/JSX — no TypeScript
- Use Tailwind utility classes only — no inline styles, no CSS modules
- Use named exports for components
- Use sentence case everywhere — never bold text heavier than weight 500
- Map all DB fields snake_case ↔ camelCase app state via `fromDb` / `toDb` in App.jsx
- Keep Supabase client as a singleton in `lib/supabase.js` — do not instantiate elsewhere
- Look up `exercise_library` via the memoized `Map<name, libraryRow>` in ExerciseList — never re-query per card
- Custom exercise names (not in library) get neutral gray styling — no pill, no sub-line

## Avoid

- Do not add TypeScript
- Do not use Recharts or any chart library — use inline SVG
- Do not use inline styles or CSS modules
- Do not query `exercise_library` per card — use the memoized Map
- Do not add new Supabase client instances — use the singleton in `lib/supabase.js`
- Do not use dark mode patterns — not in scope for v2

## Architecture

```
App.jsx                  — root: auth gate, data fetching, routing
main.jsx                 — entry, wraps App in HashRouter (GitHub Pages-friendly)
index.html               — single HTML shell

components/
  Auth.jsx               — sign in / sign up / forgot password UI (3 modes: signin | signup | forgot)
  ChangePassword.jsx     — modal for changing password (used from top bar + auto-opened on PASSWORD_RECOVERY)
  ExerciseForm.jsx       — log/edit form (full mode only; quick mode was removed)
  ExerciseList.jsx       — renders exercise cards grouped by date, historical view
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
tailwind.config.js       — warm palette tokens
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
- On `PASSWORD_RECOVERY` event (user clicked reset link in email): auto-opens `ChangePassword` modal
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
**Typography:** `text-h1-warm` (18px/500), `text-h2-warm` (14px/500), `text-h3-warm` (13px/500), `text-sm-warm` (13px), `text-xs-warm` (12px), `text-tiny` (11px), `text-micro` (10px UPPERCASE)

**Exercise type colors:**
| Type | Accent | Fill | Ink |
|---|---|---|---|
| Lower Body | `bg-lower-body` #8FA968 | `bg-lower-body-fill` #E5EDD5 | `text-lower-body-ink` #4A5C36 |
| Upper Body | `bg-upper-body` #6F89A8 | `bg-upper-body-fill` #DEE5EE | `text-upper-body-ink` #3D4F66 |
| Abs/Core | `bg-abs-core` #C8855E | `bg-abs-core-fill` #EDD9C9 | `text-abs-core-ink` #7A4A2C |
| Peak 8 | `bg-peak-8` #B89856 | `bg-peak-8-fill` #EBE0C2 | `text-peak-8-ink` #6B5410 |

**Semantic:** `bg-pr-fill` / `text-pr-ink` (gold PR badge), `bg-warn-fill` / `text-warn-ink` (soft coral recovery warning)

## Suggestion engine (`lib/suggestions.js`)

Pure functions — no React, no Supabase. Key exports:
- `normalizePattern(raw)` — maps 23 raw movement_pattern values → 8 canonical buckets
- `computeRecoveryState(exercises, library)` — 48h block / 48-72h deprioritize / 72h+ fresh per primary muscle
- `computeMuscleFrequency(exercises, library)` — trailing-7-day session count per muscle group
- `buildSession(exercises, library, count)` — returns a session array of `count` exercises
- `attachLastUsed(picks, exercises)` — enriches each pick with most-recent logged stats

**Slot structure (hard ratio by TYPE):**  
`1 core + ceil((count-1)/2) lower + floor((count-1)/2) upper`  
At default count=6: 3 lower / 2 upper / 1 core.

Core and Peak 8 are exempt from recovery rules. Peak 8 is excluded from suggestions entirely.

## Routing

HashRouter (GitHub Pages-friendly, no 404.html fallback needed).
- `/` → Log tab (form + SuggestedSession + recent activity)
- `/analytics` → Progress screen
- `/history` → full ExerciseList

## Roadmap

See `ROADMAP.md` for the full, current build plan (MCP server, Progress screen,
app↔MCP architecture, LLM features, CI/CD, AWS hosting). That file is the single
source of truth for what's planned and done — do not duplicate phase lists here.

## Open decisions

- **Peak 8 catalog:** currently empty in DB — add "Peak 8 Sprints" when Lisa confirms her protocol
- **Focus field:** currently free-text — could be promoted to enum for filtering
