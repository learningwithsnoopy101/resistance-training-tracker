# Resistance Training Tracker

A lightweight React app for logging and tracking resistance training exercises. Works on desktop and mobile browsers. Data is saved locally in your browser — no account or backend required.

## Features

- Log exercises with type, sets, reps, weight, focus, and notes
- Quick single-line entry for fast logging (great on mobile)
- Bulk import from a comma-separated notepad list
- Exercise log grouped by date with compact row layout
- Track personal records (Max Weight, Max Reps)
- Edit and delete exercises
- Data persists across browser sessions via localStorage

## Running Locally

```bash
npm install
npm run dev
```

Then open: **http://localhost:5173/resistance-training-tracker/**

## Quick Entry Format

In the **Quick** entry mode, type one line per exercise:

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

## Bulk Import Format

Click **Bulk Import from Notepad** to paste multiple exercises at once:

```
Type, Name, Date, SetsxReps, Weight, Focus, Max flag
Lower Body, Dumbbell Lunges, 4/10, 3x10, 40lbs, Push, max weight
Lower Body, Step Ups, 4/10, 3x10, 27.5lbs, Pull, max reps
Lower Body, Calf Raises, 4/10, 3x12, 110lbs
```

- Date format: `M/DD` (e.g. `4/10`) — year defaults to 2026
- Header row is automatically skipped

## Exercise Types

- Upper Body
- Lower Body
- Abs
- Peak 8

## Deploying to GitHub Pages

```bash
npm run deploy
```

Live at: **https://learningwithsnoopy101.github.io/resistance-training-tracker**

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- localStorage (no backend)
