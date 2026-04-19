// Smart suggestion engine — pure logic, no React.
// Implements Rules 1-5 from DESIGN_SPEC.md "Smart Suggestion Engine" section.
//
// Public API:
//   - normalizePattern(rawPattern)
//   - computePatternCoverage(exercises, today, libraryMap)
//   - computeRecoveryState(exercises, today, libraryMap)
//   - computeMuscleFrequency(exercises, today, libraryMap)
//   - buildSession(exercises, library, today, count)
//   - attachLastUsed(session, exercises)

// ---------- Constants ----------

// 8 canonical movement-pattern buckets. Isolation is the catch-all.
export const PATTERNS = {
  SQUAT: 'Squat',
  HINGE: 'Hinge',
  PUSH_H: 'Push (horizontal)',
  PUSH_V: 'Push (vertical)',
  PULL_H: 'Pull (horizontal)',
  PULL_V: 'Pull (vertical)',
  CORE: 'Core',
  ISOLATION: 'Isolation',
};

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

// Recovery thresholds (hours since last trained).
const RECOVERY_BLOCK_HOURS = 48;   // < 48h = block
const RECOVERY_FRESH_HOURS = 72;   // >= 72h = fresh, 48-72 = deprioritize

// Weekly frequency target per primary_muscle (Schoenfeld et al.).
const WEEKLY_TARGET = 2;

// Rotation window: prefer exercises not done in the last N days.
const ROTATION_WINDOW_DAYS = 14;

// Default session size.
export const DEFAULT_SESSION_COUNT = 6;
export const MIN_SESSION_COUNT = 4;
export const MAX_SESSION_COUNT = 7;

// Core and Peak 8 are exempt from recovery rules.
const RECOVERY_EXEMPT_TYPES = new Set(['Abs', 'Peak 8']);

// Peak 8 is excluded from suggestions entirely (tracked separately).
const EXCLUDED_TYPES = new Set(['Peak 8']);

// ---------- Pattern normalization ----------

/**
 * Map the raw `movement_pattern` string from exercise_library to one of 8
 * canonical buckets. Defensive against spelling variants and unknown values.
 * Unknown / missing → Isolation (safe default).
 */
export function normalizePattern(raw) {
  if (!raw) return PATTERNS.ISOLATION;
  const p = String(raw).trim().toLowerCase();

  if (p === 'squat' || p.startsWith('squat')) return PATTERNS.SQUAT;
  if (p === 'hinge' || p.startsWith('hinge') || p.includes('deadlift')) return PATTERNS.HINGE;

  if (p.includes('push')) {
    if (p.includes('vertical') || p.includes('overhead')) return PATTERNS.PUSH_V;
    // "push (incline)" and "push (horizontal)" both fall here per locked decision.
    return PATTERNS.PUSH_H;
  }

  if (p.includes('pull')) {
    if (p.includes('vertical')) return PATTERNS.PULL_V;
    return PATTERNS.PULL_H;
  }

  if (p === 'core' || p.includes('core') || p.includes('anti-rotation') || p.includes('anti rotation')) {
    return PATTERNS.CORE;
  }

  if (p === 'carry' || p.includes('carry') || p.includes('lunge')) {
    // Carries and lunges are compound lower work — group under Squat as the
    // lower-compound bucket so they count toward the mandatory lower slot.
    return p.includes('carry') ? PATTERNS.SQUAT : PATTERNS.SQUAT;
  }

  return PATTERNS.ISOLATION;
}

// ---------- Date helpers ----------

/**
 * Parse a date-only string ("YYYY-MM-DD") or Date into a Date at midnight local time.
 * Returns null on invalid input.
 */
