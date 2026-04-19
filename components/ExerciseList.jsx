import React from 'react';

// Exercise-type styles: left-border bar + badge pill. Uses warm-palette tokens.
const TYPE_STYLES = {
  'Upper Body': { bar: 'bg-upper-body',  badge: 'bg-upper-body-fill text-upper-body-ink' },
  'Lower Body': { bar: 'bg-lower-body',  badge: 'bg-lower-body-fill text-lower-body-ink' },
  'Abs':        { bar: 'bg-abs-core',    badge: 'bg-abs-core-fill text-abs-core-ink' },
  'Peak 8':     { bar: 'bg-peak-8',      badge: 'bg-peak-8-fill text-peak-8-ink' },
};

const DEFAULT_STYLE = { bar: 'bg-taupe', badge: 'bg-beige text-ink-muted' };

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(exercises) {
  const groups = {};
  for (const ex of exercises) {
    if (!groups[ex.date]) groups[ex.date] = [];
    groups[ex.date].push(ex);
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function ExerciseRow({ exercise, onEdit, onDelete, onCopy, isEditing }) {
  const style = TYPE_STYLES[exercise.type] || DEFAULT_STYLE;

  return (
    <div className={`flex gap-2 px-3 py-2.5 rounded-input transition-colors ${
      isEditing ? 'bg-beige ring-1 ring-lower-body' : 'hover:bg-beige'
    }`}>
      {/* Type color bar */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${style.bar}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + type badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ink text-sm-warm">{exercise.name}</span>
          <span className={`text-tiny px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
            {exercise.type}
          </span>
        </div>

        {/* Bottom row: stats + actions */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="font-mono font-medium text-ink text-sm-warm">
            {exercise.sets}×{exercise.reps}
          </span>
          {exercise.weight && (
            <span className="text-tiny text-ink-muted">{exercise.weight} {exercise.unit}</span>
          )}
          {exercise.focus && (
            <span className="text-tiny bg-abs-core-fill text-abs-core-ink px-1.5 py-0.5 rounded-input font-medium">
              {exercise.focus}
            </span>
          )}
          {exercise.isMaxWeight && (
            <span className="text-tiny bg-pr-fill text-pr-ink px-1.5 py-0.5 rounded-input font-medium">Max W</span>
          )}
          {exercise.isMaxReps && (
            <span className="text-tiny bg-pr-fill text-pr-ink px-1.5 py-0.5 rounded-input font-medium">Max R</span>
          )}
          {exercise.notes && (
            <span className="text-tiny text-ink-muted italic truncate">{exercise.notes}</span>
          )}

          {/* Actions inline with stats */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <button
              onClick={() => onCopy(exercise)}
              title="Copy to entry"
              className="p-1.5 text-lower-body-ink hover:bg-lower-body-fill rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button
              onClick={() => onEdit(exercise)}
              title="Edit"
              className="p-1.5 text-upper-body-ink hover:bg-upper-body-fill rounded-input transition focus:outline-none focus:ring-2 focus:ring-upper-body"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={() => { if (window.confirm(`Delete ${exercise.name}?`)) onDelete(exercise.id); }}
              title="Delete"
              className="p-1.5 text-warn-ink hover:bg-warn-fill rounded-input transition focus:outline-none focus:ring-2 focus:ring-warn-fill"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseList({ exercises, onEdit, onDelete, onCopy, editingId }) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-h2-warm text-ink mb-2">No exercises logged yet</h3>
        <p className="text-ink-muted text-xs-warm">Start by adding your first exercise using the form.</p>
      </div>
    );
  }

  const groups = groupByDate(exercises);

  return (
    <div>
      <h2 className="text-h1-warm text-ink mb-4">Exercise Log</h2>
      <div className="space-y-5">
        {groups.map(([date, group]) => (
          <div key={date} className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe overflow-hidden">
            {/* Date header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-beige border-b-[0.5px] border-taupe">
              <span className="text-sm-warm font-medium text-ink">{formatDate(date)}</span>
              <span className="text-tiny text-ink-muted">{group.length} exercise{group.length !== 1 ? 's' : ''}</span>
            </div>
            {/* Rows */}
            <div className="px-2 py-1 divide-y divide-taupe/40">
              {group.map(exercise => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopy={onCopy}
                  isEditing={editingId === exercise.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
