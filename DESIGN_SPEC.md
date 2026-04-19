# Resistance Training Tracker — v2 Design Spec

**Owner:** Lisa Mirkovic
**Repo:** https://github.com/learningwithsnoopy101/resistance-training-tracker
**Live:** https://learningwithsnoopy101.github.io/resistance-training-tracker
**Last updated:** April 18, 2026

---

## Purpose of this document

This is the authoritative spec for v2 of the Resistance Training Tracker. Upload it to a new Claude chat to resume work without re-explaining decisions. It captures the complete v2 plan agreed between Lisa and Claude.

---

## Current state (v1 — already deployed)

- **Stack:** Vite + React 18 + Tailwind CSS + Supabase (auth + Postgres) + GitHub Pages
- **Components:** `Auth.jsx`, `App.jsx`, `ExerciseForm.jsx` (quick + full modes), `ExerciseList.jsx`, `ExerciseCard.jsx`, `BulkImport.jsx`, `DataPortability.jsx`
- **Supabase tables:** `exercises` (logged sessions) and `exercise_library` (exercise catalog)
- **Row-level security:** Each user sees only their own exercises
- **Current design:** White background, blue accents, gray cards — functional but generic

---

## Database — post-migration state

After running the migration SQL (`02_add_muscle_groups_with_new_exercises.sql`), the `exercise_library` table has these columns:

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Exercise name (unique) |
| `type` | text | Broad category: Upper Body / Lower Body / Abs / Peak 8 |
| `primary_muscle` | text | Main muscle worked |
| `secondary_muscles` | text[] | Supporting muscles |
| `equipment` | text | Required equipment |
| `movement_pattern` | text | Squat, Hinge, Push (horizontal/vertical), Pull (horizontal/vertical), Isolation, Anti-rotation, etc. |
| `created_at` | timestamptz | Auto |

**Total exercises after migration:** 68

### Coverage by primary muscle (v2)

| Primary muscle | # | 
|---|---|
| Back | 11 |
| Shoulders | 10 |
| Core | 8 |
| Quads | 8 |
| Chest | 6 |
| Glutes | 5 |
| Hamstrings | 5 |
| Biceps | 3 |
| Triceps | 3 |
| Inner Thighs | 2 |
| Obliques | 2 |
| Calves, Lower Back, Rear Delts, Traps | 1 each |