function parseDay(d) {
  if (!d) return null;
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [y, m, day] = String(d).split('-').map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

function hoursBetween(aDay, bDay) {
  return Math.abs(bDay.getTime() - aDay.getTime()) / MS_PER_HOUR;
}

function daysBetween(aDay, bDay) {
  return Math.round(Math.abs(bDay.getTime() - aDay.getTime()) / MS_PER_DAY);
}

// ---------- Coverage / recovery / frequency ----------

/**
 * Count how many sessions in the trailing 7 days hit each canonical pattern.
 * Returns a Map<canonicalPattern, count>.
 *
 * @param exercises — rows from the `exercises` table in app format (has .name, .date)
 * @param today — Date or "YYYY-MM-DD" reference day
 * @param libraryMap — Map<exerciseName, libraryRow>
 */
export function computePatternCoverage(exercises, today, libraryMap) {
  const reference = parseDay(today) ?? new Date();
  const counts = new Map();
  for (const key of Object.values(PATTERNS)) counts.set(key, 0);

  for (const ex of exercises) {
    const exDay = parseDay(ex.date);
    if (!exDay) continue;
    if (daysBetween(exDay, reference) > 7) continue;

    const libRow = libraryMap.get(ex.name);
    if (!libRow) continue;
    if (EXCLUDED_TYPES.has(libRow.type)) continue;

    const bucket = normalizePattern(libRow.movement_pattern);
    counts.set(bucket, (counts.get(bucket) || 0) + 1);
  }

  return counts;
}

/**
 * For each primary_muscle, the hours since it was last trained (based on the
 * most recent session date at midnight). Core muscles are intentionally included
 * for visibility, but consumers should treat them as always fresh.
 *
 * Returns Map<primary_muscle, { hoursSince, lastDate }>
 */
export function computeRecoveryState(exercises, today, libraryMap) {
  const reference = parseDay(today) ?? new Date();
  const state = new Map();

  for (const ex of exercises) {
    const exDay = parseDay(ex.date);
    if (!exDay) continue;

    const libRow = libraryMap.get(ex.name);
    if (!libRow || !libRow.primary_muscle) continue;
    if (EXCLUDED_TYPES.has(libRow.type)) continue;

    const muscle = libRow.primary_muscle;
    const hours = hoursBetween(exDay, reference);
    const existing = state.get(muscle);
    if (!existing || hours < existing.hoursSince) {
      state.set(muscle, { hoursSince: hours, lastDate: ex.date });
    }
  }

  return state;
}

/**
 * Sessions-per-muscle in the trailing 7 days.
 * Returns Map<primary_muscle, count>.
 */
export function computeMuscleFrequency(exercises, today, libraryMap) {
  const reference = parseDay(today) ?? new Date();
  const counts = new Map();

  for (const ex of exercises) {
    const exDay = parseDay(ex.date);
    if (!exDay) continue;
    if (daysBetween(exDay, reference) > 7) continue;

    const libRow = libraryMap.get(ex.name);
    if (!libRow || !libRow.primary_muscle) continue;
    if (EXCLUDED_TYPES.has(libRow.type)) continue;

    counts.set(libRow.primary_muscle, (counts.get(libRow.primary_muscle) || 0) + 1);
  }

  return counts;
}

/**
 * Returns the most recent date (YYYY-MM-DD) any variant of this exercise name
 * was logged, or null.
 */
function lastDoneDate(exerciseName, exercises) {
  let latest = null;
  for (const ex of exercises) {
    if (ex.name !== exerciseName) continue;
    if (!latest || ex.date > latest) latest = ex.date;
  }
  return latest;
}

// ---------- Recovery classification ----------

function recoveryStatus(libRow, recoveryState, reference) {
  if (RECOVERY_EXEMPT_TYPES.has(libRow.type)) return 'fresh';
  const entry = recoveryState.get(libRow.primary_muscle);
  if (!entry) return 'fresh';
  if (entry.hoursSince < RECOVERY_BLOCK_HOURS) return 'blocked';
  if (entry.hoursSince < RECOVERY_FRESH_HOURS) return 'deprioritize';
  return 'fresh';
}

// ---------- Gap scoring ----------

/**
 * Higher score = more desirable. Factors:
 *  + under weekly frequency target for the primary muscle
 *  + not done recently (rotation window)
 *  + recovery fresh (vs deprioritize)
 *  + push/pull balance nudge
 *
 * Returns a number; -Infinity if the exercise is blocked by recovery.
 */
function gapScore(libRow, ctx) {
  const { muscleFreq, patternCoverage, recoveryState, today, exercises } = ctx;

  const status = recoveryStatus(libRow, recoveryState, today);
  if (status === 'blocked') return -Infinity;

  let score = 0;

  // (a) weekly frequency — under target = high bonus
  const freq = muscleFreq.get(libRow.primary_muscle) || 0;
  if (freq === 0) score += 40;
  else if (freq < WEEKLY_TARGET) score += 20;
  else if (freq === WEEKLY_TARGET) score += 0;
  else score -= 15; // over target

  // (b) rotation: penalize if done in last 2 weeks
  const last = lastDoneDate(libRow.name, exercises);
  if (last) {
    const lastDay = parseDay(last);
    const refDay = parseDay(today) ?? new Date();
    const daysAgo = daysBetween(lastDay, refDay);
    if (daysAgo < 3) score -= 15;
    else if (daysAgo < ROTATION_WINDOW_DAYS) score -= 5;
    else score += 5;
  } else {
    // never done — mild boost for variety
    score += 3;
  }

  // (c) recovery: deprioritize tier is a soft penalty
  if (status === 'deprioritize') score -= 10;

  // (d) pattern coverage: under-covered pattern gets a bump
  const bucket = normalizePattern(libRow.movement_pattern);
  const patternHits = patternCoverage.get(bucket) || 0;
  if (patternHits === 0) score += 15;
  else if (patternHits === 1) score += 5;

  // (e) push/pull balance nudge
  const pushHits =
    (patternCoverage.get(PATTERNS.PUSH_H) || 0) +
    (patternCoverage.get(PATTERNS.PUSH_V) || 0);
  const pullHits =
    (patternCoverage.get(PATTERNS.PULL_H) || 0) +
    (patternCoverage.get(PATTERNS.PULL_V) || 0);
  if (bucket === PATTERNS.PULL_H || bucket === PATTERNS.PULL_V) {
    if (pushHits > pullHits * 1.5) score += 8;
  }
  if (bucket === PATTERNS.PUSH_H || bucket === PATTERNS.PUSH_V) {
    if (pullHits > pushHits * 1.5) score += 8;
  }

  return score;
}

// ---------- Session building ----------

/**
 * Build a suggested session of `count` exercises.
 *
 * Slot budget (hard ratio, not a soft bonus):
 *   - 1 core slot (Abs / Core pattern)
 *   - lowerBudget = ceil((count - 1) / 2)  — Lower Body TYPE required
 *   - upperBudget = floor((count - 1) / 2) — Upper Body TYPE required
 *   Example: count=6 → 3 lower / 2 upper / 1 core.
 *
 * Fill order:
 *   1. Lower compound (Lower Body type + Squat/Hinge pattern) — guarantees a
 *      true lower-body compound, not an upper-body Hinge variant like Hyper Ext.
 *   2. Push (Upper Body type + Push horizontal/vertical)
 *   3. Pull (Upper Body type + Pull horizontal/vertical) — skipped if upperBudget < 2
 *   4. Core
 *   5. Remaining lower slots (any Lower Body type, by score)
 *   6. Remaining upper slots (any Upper Body type, by score)
 *   7. Fallback fill: if recovery blocked some slots, fill any remaining count
 *      from whatever is still eligible (any type), so we don't return a
 *      short session when the user asked for N.
 *
 * Each pick uses gapScore (which already respects the 48h recovery block).
 * Returns an array of { exercise, pattern, role, rationale }.
 */
export function buildSession(exercises, library, today, count = DEFAULT_SESSION_COUNT) {
  const safeCount = Math.max(MIN_SESSION_COUNT, Math.min(MAX_SESSION_COUNT, count || DEFAULT_SESSION_COUNT));

  // Slot budget
  const nonCore = safeCount - 1;
  const lowerBudget = Math.ceil(nonCore / 2);
  const upperBudget = nonCore - lowerBudget;

  // Index library.
  const libraryMap = new Map(library.map(l => [l.name, l]));
  const eligible = library.filter(l => !EXCLUDED_TYPES.has(l.type));

  // Context for scoring.
  const ctx = {
    muscleFreq: computeMuscleFrequency(exercises, today, libraryMap),
    patternCoverage: computePatternCoverage(exercises, today, libraryMap),
    recoveryState: computeRecoveryState(exercises, today, libraryMap),
    today,
    exercises,
  };

  // Pre-score everything once.
  const scored = new Map();
  for (const l of eligible) scored.set(l, gapScore(l, ctx));

  const used = new Set();
  const session = [];

  function pickBest(predicate, role, rationaleBuilder) {
    const pool = [];
    for (const l of eligible) {
      if (used.has(l.name)) continue;
      if (!predicate(l)) continue;
      const s = scored.get(l);
      if (s === -Infinity) continue;
      pool.push({ lib: l, score: s, pattern: normalizePattern(l.movement_pattern) });
    }
    if (pool.length === 0) return null;
    pool.sort((a, b) => b.score - a.score);
    const top = pool[0];
    used.add(top.lib.name);
    session.push({
      exercise: top.lib,
      pattern: top.pattern,
      role,
      rationale: rationaleBuilder(top),
    });
    return top;
  }

  const isLowerCompound = (l) => {
    if (l.type !== 'Lower Body') return false;
    const p = normalizePattern(l.movement_pattern);
    return p === PATTERNS.SQUAT || p === PATTERNS.HINGE;
  };
  const isLower = (l) => l.type === 'Lower Body';
  const isPush = (l) => {
    if (l.type !== 'Upper Body') return false;
    const p = normalizePattern(l.movement_pattern);
    return p === PATTERNS.PUSH_H || p === PATTERNS.PUSH_V;
  };
  const isPull = (l) => {
    if (l.type !== 'Upper Body') return false;
    const p = normalizePattern(l.movement_pattern);
    return p === PATTERNS.PULL_H || p === PATTERNS.PULL_V;
  };
  const isUpper = (l) => l.type === 'Upper Body';
  const isCore = (l) => l.type === 'Abs' || normalizePattern(l.movement_pattern) === PATTERNS.CORE;

  const countLower = () => session.filter(s => s.exercise.type === 'Lower Body').length;
  const countUpper = () => session.filter(s => s.exercise.type === 'Upper Body').length;

  // 1. Lower compound (first lower slot) — Squat/Hinge + Lower Body type.
  if (lowerBudget >= 1) {
    const got = pickBest(
      isLowerCompound,
      'lower-compound',
      (t) => underCoveredRationale(t, ctx) || 'Lower-body compound',
    );
    // Fallback: if no Squat/Hinge lower is eligible (all blocked/none exists),
    // take any Lower Body exercise so the lower budget doesn't go unfilled here.
    if (!got) {
      pickBest(
        isLower,
        'lower',
        (t) => underCoveredRationale(t, ctx) || `${t.lib.primary_muscle} — lower`,
      );
    }
  }

  // 2. Push
  if (upperBudget >= 1) {
    pickBest(
      isPush,
      'push',
      (t) => underCoveredRationale(t, ctx) || 'Push movement',
    );
  }

  // 3. Pull
  if (upperBudget >= 2) {
    pickBest(
      isPull,
      'pull',
      (t) => underCoveredRationale(t, ctx) || 'Pull movement',
    );
  }

  // 4. Core
  pickBest(isCore, 'core', () => 'Core (safe daily)');

  // 5. Remaining lower slots
  while (countLower() < lowerBudget) {
    const got = pickBest(
      isLower,
      'lower',
      (t) => underCoveredRationale(t, ctx) || `${t.lib.primary_muscle} — gap fill`,
    );
    if (!got) break; // no more eligible lower (recovery blocks)
  }

  // 6. Remaining upper slots
  while (countUpper() < upperBudget) {
    const got = pickBest(
      isUpper,
      'upper',
      (t) => underCoveredRationale(t, ctx) || `${t.lib.primary_muscle} — gap fill`,
    );
    if (!got) break;
  }

  // 7. Fallback fill: if recovery blocked some slots and session is short,
  //    top up with anything eligible so we return `safeCount` items.
  while (session.length < safeCount) {
    const got = pickBest(
      () => true,
      'flex',
      (t) => underCoveredRationale(t, ctx) || `${t.lib.primary_muscle} — gap fill`,
    );
    if (!got) break;
  }

  return session;
}

function underCoveredRationale(pick, ctx) {
  const muscle = pick.lib.primary_muscle;
  const freq = ctx.muscleFreq.get(muscle) || 0;
  if (freq === 0) return `${muscle} not trained this week`;
  if (freq < WEEKLY_TARGET) return `${muscle} under target (${freq}/${WEEKLY_TARGET})`;
  return null;
}

// ---------- Last-used enrichment ----------

/**
 * For each suggested exercise, find its most recent log entry and attach
 * `lastUsed = { sets, reps, weight, unit, date }` or `null` if never done.
 * Returns a new array — does not mutate the session.
 */
export function attachLastUsed(session, exercises) {
  // Build an index: name → most recent log row
  const latestByName = new Map();
  for (const ex of exercises) {
    const existing = latestByName.get(ex.name);
    if (!existing || ex.date > existing.date) latestByName.set(ex.name, ex);
  }

  return session.map(item => {
    const last = latestByName.get(item.exercise.name);
    if (!last) return { ...item, lastUsed: null };
    return {
      ...item,
      lastUsed: {
        sets: last.sets,
        reps: last.reps,
        weight: last.weight,
        unit: last.unit,
        date: last.date,
      },
    };
  });
}
