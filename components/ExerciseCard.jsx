import React from 'react';

// Exercise-type style map — uses warm-palette tokens from tailwind.config.js
const TYPE_STYLES = {
  'Upper Body': 'bg-upper-body-fill text-upper-body-ink',
  'Lower Body': 'bg-lower-body-fill text-lower-body-ink',
  'Abs':        'bg-abs-core-fill text-abs-core-ink',
  'Peak 8':     'bg-peak-8-fill text-peak-8-ink',
};

export default function ExerciseCard({ exercise, onEdit, onDelete, isEditing }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const typeStyle = TYPE_STYLES[exercise.type] || 'bg-beige text-ink-muted';

  return (
    <div
      className={`bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-6 transition-all ${
        isEditing ? 'ring-2 ring-lower-body' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-h2-warm text-ink break-words">{exercise.name}</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs-warm font-medium ${typeStyle}`}>
              {exercise.type}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs-warm font-medium bg-beige text-ink-muted">
              {formatDate(exercise.date)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(exercise)}
            className="px-4 py-2 bg-beige hover:bg-taupe text-ink font-medium rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${exercise.name}?`)) {
                onDelete(exercise.id);
              }
            }}
            className="px-4 py-2 bg-warn-fill hover:opacity-80 text-warn-ink font-medium rounded-input transition focus:outline-none focus:ring-2 focus:ring-warn-fill"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b-[0.5px] border-taupe">
        <div>
          <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">Sets</p>
          <p className="text-h1-warm text-ink mt-1">{exercise.sets}</p>
        </div>
        <div>
          <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">Reps</p>
          <p className="text-h1-warm text-ink mt-1">{exercise.reps}</p>
        </div>
        {exercise.weight && (
          <div>
            <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">Weight</p>
            <p className="text-h1-warm text-ink mt-1">
              {exercise.weight} <span className="text-xs-warm text-ink-muted">{exercise.unit}</span>
            </p>
          </div>
        )}
        {(exercise.isMaxWeight || exercise.isMaxReps) && (
          <div>
            <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">Achievements</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.isMaxWeight && (
                <span className="inline-block px-2 py-1 bg-pr-fill text-pr-ink text-tiny font-medium rounded-input">
                  Max W
                </span>
              )}
              {exercise.isMaxReps && (
                <span className="inline-block px-2 py-1 bg-pr-fill text-pr-ink text-tiny font-medium rounded-input">
                  Max R
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {exercise.notes && (
        <div>
          <p className="text-micro font-medium text-ink-muted uppercase tracking-micro mb-2">Notes</p>
          <p className="text-ink text-sm-warm leading-relaxed">{exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