**Push:Pull ratio** = 10:11 (balanced, meaningful improvement from v1's 9:5 imbalance).

---

## v2 Design System

### Philosophy

The design should feel warm, calm, and motivating — not clinical or athletic-app-aggressive. Inspired by Claude.ai's warm off-white aesthetic. No neon, no dark gym-app vibes, no bright colors shouting for attention.

### Color palette

**Backgrounds:**
```
Page background:   #FAF6EC  (light warm beige — lighter than Claude.ai, softer than cream)
Card background:   #FAF7F0  (cream — slightly warmer than pure white)
Hover/subtle:      #F0EBE0  (deeper beige for nav bar, hovers)
Border:            #E0D9C4  (soft taupe)
Border emphasis:   #D4CCB8  (darker taupe for sections)
```

**Exercise type accent colors (muted, same warm family):**
```
Lower Body:   #8FA968  (muted sage green)       — light fill: #E5EDD5, dark text: #4A5C36
Upper Body:   #6F89A8  (muted slate blue)       — light fill: #DEE5EE, dark text: #3D4F66
Abs/Core:     #C8855E  (muted terracotta/orange) — light fill: #EDD9C9, dark text: #7A4A2C
Peak 8:       #B89856  (muted brownish gold)     — light fill: #EBE0C2, dark text: #6B5410
```

**Semantic colors:**
```
Text primary:      #2C2820  (warm near-black, not pure black)
Text secondary:    #6B6354  (warm muted brown-gray)
PR badge fill:     #F0E3C2  (pale gold)
PR badge text:     #6B5410
Recovery warning:  #D4A296  (soft coral — not alarming red)
Recovery text:     #B85040
Success/complete:  #8FA968  (sage green — same as lower body accent)
```

### Typography

- **Font:** System sans-serif stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Weights:** 400 regular, 500 medium (never 600+, feels heavy against warm palette)
- **Heading sizes:** H1 = 18px, H2 = 14px, H3 = 13px
- **Body text:** 13px primary, 12px secondary, 11px small, 10px caption
- **Sentence case everywhere.** Never Title Case, never ALL CAPS (except small UPPERCASE labels with 0.05em letter-spacing for 10px micro-labels).

### Layout rules

- **Border radius:** 10px for cards, 6px for inputs/buttons, 3px for progress bars
- **Shadows:** Minimal. Subtle `0 1px 2px rgba(0,0,0,0.04)` for active tabs only.
- **Borders:** `0.5px solid #E0D9C4` for cards, `0.5px solid #D4CCB8` for section dividers
- **Exercise card left border:** 4px vertical colored bar matching exercise type (not full border, just the left edge)

---

## Information Architecture

### Three tabs (top-level navigation)

1. **Log** — the active workout entry screen (left sidebar form + right recent activity)
2. **Progress** — per-exercise progression tracking and time-to-progress signal (renamed from v1's "Analytics" — see Screen 2 below for the narrower, higher-signal scope)
3. **History** — full searchable history of logged exercises

On mobile, tabs are sticky top. On desktop, they sit inline with the header.

### Removed from v1 concept

- ❌ **Routines / workout templates** — explicitly dropped. Smart suggestions serve Lisa better because she gets bored with repetition.

---

## Screen 1 — Log (home screen)

**Top bar:**
- Left: Page title ("Resistance Training"), sub-label showing today's date and week number
- Right: Tab switcher (Log / Analytics / History) — pill-style with light beige background and one active tab in cream with subtle shadow

**Smart suggestion banner** (directly below top bar):
- Beige background `#EFE9DA`, 3px left border in sage green `#8FA968`
- Small uppercase label: "SUGGESTED FOR TODAY"
- Dynamic body text highlighting muscle groups missed this week + 2-3 specific exercise suggestions
- "View all" button (sage green background, white text)

**Main content — two-column layout (desktop), stacked (mobile):**

Left column (240px wide, sticky on desktop):
- "Log exercise" card (cream background, soft border)
- Quick mode + Full mode toggle (carried over from v1)
- Exercise name dropdown (populated from exercise_library)
- Type, Date, Sets, Reps, Weight+unit, Focus, Max W/R checkboxes, Notes
- "Log exercise" button (dark warm near-black `#2C2820`, cream text)

Right column (flexible, recent activity):
- "Recent activity" heading + count (e.g., "3 of 24")
- Stack of exercise cards (see card design below)

**Exercise card (in Recent Activity):**
- Cream background, 0.5px soft taupe border
- 4px vertical color bar on left edge (type-colored)
- Row layout: Name + type pill + date pill on left, Sets/Reps/Weight stats on right
- Sub-line showing `primary_muscle · secondary_muscles · date` in muted text
- PR badge inline (gold pill) if is_max_weight or is_max_reps
- Edit + Delete buttons appear on hover/tap

---

## Screen 2 — Progress

**Rescoped April 19, 2026.** The v1 spec called this screen "Analytics" and proposed 4 KPIs + 6 charts (total volume, variety score, muscle group coverage, weight progression, push vs pull, compound vs isolation, PR timeline, training heatmap). After using the app for a couple of weeks, Lisa's actual question turned out to be much narrower:

> "I honestly only want to know how I am tracking for each exercise in terms of progressive increase in weights and reps, and where I am improving and how long it took me to get to higher weight."

Everything on this screen now serves that question. Metrics that looked "dashboardy" but were low-signal for a 55+ muscle-building goal are intentionally omitted — see the "Explicitly dropped" list at the end of this section for the rationale on each. The smart suggestion engine on the Log tab already handles muscle group coverage and push/pull balance at the moment of session planning (where those signals are actionable), so this screen stays focused on the progression signal itself.

**Header:**
- Title "Progress" + subtitle showing period ("Last 8 weeks · N sessions logged")

### Top row — 3 KPI cards

1. **Consistency streak** — e.g. "7 weeks of 2+ sessions." At 55+ this is the hidden lever; frequency matters more than programming nuance. Streak counts trailing weeks with ≥2 sessions; breaks on the first week below target.
2. **This week's wins** — e.g. "3 exercises improved this week." Count of exercises whose best estimated-1RM (see below) this week exceeds their prior personal best for that exercise. Tap to expand the list.
3. **Active progression set** — e.g. "12 exercises tracked." Count of exercises with ≥3 logged sessions (the minimum for meaningful progression tracking). Exercises below this threshold don't appear in progression views.

### Primary view — Per-exercise progression chart

- Dropdown to pick an exercise (only lists exercises with ≥3 sessions)
- Line chart: X-axis = session date, Y-axis = weight
- Each data point = one logged session. Reps rendered as small labels next to the point, or encoded as marker size.
- **Toggle: "Working weight" (default) vs "Estimated 1RM"**
  - Estimated 1RM = Epley formula: `1RM ≈ weight × (1 + reps / 30)`
  - Accurate within ~5% in the 6-15 rep range Lisa trains in
  - This smooths the common pattern `3×10 @ 85lb → 3×8 @ 90lb`, which raw weight alone reads as ambiguous but is genuinely progress in 1RM terms
- PRs (`is_max_weight` or `is_max_reps` rows) rendered as gold dots on the line — visual celebration
- For bodyweight exercises (weight = null, e.g. Plank), the Y-axis flips to reps or seconds; the chart still works, just measures a different progression dimension

### Secondary view — Time-to-progress table

One row per exercise with ≥3 sessions. Sortable.

| Exercise | Current working set | Previous working set | Time to progress | Trend |
|---|---|---|---|---|
| Goblet Squat | 3×10 @ 95 lbs | 3×10 @ 85 lbs | 32 days · 6 sessions | ↑ |
| Bench Press | 3×8 @ 85 lbs | 3×8 @ 80 lbs | 21 days · 5 sessions | ↑ |
| Leg Curl | 3×12 @ 50 lbs | 3×12 @ 50 lbs | plateau 41 days | → |

**Definitions:**
- **Current working set** = most recent non-PR set for that exercise (the "what I'm doing now" combo).
- **Previous working set** = the most recent distinct (weight × reps) combo logged *before* the current combo was first achieved.
- **Time to progress** = calendar days + session count between the first time the previous combo was hit and the first time the current combo was hit.
- **Trend** = ↑ if current combo has higher estimated-1RM than previous, → if equal, ↓ if lower (deload or regression — rare, visible when it matters).

**Sort options:** recently progressed · longest plateau · by muscle group
**Plateau flag:** if no progression detected in 28+ days, the row gets a soft coral left accent — noticeable but not alarming. Plateaus are normal; the flag just surfaces them.

### Weekly pulse (footer card)

Short rolled-up summary at the bottom of the screen:
- "This week: 3 exercises improved" with inline list of names
- "Week before: 2 exercises improved"
- "Consistency: hit 3 sessions this week (target: 2+) ✓"

One-glance emotional reinforcement. If nothing improved this week the card is honest about it ("no new progress this week — muscle adaptation isn't linear, keep going") rather than hiding or spinning. Truth > cheerleading.

### Build order within Step 5 (ship in chunks)

- **5a** — Primary view only: exercise dropdown + progression line chart + 1RM toggle. Ships 80% of the value. This alone probably answers Lisa's question most days.
- **5b** — Time-to-progress table. Second most important view; adds the "how long did it take me" signal.
- **5c** — 3 KPI cards + weekly pulse card. Motivational layer on top of the data views.

### Explicitly dropped from v1 Analytics spec (and why)

- ~~**Total volume (sets × reps × weight summed)**~~ — noisy; bodyweight exercises register as 0; volume can rise without real strength gain (more junk sets). Elite coaches have moved away from it as a primary metric.
- ~~**Variety score**~~ — optimizes for "not being bored," not for progress. If Lisa is progressing on an exercise, variety is a distraction. Suggestion engine handles variety nudges at planning time where they matter.
- ~~**Push vs Pull balance chart**~~ — injury-prevention metric, not a progress signal. Suggestion engine already enforces push/pull mix.
- ~~**Compound vs Isolation ratio**~~ — programming-quality metric; low signal for "am I improving."
- ~~**Training frequency heatmap**~~ — visual candy; "consistency streak" KPI conveys the same information in one line.
- ~~**PR count over last 30 days**~~ — replaced by the more actionable "this week's wins," which uses the richer estimated-1RM signal and updates every session.
- ~~**Muscle group coverage chart**~~ — was "THE key chart" in v1. Omitted here because the suggestion engine already surfaces under-trained muscles at the Log tab, where that info is immediately actionable. Could be reintroduced as a small secondary view if Lisa later wants a standalone visual, but it's not primary to "am I improving."

---

## Screen 3 — History

Standard list view with:
- Search/filter bar (by exercise name, muscle group, type, date range)
- Grouped by date (date heading, then cards below)
- Same exercise card design as Log screen's Recent Activity
- Pagination or infinite scroll after ~50 items

---

## Smart Suggestion Engine — Logic Rules

This is the "what should I do today" brain. It runs whenever Log screen loads.

### Inputs
- Last 14 days of logged sessions (from `exercises` table)
- Current date/time
- Full exercise library with muscle group metadata

### Rules (ordered by priority)

**Rule 1: Recovery enforcement (CRITICAL)**
- For each `primary_muscle`, find the most recent training date
- If trained within **48 hours** → **DO NOT suggest** exercises targeting that muscle
- If trained 48-72 hours ago → **DE-PRIORITIZE** (allow but not top suggestion)
- If trained 72+ hours ago → **FRESH** (eligible for top suggestions)

Rationale (Lisa's note): "sometimes due to work schedule I need to exercise 3 days in a row so not hitting same muscles that I need to recover will be important"

**Core and Peak 8 are exempt** from recovery rules — they can be trained daily.

**Rule 2: Weekly frequency target**
- Target: **2 sessions per major muscle group per week** (research-backed for hypertrophy and strength)
- For each muscle group, count sessions in trailing 7 days
- **Under target (0 or 1):** HIGH priority for suggestion
- **At target (2):** Normal priority
- **Over target (3+):** LOW priority

**Rule 3: 2-week rotation (boredom prevention)**
- Lisa specified: "I should hit all muscle groups in a span of 2 weeks"
- Track last-done date per *exercise* (not just muscle)
- Prefer exercises not done in last 2 sessions (her original spec) or last 2 weeks
- Surface variety within a muscle group

**Rule 4: Compound preference**
- When multiple exercises tie, prefer **compound movements** over isolation
- Compound patterns: Squat, Hinge, Push (horizontal/vertical), Pull (horizontal/vertical)
- Isolation goes last unless user specifically needs isolation for balance

**Rule 5: Push/Pull balance check**
- If week-to-date push count > 1.5× pull count → bias suggestion toward pull
- And vice versa

### Suggestion output format

The banner shows:
1. **Why** — "You haven't trained Back or Chest this week"
2. **What** — 2-3 specific exercises from eligible pool
3. **Action** — "View all" expands to full eligible list, grouped by muscle group

---

## Peak 8 Handling

- Tracked separately from resistance training muscle groups
- Does NOT count toward any muscle group coverage
- Has its own stat: "Peak 8 sessions this week"
- Shown as a separate row in Analytics KPIs or as its own small card
- Library is currently empty — first exercise to add: "Peak 8 Sprints" (Cardio, full body)

---

## Data Schema Summary

### `exercise_library` (68 rows post-migration)
Already has: id, name, type, primary_muscle, secondary_muscles[], equipment, movement_pattern, created_at

### `exercises` (log of actual sessions)
Already has: id, user_id, name, type, date, sets, reps, weight, unit, is_max_weight, is_max_reps, focus, notes, created_at

**No schema changes needed to `exercises` table for v2** — the muscle group for any logged exercise can be joined from `exercise_library` via the `name` field.

**Optional future enhancement:** denormalize `primary_muscle` into the `exercises` row at insert time for faster analytics queries. Not required for v2.

---

## Build order (when ready in new chat)

## Build order

1. ✅ **Theme/palette refactor** — DONE (April 18, 2026). Warm palette tokens live in `tailwind.config.js` and `styles/globals.css`. All 9 files refactored: `App.jsx`, `Auth.jsx`, `ExerciseCard.jsx`, `ExerciseList.jsx`, `ExerciseForm.jsx`, `BulkImport.jsx`, `DataPortability.jsx`. Available tokens: `bg-page`, `bg-cream`, `bg-beige`, `border-taupe`, `text-ink`, `text-ink-muted`, `rounded-card`, `rounded-input`, `text-h1-warm`, `text-h2-warm`, `text-h3-warm`, `text-xs-warm`, `text-sm-warm`, `text-tiny`, `text-micro`. Exercise-type colors as `bg-lower-body` / `bg-lower-body-fill` / `text-lower-body-ink` (and same pattern for `upper-body`, `abs-core`, `peak-8`). Semantic: `bg-pr-fill` / `text-pr-ink`, `bg-warn-fill` / `text-warn-ink`. Deployed to GitHub Pages and confirmed live.
2. ✅ **Exercise card redesign** — DONE (April 18, 2026, commit `1466144`). Compact row layout lives in `components/ExerciseCard.jsx`, which is now the single source of truth consumed by `ExerciseList`. 4px left color bar by type, primary-muscle pill in matching type-fill, muted sub-line `secondaries · date` joined from `exercise_library` via `name`. Unmatched names render neutral gray with no pill and no sub-line (graceful fallback for custom exercises). App.jsx loads the library once and passes it down; `ExerciseList` memoizes a `Map<name, libraryRow>` lookup. Form simplifications shipped in the same step: Quick-entry mode removed, Type field removed from Full form (auto-filled from library pick, with submit-time safety net to derive type from typed names that match the library), Focus field removed entirely. DB migration: existing rows' `type` synced from the library, orphan names renamed to canonical spellings, and `focus` column dropped.
3. ✅ **Tab navigation** — DONE (April 18, 2026, commit `b2c9f7f`). React Router v7 with `HashRouter` (GitHub Pages-friendly — no `404.html` SPA fallback hack needed; URLs look like `#/analytics`). `components/TabNavigation.jsx` renders pill-style `NavLink` tabs (cream active with `shadow-tab`, beige container). Tabs sit inline with the top bar on desktop and sticky below it on mobile. Routes: `/` Log, `/analytics` Analytics, `/history` History. Log tab shows the form + "Recent activity" (top 5 of N, with `N of TOTAL` count badge). Analytics is a skeleton in `components/Analytics.jsx` with 4 KPI card stubs + chart placeholders awaiting step 5. History shows the full `ExerciseList`. Edit from any tab calls `useNavigate('/')` and populates the form.
4. ✅ **Smart suggestion engine** — DONE (April 19, 2026, commit `452c6af`). Pure logic in `lib/suggestions.js` (reusable by step 5 analytics): `normalizePattern` maps 23 raw `movement_pattern` values to 8 canonical buckets (Squat, Hinge, Push horizontal/vertical, Pull horizontal/vertical, Core, Isolation); `computePatternCoverage`, `computeRecoveryState`, `computeMuscleFrequency` are trailing-7-day tallies; `buildSession` produces a session, `attachLastUsed` enriches each pick with most-recent logged stats. Enforces Rules 1-5 from the spec: 48h recovery block / 48-72h deprioritize / 72h+ fresh (Core & Peak 8 exempt from recovery; Peak 8 excluded from suggestions entirely). Slot structure is a hard ratio by TYPE (not a soft bonus): `1 core + ceil((count-1)/2) lower + floor((count-1)/2) upper` — at default count=6 that's 3 lower / 2 upper / 1 core. First lower slot requires Lower Body type AND Squat/Hinge pattern so upper-body Hinge variants (e.g. Hyper Extensions) can't steal it. Fallback fill keeps session length at `count` if recovery blocks specific slots. `components/SuggestedSession.jsx` renders above "Recent activity" with a 4-7 slider, per-row rationale ("Chest under target (1/2)", "Core (safe daily)", etc.), last-used stats ("Last time: 3×10 @ 85 lbs · Apr 15") or "— new exercise —", and a copy icon that pre-fills the form via the existing `onCopy` flow. Palette tweak shipped in the same commit: `ink` text shifted from `#2C2820` (near-black) to `#4A3F32` (warm brown) app-wide; contrast on cream still ~9:1.
5. **Progress screen** (rescoped April 19, 2026 — see "Screen 2 — Progress" above). Ship in 3 chunks: 5a = per-exercise progression chart + exercise dropdown + estimated-1RM toggle (80% of the value), 5b = time-to-progress table, 5c = 3 KPIs + weekly pulse card. Tab label changes from "Analytics" to "Progress" in `TabNavigation.jsx`. Route stays `/analytics` for URL continuity, or renames to `/progress` — decide at 5a.
6. **History screen enhancements** — filtering by muscle group (new capability unlocked by metadata)
7. **Polish** — transitions, empty states, loading states, mobile responsiveness

---

## Open decisions to revisit in new chat

1. **Peak 8 catalog** — currently empty. Add "Peak 8 Sprints" and any variants when Lisa confirms her typical Peak 8 protocol.
2. **Chart library** — RESOLVED (April 19, 2026): stick with inline SVG. The rescoped Progress screen has only one real chart (per-exercise progression line), so Recharts' ~100KB gzipped dep isn't worth it. Hand-rolled SVG keeps bundle size low and gives full control over the warm palette.
3. **Focus field** — currently a free-text field ("Push", "Pull"). Could be promoted to a proper enum if Lisa wants it as a filter dimension.
4. **Dark mode** — not in scope for v2 per the warm beige aesthetic, but could be added later.

---

## How to use this spec in a new Claude chat

Suggested opening message:

> I'm continuing work on my Resistance Training Tracker (React + Supabase app, deployed to GitHub Pages).
>
> Uploading:
> - `DESIGN_SPEC.md` — full v2 design, color palette, smart suggestion logic
> - `02_add_muscle_groups_with_new_exercises.sql` — the migration that's been applied to my Supabase DB
> - A fresh ZIP of my GitHub repo (or the specific files being changed)
>
> Per the spec, ready to build `[specific feature or step from the build order above]`.

That gives the next Claude everything needed to continue without any archaeology.
