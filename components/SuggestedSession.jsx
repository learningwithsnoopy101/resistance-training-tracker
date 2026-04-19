import React, { useMemo, useState } from 'react';
import {
  buildSession,
  attachLastUsed,
  computeMuscleFrequency,
  computePatternCoverage,
  PATTERNS,
  DEFAULT_SESSION_COUNT,
  MIN_SESSION_COUNT,
  MAX_SESSION_COUNT,
} from '@/lib/suggestions';

// Map exercise type → left-bar color class (same convention as ExerciseCard).
const TYPE_BAR = {
  'Lower Body': 'bg-lower-body',
  'Upper Body': 'bg-upper-body',
  'Abs': 'bg-abs-core',
  'Peak 8': 'bg-peak-8',
};

const TYPE_PILL = {
  'Lower Body': 'bg-lower-body-fill text-lower-body-ink',
  'Upper Body': 'bg-upper-body-fill text-upper-body-ink',
  'Abs': 'bg-abs-core-fill text-abs-core-ink',
  'Peak 8': 'bg-peak-8-fill text-peak-8-ink',
};

function formatShortDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLastUsed(last) {
  if (!last) return '— new exercise —';
  const weightPart = last.weight ? ` @ ${last.weight} ${last.unit || 'lbs'}` : '';
  return `Last time: ${last.sets}×${last.reps}${weightPart} · ${formatShortDate(last.date)}`;
}

/**
 * Top-level rationale summarizing WHY today's suggestion looks the way it does.
 * e.g. "Back and chest under-covered this week" or "Balanced week — building variety".
 */
function buildHeadline(exercises, library, today) {
  const libMap = new Map(library.map(l => [l.name, l]));
  const freq = computeMuscleFrequency(exercises, today, libMap);
  const coverage = computePatternCoverage(exercises, today, libMap);

  // Find primary muscles that are under-trained this week.
  const underCovered = [];
  const relevantMuscles = new Set(
    library
      .filter(l => l.type !== 'Peak 8' && l.primary_muscle)
      .map(l => l.primary_muscle)
  );
  for (const muscle of relevantMuscles) {
    if ((freq.get(muscle) || 0) === 0) underCovered.push(muscle);
  }

  if (underCovered.length === 0) {
    return 'Solid coverage this week — here are fresh picks to keep variety high.';
  }

  // Keep it human — list up to 2 muscles.
  const pick = underCovered.slice(0, 2).map(m => m.toLowerCase()).join(' and ');
  const suffix = underCovered.length > 2 ? ` (+${underCovered.length - 2} more)` : '';
  return `${pick}${suffix} under-covered this week.`;
}

export default function SuggestedSession({ exercises, exerciseLibrary, onPick }) {
  const [count, setCount] = useState(DEFAULT_SESSION_COUNT);
  const today = new Date().toISOString().slice(0, 10);

  const session = useMemo(() => {
    if (!exerciseLibrary || exerciseLibrary.length === 0) return [];
    const base = buildSession(exercises, exerciseLibrary, today, count);
    return attachLastUsed(base, exercises);
  }, [exercises, exerciseLibrary, today, count]);

  const headline = useMemo(
    () => buildHeadline(exercises, exerciseLibrary || [], today),
    [exercises, exerciseLibrary, today]
  );

  if (!exerciseLibrary || exerciseLibrary.length === 0) return null;

  const handlePick = (item) => {
    const last = item.lastUsed;
    onPick({
      name: item.exercise.name,
      type: item.exercise.type,
      sets: last?.sets ?? 3,
      reps: last?.reps ?? 10,
      weight: last?.weight ?? '',
      unit: last?.unit ?? 'lbs',
      isMaxWeight: false,
      isMaxReps: false,
    });
  };

  return (
    <section className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe overflow-hidden mb-6">
      {/* Header */}
      <div className="px-4 py-3 bg-beige border-b-[0.5px] border-taupe flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-micro uppercase tracking-wide text-ink-muted">Suggested for today</p>
          <p className="text-sm-warm text-ink truncate">{headline}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="session-count" className="text-tiny text-ink-muted whitespace-nowrap">
            {count} exercises
          </label>
          <input
            id="session-count"
            type="range"
            min={MIN_SESSION_COUNT}
            max={MAX_SESSION_COUNT}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 accent-lower-body"
          />
        </div>
      </div>

      {/* Exercise rows */}
      {session.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-ink-muted text-xs-warm">
            Not enough library coverage to build a session. Check back after logging more exercises.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-taupe/40">
          {session.map((item) => {
            const lib = item.exercise;
            const barColor = TYPE_BAR[lib.type] || 'bg-taupe';
            const pillColor = TYPE_PILL[lib.type] || 'bg-beige text-ink-muted';
            return (
              <li key={lib.name} className="flex items-stretch">
                <div className={`w-1 ${barColor}`} aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => handlePick(item)}
                  className="flex-1 flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-beige/50 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm-warm text-ink font-medium">{lib.name}</span>
                      {lib.primary_muscle && (
                        <span className={`text-tiny px-1.5 py-0.5 rounded ${pillColor}`}>
                          {lib.primary_muscle}
                        </span>
                      )}
                    </div>
                    <p className="text-tiny text-ink-muted mt-0.5 truncate">
                      {formatLastUsed(item.lastUsed)}
                    </p>
                    <p className="text-micro text-ink-muted/80 mt-0.5 italic truncate">
                      {item.rationale}
                    </p>
                  </div>
                  <span className="text-ink-muted shrink-0" aria-label="Copy to form" title="Copy to form">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
