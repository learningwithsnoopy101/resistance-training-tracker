import React from 'react';

const TYPE_COLORS = {
  'Upper Body': 'bg-blue-100 text-blue-800',
  'Lower Body': 'bg-green-100 text-green-800',
  'Abs': 'bg-purple-100 text-purple-800',
  'Peak 8': 'bg-orange-100 text-orange-800',
};

export default function ExerciseCard({ exercise, onEdit, onDelete, isEditing }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const typeColor = TYPE_COLORS[exercise.type] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all ${
        isEditing ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 break-words">{exercise.name}</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
              {exercise.type}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {formatDate(exercise.date)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(exercise)}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${exercise.name}?`)) {
                onDelete(exercise.id);
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sets</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercise.sets}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reps</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercise.reps}</p>
        </div>
        {exercise.weight && (
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Weight</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {exercise.weight} <span className="text-sm text-gray-600">{exercise.unit}</span>
            </p>
          </div>
        )}
        {(exercise.isMaxWeight || exercise.isMaxReps) && (
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Achievements</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.isMaxWeight && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  Max W
                </span>
              )}
              {exercise.isMaxReps && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  Max R
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {exercise.notes && (
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-gray-700 text-sm leading-relaxed">{exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
