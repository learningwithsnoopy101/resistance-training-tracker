# Resistance Training Tracker

A React web app for logging resistance training and getting smart, research-backed session suggestions. Works on desktop and iPhone. Data is stored in Supabase and syncs across devices.

Live: **https://learningwithsnoopy101.github.io/resistance-training-tracker**

## What it does

Three tabs:

- **Log** — form on the left, recent activity on the right. Above the activity list, a "Suggested for today" card proposes a full session (4-7 exercises) tailored to what you've trained this week. Tap any suggestion to pre-fill the form.
- **Analytics** — placeholder scaffold for charts (muscle group coverage, weight progression, push/pull balance, PR timeline). Chart implementation is the next build step.
- **History** — full date-grouped log of every exercise you've recorded.

## Features

- Log exercises with sets, reps, weight, unit, PR flags (Max Weight / Max Reps), and free-text notes
- Pick an exercise from the dropdown (populated from `exercise_library`) to auto-fill the type; or type a custom name
- Copy any exercise from history to pre-fill the form (great for progressive overload)
- Exercise rows show a 4px type-colored left bar, primary-muscle pill, and secondary muscles joined from the library
- Smart suggestion engine (Log tab):
  - Respects 48h recovery per primary muscle (Core is exempt, safe daily)
  - Targets 2 sessions per muscle group per week (Schoenfeld et al. hypertrophy guidance)
  - Balances upper/lower by hard slot budget — at 6 exercises the mix is 3 lower / 2 upper / 1 core
  - Shows last-used stats per exercise (`3×10 @ 85 lbs · Apr 15`) or `— new exercise —`
  - Peak 8 tracked separately and excluded from suggestions
- Edit and delete exercises from any tab
- Tab navigation uses HashRouter (GitHub Pages-friendly — no `404.html` SPA fallback needed)

## Tech stack

- React 18 + Vite
- Tailwind CSS (warm palette — cream / beige / taupe / warm brown ink, muted sage / slate / terracotta type accents)
- React Router v7 (HashRouter)
- Supabase (PostgreSQL + auth, row-level security per user)
- GitHub Pages (hosting)

## Running locally

```bash
npm install
npm run dev
```

Then open **http://localhost:5173/resistance-training-tracker/**

## Deploying to GitHub Pages

```bash
npm run deploy
```

## Supabase setup

If starting from scratch, create a project at [supabase.com](https://supabase.com), then run this in the SQL editor:

```sql
-- Exercise log (one row per logged set group)
create table exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  date date not null,
  sets integer not null,
  reps integer not null,
  weight text,
  unit text default 'lbs',
  is_max_weight boolean default false,
  is_max_reps boolean default false,
  notes text,
  created_at timestamp with time zone default now()
);

alter table exercises enable row level security;

create policy "Users can manage their own exercises"
on exercises for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Exercise catalog (shared, read-only for users)
create table exercise_library (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  type text not null,                  -- Lower Body | Upper Body | Abs | Peak 8
  primary_muscle text,
  secondary_muscles text[],
  equipment text,
  movement_pattern text,               -- Squat, Hinge, Push (horizontal/vertical), Pull (horizontal/vertical), Core, Isolation, etc.
  created_at timestamp with time zone default now()
);

alter table exercise_library enable row level security;

create policy "Anyone authenticated can read exercise library"
on exercise_library for select
to authenticated
using (true);
```

Then populate `exercise_library` with your catalog (this app ships with ~68 exercises spanning the movement patterns above), and update `lib/supabase.js` with your project URL and publishable key.

## Design spec

`DESIGN_SPEC.md` is the authoritative v2 design: color palette, typography, smart suggestion rules, build order, and completed milestones. Open it before starting new work.

## Exercise types

- Lower Body (sage green accent)
- Upper Body (slate blue accent)
- Abs (terracotta accent)
- Peak 8 (gold accent — cardio, tracked separately)
