import React from 'react';
import ExerciseCard from '@/components/ExerciseCard';

export default function ExerciseList({ exercises, onEdit, onDelete, editingId }) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises logged yet</h3>
          <p className="text-gray-600">Start by adding your first exercise using the form on the left.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise Log</h2>
      <div className="space-y-4">
        {exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditing={editingId === exercise.id}
          />
        ))}
      </div>
    </div>
  );
}
