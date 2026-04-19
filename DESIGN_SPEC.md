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
2. **Analytics** — all progress charts and coverage views
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

## Screen 2 — Analytics

**Header:**
- Title "Analytics" + subtitle showing period ("Last 8 weeks · 24 sessions logged")

**Top row — KPI cards (4 across on desktop, 2x2 on mobile):**
1. **Total volume** — sum of (sets × reps × weight) over last 8 weeks, with % change vs prior period
2. **Sessions per week** — average, with "on target" status
3. **Personal records** — count of new PRs in last 30 days
4. **Variety score** — 0-100, measuring exercise diversity (detail below)

**Main content — grid of charts:**

### Chart 1: Weight progression
- Line chart, one exercise at a time with dropdown selector
- X-axis = weeks, Y-axis = weight
- Sage green line, cream background card
- Shows last 8-12 weeks by default

### Chart 2: Muscle group coverage (THE KEY CHART)
- Horizontal progress bars, one per primary muscle group
- Each bar shows: muscle name (left), `X/2` (right showing "sessions this week / target")
- Bar color = exercise type color if target met (2/2), soft coral `#D4A296` if below target (0/2 or 1/2)
- Lisa's research-backed target: **2x per week per major muscle group** (Schoenfeld et al.)
- This chart is where variety and completeness live together

### Chart 3: Push vs Pull balance
- Simple horizontal stacked bar: Push count vs Pull count this week
- Target: 1:1 ratio (Lisa's catalog now supports this well)
- Warning if drifts to 2:1 or worse

### Chart 4: Compound vs Isolation ratio
- Target: ~60% compound / 40% isolation for strength + body recomposition goals
- Simple donut or horizontal bar

### Chart 5: PR timeline
- Timeline chart showing each personal record as a dot
- Hover shows exercise name + weight/reps achieved

### Chart 6: Training frequency heatmap
- Calendar heatmap showing training density per day over last 8-12 weeks
- Helps Lisa spot patterns in consistency

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

## Variety Score (for KPI card)

**Definition:** 0-100 score measuring how diverse the training has been in the last 8 weeks.

**Formula (simple version):**
```
unique_exercises_trained / total_exercises_trained × scale_factor
```

Where `scale_factor` rewards hitting 2+ sessions per muscle group while penalizing over-repetition of the same exercise.

**Thresholds:**
- 0-40: Low variety (repeating too much)
- 40-70: Moderate
- 70-100: Strong variety

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
2. **Exercise card redesign** — compact row layout with 4px colored left border, muscle tags (primary_muscle, secondary_muscles from exercise_library joined via name)
3. **Tab navigation** — add Log/Analytics/History tabs to top bar
4. **Smart suggestion banner component** — reads from `exercises` + `exercise_library`, implements Rules 1-5 above
5. **Analytics screen** — KPI cards + muscle group coverage chart first, other charts second
6. **History screen enhancements** — filtering by muscle group (new capability unlocked by metadata)
7. **Polish** — transitions, empty states, loading states, mobile responsiveness

---

## Open decisions to revisit in new chat

1. **Peak 8 catalog** — currently empty. Add "Peak 8 Sprints" and any variants when Lisa confirms her typical Peak 8 protocol.
2. **Chart library** — stick with inline SVG (simple) or add Recharts (richer)? Recommend inline SVG for KPI sparklines and lightweight charts, Recharts for the Analytics screen.
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
