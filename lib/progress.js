// Pure progression helpers — no React, no Supabase.
// Used by the Progress screen (Analytics.jsx + ProgressChart.jsx).

export const MIN_SESSIONS = 3;

// Estimated 1RM (Epley) — accurate within ~5% in the 6-15 rep range
export function epley(weight, reps) {
  return weight * (1 + reps / 30);
}

// DB stores weight as text; app state may hold '' for bodyweight
export function parseWeight(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

// Map of exercise name → sessions sorted oldest → newest
export function groupSessionsByExercise(exercises) {
  const map = new Map();
  for (const ex of exercises) {
    if (!map.has(ex.name)) map.set(ex.name, []);
    map.get(ex.name).push(ex);
  }
  for (const sessions of map.values()) {
    sessions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }
  return map;
}

// Exercise names with enough sessions to chart, most recently trained first
export function trackedExercises(sessionsByName, min = MIN_SESSIONS) {
  return [...sessionsByName.entries()]
    .filter(([, sessions]) => sessions.length >= min)
    .sort((a, b) => {
      const lastA = a[1][a[1].length - 1].date;
      const lastB = b[1][b[1].length - 1].date;
      return lastA < lastB ? 1 : lastA > lastB ? -1 : 0;
    })
    .map(([name]) => name);
}

// True when an exercise has no logged weight at all (e.g. Plank) —
// the chart then measures reps instead of weight
export function isBodyweight(sessions) {
  return sessions.every(s => parseWeight(s.weight) === null);
}

// Chart-ready points for one exercise. mode: 'weight' | 'e1rm' (ignored for bodyweight)
export function buildChartPoints(sessions, mode) {
  const bodyweight = isBodyweight(sessions);
  return sessions
    .map(s => {
      let value;
      if (bodyweight) {
        value = s.reps;
      } else {
        const w = parseWeight(s.weight);
        if (w === null) return null; // stray bodyweight row of a weighted exercise
        value = mode === 'e1rm' ? epley(w, s.reps) : w;
      }
      if (value === null || value === undefined) return null;
      return {
        date: s.date,
        value,
        reps: s.reps,
        sets: s.sets,
        isPr: !!(s.isMaxWeight || s.isMaxReps),
        unit: bodyweight ? 'reps' : (s.unit || 'lbs'),
      };
    })
    .filter(Boolean);
}

// Count of sessions logged within the trailing `days` window
export function sessionsInTrailingDays(exercises, days, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return exercises.filter(ex => ex.date >= cutoffStr).length;
}

export const PLATEAU_DAYS = 28;

export function daysBetween(a, b) {
  return Math.round(
    (new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000
  );
}

// A "combo" identifies a working set: weight × reps (reps only for bodyweight)
function comboKey(s, bodyweight) {
  return bodyweight ? `${s.reps}` : `${parseWeight(s.weight)}|${s.reps}`;
}

function comboScore(s, bodyweight) {
  if (bodyweight) return s.reps;
  const w = parseWeight(s.weight);
  return w === null ? 0 : epley(w, s.reps);
}

// One row per exercise with ≥3 sessions, for the time-to-progress table.
// Definitions per DESIGN_SPEC Screen 2:
// - current working set = combo of the most recent non-PR session (PR rows are
//   one-off max attempts, excluded from the working-set timeline)
// - previous working set = the distinct combo immediately before the current
//   combo's contiguous run
// - time to progress = days + sessions between first hit of previous combo run
//   and first hit of current combo
// - trend = estimated-1RM comparison (reps comparison for bodyweight)
// - plateau = current combo unchanged for PLATEAU_DAYS+
export function computeProgressRows(sessionsByName, library = [], now = new Date()) {
  const muscleByName = new Map(library.map(r => [r.name, r.primary_muscle]));
  const today = now.toISOString().slice(0, 10);
  const rows = [];

  for (const [name, sessions] of sessionsByName.entries()) {
    if (sessions.length < MIN_SESSIONS) continue;
    const bw = isBodyweight(sessions);

    // Working-set timeline = non-PR sessions (fallback: all, if nearly all are PRs)
    let seq = sessions.filter(s => !(s.isMaxWeight || s.isMaxReps));
    if (seq.length < 2) seq = sessions;

    const cur = seq[seq.length - 1];
    const curKey = comboKey(cur, bw);

    // Last index with a different combo → start of the current combo's run
    let lastDiff = -1;
    for (let i = seq.length - 1; i >= 0; i--) {
      if (comboKey(seq[i], bw) !== curKey) { lastDiff = i; break; }
    }
    const curFirstIdx = lastDiff + 1;
    const curFirstDate = seq[curFirstIdx].date;
    const plateauDays = daysBetween(curFirstDate, today);

    let previous = null;
    let daysToProgress = null;
    let sessionsToProgress = null;
    let trend = '→';

    if (lastDiff >= 0) {
      previous = seq[lastDiff];
      const prevKey = comboKey(previous, bw);
      // Walk back to the first session of the previous combo's contiguous run
      let prevFirstIdx = lastDiff;
      while (prevFirstIdx > 0 && comboKey(seq[prevFirstIdx - 1], bw) === prevKey) {
        prevFirstIdx--;
      }
      daysToProgress = daysBetween(seq[prevFirstIdx].date, curFirstDate);
      sessionsToProgress = curFirstIdx - prevFirstIdx;

      const diff = comboScore(cur, bw) - comboScore(previous, bw);
      trend = diff > 0.01 ? '↑' : diff < -0.01 ? '↓' : '→';
    }

    rows.push({
      name,
      muscle: muscleByName.get(name) || null,
      bodyweight: bw,
      current: cur,
      previous,
      curFirstDate,
      daysToProgress,
      sessionsToProgress,
      trend,
      plateauDays,
      plateau: plateauDays >= PLATEAU_DAYS,
    });
  }
  return rows;
}

export const WEEKLY_TARGET = 2;

// Monday-start week key for a YYYY-MM-DD date string
export function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Distinct training days per week (a "session" = a day with ≥1 log, not a row)
export function trainingDaysByWeek(exercises) {
  const byWeek = new Map();
  for (const ex of exercises) {
    const wk = weekStart(ex.date);
    if (!byWeek.has(wk)) byWeek.set(wk, new Set());
    byWeek.get(wk).add(ex.date);
  }
  return byWeek;
}

// Trailing weeks with ≥ target sessions. The in-progress current week counts
// toward the streak if already at target, but doesn't break it if below.
export function consistencyStreak(exercises, now = new Date(), target = WEEKLY_TARGET) {
  const byWeek = trainingDaysByWeek(exercises);
  const count = wk => (byWeek.get(wk) || new Set()).size;
  const currentWeek = weekStart(now.toISOString().slice(0, 10));

  let streak = count(currentWeek) >= target ? 1 : 0;
  let wk = shiftDate(currentWeek, -7);
  while (count(wk) >= target) {
    streak++;
    wk = shiftDate(wk, -7);
  }
  return streak;
}

// Exercises whose best estimated-1RM (reps for bodyweight) in the given week
// beats their prior all-time best. Needs a pre-week baseline to count.
export function winsForWeek(sessionsByName, weekStartStr) {
  const weekEnd = shiftDate(weekStartStr, 7);
  const wins = [];
  for (const [name, sessions] of sessionsByName.entries()) {
    const bw = isBodyweight(sessions);
    const inWeek = sessions.filter(s => s.date >= weekStartStr && s.date < weekEnd);
    const before = sessions.filter(s => s.date < weekStartStr);
    if (!inWeek.length || !before.length) continue;
    const best = Math.max(...inWeek.map(s => comboScore(s, bw)));
    const prior = Math.max(...before.map(s => comboScore(s, bw)));
    if (best > prior + 0.01) wins.push(name);
  }
  return wins;
}

// sort: 'recent' (recently progressed) | 'plateau' (longest plateau) | 'muscle'
export function sortProgressRows(rows, sort) {
  const copy = [...rows];
  if (sort === 'plateau') {
    copy.sort((a, b) => b.plateauDays - a.plateauDays);
  } else if (sort === 'muscle') {
    copy.sort(
      (a, b) =>
        (a.muscle || 'zz').localeCompare(b.muscle || 'zz') ||
        a.name.localeCompare(b.name)
    );
  } else {
    // recently progressed: rows that actually progressed first, newest progression first
    copy.sort((a, b) => {
      const aProg = a.previous && a.trend === '↑' ? 1 : 0;
      const bProg = b.previous && b.trend === '↑' ? 1 : 0;
      if (aProg !== bProg) return bProg - aProg;
      return a.curFirstDate < b.curFirstDate ? 1 : a.curFirstDate > b.curFirstDate ? -1 : 0;
    });
  }
  return copy;
}
