# Resistance Training Tracker

A React web app for logging and tracking resistance training exercises. Works on desktop and iPhone. Data is stored in the cloud via Supabase — syncs automatically across all your devices.

## Features

- Log exercises with type, sets, reps, weight, focus, and notes
- Quick single-line entry for fast logging (great on mobile)
- Predefined exercise dropdown with auto-fill type
- Copy any exercise from history to pre-fill the entry form (great for progressive overload)
- Exercise log grouped by date with compact row layout
- Track personal records (Max Weight, Max Reps)
- Edit and delete exercises
- Cloud storage via Supabase — syncs across all devices automatically
- Secure login — your data is private to your account

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase (PostgreSQL database + authentication)
- GitHub Pages (hosting)

## Running Locally

```bash
npm install
npm run dev
```

Then open: **http://localhost:5173/resistance-training-tracker/**

## Deploying to GitHub Pages

```bash
npm run deploy
```

Live at: **https://learningwithsnoopy101.github.io/resistance-training-tracker**

## Supabase Setup

If setting up from scratch:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the following SQL in the Supabase SQL Editor:

```sql
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
  focus text,
  notes text,
  created_at timestamp with time zone default now()
);

alter table exercises enable row level security;

create policy "Users can manage their own exercises"
on exercises for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

3. Update `lib/supabase.js` with your project URL and publishable key

## Quick Entry Format

In **Quick** mode, type one line per exercise:

```
Type, Name, SetsxReps, Weight, Focus, Max flag
```

Examples:
```
Lower Body, Squats, 3x10, 135lbs, Push, max weight
Upper Body, Bench Press, 4x8, 185lbs, Push
Abs, Plank, 3x60
```

- **Weight**, **Focus**, and **Max flag** are optional
- **Date** defaults to today — change it with the date picker if logging a past session
- Max flag options: `max weight`, `max reps`

## Exercise Types

- Upper Body
- Lower Body
- Abs
- Peak 8
