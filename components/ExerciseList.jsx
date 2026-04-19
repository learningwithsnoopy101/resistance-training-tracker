import React, { useMemo } from 'react';
import ExerciseCard from '@/components/ExerciseCard';

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

export default function ExerciseList({ exercises, exerciseLibrary = [], onEdit, onDelete, onCopy, editingId }) {
  // Lookup map: exercise name -> library row (for muscle group metadata)
  const libraryMap = useMemo(
    () => new Map(exerciseLibrary.map(l => [l.name, l])),
    [exerciseLibrary]
  );

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
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  libraryEntry={libraryMap.get(exercise.name)}
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
