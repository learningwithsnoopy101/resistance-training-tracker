import React, { useMemo } from 'react';
import { computeMuscleFrequency } from '@/lib/suggestions';
import { WEEKLY_TARGET } from '@/lib/progress';

// Cool (undertrained) → warm (well-trained), all palette tokens
const LEVELS = [
  { max: 0, cell: 'bg-upper-body-fill', text: 'text-upper-body-ink', label: 'not trained' },
  { max: 1, cell: 'bg-beige', text: 'text-ink-muted', label: 'below target' },
  { max: 2, cell: 'bg-lower-body-fill', text: 'text-lower-body-ink', label: 'at target' },
  { max: Infinity, cell: 'bg-abs-core-fill', text: 'text-abs-core-ink', label: 'above target' },
];

const levelFor = count => LEVELS.find(l => count <= l.max);

// Trailing-7-day session count per primary muscle vs the 2×/week target.
// Same math as the suggestion engine (Peak 8 excluded there too).
export function MuscleHeatmap({ exercises = [], exerciseLibrary = [] }) {
  const libraryMap = useMemo(
    () => new Map(exerciseLibrary.map(r => [r.name, r])),
    [exerciseLibrary]
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const counts = useMemo(
    () => computeMuscleFrequency(exercises, todayStr, libraryMap),
    [exercises, todayStr, libraryMap]
  );
  const muscles = useMemo(() => {
    const set = new Set(
      exerciseLibrary
        .filter(r => r.type !== 'Peak 8' && r.primary_muscle)
        .map(r => r.primary_muscle)
    );
    return [...set].sort(
      (a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b)
    );
  }, [exerciseLibrary, counts]);

  if (muscles.length === 0) return null;

  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-h2-warm text-ink">Muscle coverage</h2>
          <p className="text-tiny text-ink-muted mt-0.5">
            Sessions in the last 7 days · target {WEEKLY_TARGET} per muscle
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {LEVELS.map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-tiny text-ink-muted">
              <span className={`w-3 h-3 rounded-progress border-[0.5px] border-taupe ${l.cell}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {muscles.map(muscle => {
          const count = counts.get(muscle) || 0;
          const level = levelFor(count);
          return (
            <div
              key={muscle}
              className={`rounded-input border-[0.5px] border-taupe px-3 py-2.5 ${level.cell}`}
            >
              <p className={`text-xs-warm font-medium ${level.text}`}>{muscle}</p>
              <p className={`text-tiny mt-0.5 ${level.text}`}>
                {count} / {WEEKLY_TARGET} this week
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
