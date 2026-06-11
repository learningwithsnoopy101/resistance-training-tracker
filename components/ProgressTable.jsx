import React, { useMemo, useState } from 'react';
import { computeProgressRows, sortProgressRows } from '@/lib/progress';

const SORTS = [
  { key: 'recent', label: 'Recently progressed' },
  { key: 'plateau', label: 'Longest plateau' },
  { key: 'muscle', label: 'By muscle group' },
];

const TREND_CLASS = {
  '↑': 'text-lower-body-ink',
  '→': 'text-ink-muted',
  '↓': 'text-warn-ink',
};

function formatCombo(s, bodyweight) {
  if (!s) return '—';
  if (bodyweight) return `${s.sets}×${s.reps} (bodyweight)`;
  return `${s.sets}×${s.reps} @ ${s.weight} ${s.unit || 'lbs'}`;
}

// Time-to-progress table — one row per exercise with 3+ sessions
export function ProgressTable({ sessionsByName, exerciseLibrary = [] }) {
  const [sort, setSort] = useState('recent');

  const rows = useMemo(
    () => computeProgressRows(sessionsByName, exerciseLibrary),
    [sessionsByName, exerciseLibrary]
  );
  const sorted = useMemo(() => sortProgressRows(rows, sort), [rows, sort]);

  if (rows.length === 0) return null;

  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-h2-warm text-ink">Time to progress</h2>
          <p className="text-tiny text-ink-muted mt-0.5">
            How long each increase took · coral rows have been flat 28+ days
          </p>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="rounded-input border-[0.5px] border-taupe bg-cream text-tiny text-ink px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-lower-body"
        >
          {SORTS.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* header */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr_36px] gap-2 px-3 pb-2 border-l-4 border-transparent">
            {['Exercise', 'Current', 'Previous', 'Time to progress', ''].map((h, i) => (
              <span key={i} className="text-micro font-medium text-ink-muted uppercase tracking-micro">
                {h}
              </span>
            ))}
          </div>

          {sorted.map(row => (
            <div
              key={row.name}
              className={`grid grid-cols-[1.4fr_1fr_1fr_1.1fr_36px] gap-2 items-center px-3 py-2.5 border-t-[0.5px] border-taupe border-l-4 ${
                row.plateau ? 'border-l-warn-fill' : 'border-l-transparent'
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm-warm text-ink truncate">{row.name}</p>
                {row.muscle && <p className="text-tiny text-ink-muted">{row.muscle}</p>}
              </div>
              <span className="text-xs-warm text-ink">{formatCombo(row.current, row.bodyweight)}</span>
              <span className="text-xs-warm text-ink-muted">{formatCombo(row.previous, row.bodyweight)}</span>
              {row.plateau || !row.previous ? (
                <span className={`text-xs-warm ${row.plateau ? 'text-warn-ink' : 'text-ink-muted'}`}>
                  {row.previous || row.plateau ? `plateau ${row.plateauDays} days` : 'no change yet'}
                </span>
              ) : (
                <span className="text-xs-warm text-ink-muted">
                  {row.daysToProgress} days · {row.sessionsToProgress} session{row.sessionsToProgress !== 1 ? 's' : ''}
                </span>
              )}
              <span className={`text-h2-warm text-center ${TREND_CLASS[row.trend]}`}>{row.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
