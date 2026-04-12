import React from 'react';

const TYPE_STYLES = {
  'Upper Body': { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' },
  'Lower Body': { bar: 'bg-green-500', badge: 'bg-green-100 text-green-800' },
  'Abs':        { bar: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' },
  'Peak 8':     { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' },
};

const DEFAULT_STYLE = { bar: 'bg-gray-400', badge: 'bg-gray-100 text-gray-800' };

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
    <div className={`flex gap-2 px-3 py-2.5 rounded-lg transition-colors ${
      isEditing ? 'bg-blue-50 ring-1 ring-blue-400' : 'hover:bg-gray-50'
    }`}>
      {/* Type color bar */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${style.bar}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + type badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{exercise.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
            {exercise.type}
          </span>
        </div>

        {/* Bottom row: stats + actions */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="font-mono font-semibold text-gray-900 text-sm">
            {exercise.sets}×{exercise.reps}
          </span>
          {exercise.weight && (
            <span className="text-xs text-gray-600">{exercise.weight} {exercise.unit}</span>
          )}
          {exercise.focus && (
            <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
              {exercise.focus}
            </span>
          )}
          {exercise.isMaxWeight && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">Max W</span>
          )}
          {exercise.isMaxReps && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">Max R</span>
          )}
          {exercise.notes && (
            <span className="text-xs text-gray-400 italic truncate">{exercise.notes}</span>
          )}

          {/* Actions inline with stats */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
        <button
          onClick={() => onCopy(exercise)}
          title="Copy to entry"
          className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button
          onClick={() => onEdit(exercise)}
          title="Edit"
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          onClick={() => { if (window.confirm(`Delete ${exercise.name}?`)) onDelete(exercise.id); }}
          title="Delete"
          className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-400"
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises logged yet</h3>
        <p className="text-gray-500 text-sm">Start by adding your first exercise using the form.</p>
      </div>
    );
  }

  const groups = groupByDate(exercises);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercise Log</h2>
      <div className="space-y-5">
        {groups.map(([date, group]) => (
          <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Date header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">{formatDate(date)}</span>
              <span className="text-xs text-gray-400">{group.length} exercise{group.length !== 1 ? 's' : ''}</span>
            </div>
            {/* Rows */}
            <div className="px-2 py-1 divide-y divide-gray-50">
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
