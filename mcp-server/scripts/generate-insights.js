// Weekly insights generator (Phase 4, Option A).
// Reads the last 7 days of exercises, generates a digest + muscle insight via
// llm.complete() (through tools/insights.js), and writes both to the
// `insights` cache table that the app reads via RLS.
//
// Run by GitHub Actions (.github/workflows/insights.yml) every Sunday evening,
// or manually: node --env-file=.env scripts/generate-insights.js
//
// Required env: SUPABASE_URL, SUPABASE_KEY (service-role), ANTHROPIC_API_KEY,
// and INSIGHTS_USER_ID (or ADMIN_USER_ID) — whose data to summarize.

import { supabase } from '../lib/supabase.js';
import { generate_weekly_digest, generate_muscle_insight } from '../tools/insights.js';

const USER_ID = process.env.INSIGHTS_USER_ID || process.env.ADMIN_USER_ID;
if (!USER_ID) {
  console.error('Missing INSIGHTS_USER_ID (or ADMIN_USER_ID) env var.');
  process.exit(1);
}

const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

// 1. Last 7 days of logged exercises (service-role bypasses RLS — scope by user_id)
const { data: exercises, error: exErr } = await supabase
  .from('exercises')
  .select('name, type, date, sets, reps, weight, unit, is_max_weight, is_max_reps')
  .eq('user_id', USER_ID)
  .gte('date', since)
  .order('date');
if (exErr) {
  console.error('Failed to fetch exercises:', exErr.message);
  process.exit(1);
}

// 2. Library for muscle mapping
const { data: library, error: libErr } = await supabase
  .from('exercise_library')
  .select('name, type, primary_muscle');
if (libErr) {
  console.error('Failed to fetch exercise library:', libErr.message);
  process.exit(1);
}

// 3. Coverage: trailing-7-day session count per primary muscle (Peak 8 excluded)
const muscleByName = new Map(
  library.filter(r => r.type !== 'Peak 8').map(r => [r.name, r.primary_muscle])
);
const counts = new Map();
for (const ex of exercises) {
  const muscle = muscleByName.get(ex.name);
  if (!muscle) continue;
  counts.set(muscle, (counts.get(muscle) || 0) + 1);
}
const allMuscles = [...new Set([...muscleByName.values()].filter(Boolean))].sort();
const coverage = allMuscles.map(muscle => ({
  muscle,
  sessions_last_7_days: counts.get(muscle) || 0,
  weekly_target: 2,
}));

// 4. Generate both insights (tools return { data, error } and never throw)
const digest = await generate_weekly_digest({ exercises });
const insight = await generate_muscle_insight({ coverage });

// 5. Write whatever succeeded; fail the run if anything errored
const rows = [];
if (digest.error) console.error('digest failed:', digest.error);
else rows.push({ user_id: USER_ID, kind: 'digest', content: digest.data });
if (insight.error) console.error('muscle insight failed:', insight.error);
else rows.push({ user_id: USER_ID, kind: 'muscle_insight', content: insight.data });

if (rows.length > 0) {
  const { error: insErr } = await supabase.from('insights').insert(rows);
  if (insErr) {
    console.error('Failed to write insights:', insErr.message);
    process.exit(1);
  }
  console.log(
    `Wrote ${rows.length} insight row(s) for ${exercises.length} session(s) since ${since}.`
  );
}

if (digest.error || insight.error) process.exit(1);
