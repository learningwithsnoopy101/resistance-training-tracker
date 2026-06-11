import React from 'react';

// Maps exercise type → text color token; SVG strokes/fills use currentColor
const TYPE_TEXT = {
  'Lower Body': 'text-lower-body',
  'Upper Body': 'text-upper-body',
  'Abs': 'text-abs-core',
  'Peak 8': 'text-peak-8',
};

const W = 600;
const H = 230;
const PAD = { l: 48, r: 16, t: 18, b: 30 };

function formatTick(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatValue(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// Inline SVG line chart — one logged session per point, PRs as gold dots.
// points: [{ date, value, reps, isPr, unit }], oldest → newest
export function ProgressChart({ points, type }) {
  if (points.length < 2) return null;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const colorClass = TYPE_TEXT[type] || 'text-ink-muted';
  const unit = points[0].unit;

  // X — time-scaled; falls back to even index spacing if all same date
  const times = points.map(p => new Date(p.date + 'T00:00:00').getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const xFor = (i) =>
    t1 === t0
      ? PAD.l + (i / (points.length - 1)) * innerW
      : PAD.l + ((times[i] - t0) / (t1 - t0)) * innerW;

  // Y — padded value range
  const values = points.map(p => p.value);
  const vMin = Math.min(...values);
  const vMax = Math.max(...values);
  const span = vMax - vMin;
  const pad = span > 0 ? span * 0.15 : Math.max(vMax * 0.1, 5);
  const lo = Math.max(0, vMin - pad);
  const hi = vMax + pad;
  const yFor = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * innerH;

  const coords = points.map((p, i) => ({ ...p, x: xFor(i), y: yFor(p.value) }));
  const line = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  // 3 horizontal gridlines: bottom, middle, top of value range
  const yTicks = [lo, (lo + hi) / 2, hi];

  // X tick labels: first, middle, last session dates (deduped)
  const tickIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Progression chart, ${points.length} sessions, ${unit}`}
    >
      {/* gridlines + y labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yFor(v)}
            y2={yFor(v)}
            className="stroke-taupe"
            strokeWidth="0.5"
          />
          <text
            x={PAD.l - 6}
            y={yFor(v) + 3}
            textAnchor="end"
            fontSize="9"
            className="fill-ink-muted"
          >
            {formatValue(v)}
          </text>
        </g>
      ))}

      {/* unit label */}
      <text x={PAD.l - 6} y={PAD.t - 8} textAnchor="end" fontSize="9" className="fill-ink-muted">
        {unit}
      </text>

      {/* x tick labels */}
      {tickIdx.map(i => (
        <text
          key={i}
          x={coords[i].x}
          y={H - 10}
          textAnchor="middle"
          fontSize="9"
          className="fill-ink-muted"
        >
          {formatTick(points[i].date)}
        </text>
      ))}

      {/* progression line */}
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={colorClass}
      />

      {/* session points — PRs in gold with a pale halo */}
      {coords.map((c, i) => (
        <g key={i}>
          {c.isPr && <circle cx={c.x} cy={c.y} r="7" className="fill-pr-fill" />}
          <circle
            cx={c.x}
            cy={c.y}
            r={c.isPr ? 4.5 : 3.5}
            fill="currentColor"
            className={c.isPr ? 'text-pr-ink' : colorClass}
          />
          <text
            x={c.x}
            y={c.y - (c.isPr ? 11 : 8)}
            textAnchor="middle"
            fontSize="8"
            className="fill-ink-muted"
          >
            {c.reps}
          </text>
        </g>
      ))}
    </svg>
  );
}
