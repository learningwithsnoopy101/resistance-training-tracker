import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import ExerciseForm from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';
import BulkImport from '@/components/BulkImport';

const STORAGE_KEY = 'resistanceTrainingExercises';

export default function App() {
  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    } catch (error) {
      console.error('Failed to save exercises to localStorage:', error);
    }
  }, [exercises]);

  const handleAddExercise = (formData) => {
    if (editingId) {
      setExercises(exercises.map(ex => 
        ex.id === editingId ? { ...formData, id: editingId } : ex
      ));
      setEditingId(null);
      setEditingData(null);
    } else {
      const newExercise = {
        ...formData,
        id: Date.now(),
      };
      setExercises([newExercise, ...exercises]);
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingId(exercise.id);
    setEditingData(exercise);
  };

  const handleDeleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="w-full lg:w-96 lg:sticky lg:top-8 lg:h-fit">
          <ExerciseForm
            onSubmit={handleAddExercise}
            editingData={editingData}
            onCancelEdit={handleCancelEdit}
          />
          <div className="mt-4">
            <BulkImport onImport={(items) => {
              const newExercises = items.map(ex => ({ ...ex, id: Date.now() + Math.random() }));
              setExercises(prev => [...newExercises, ...prev]);
            }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <ExerciseList 
            exercises={exercises}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
            editingId={editingId}
          />
        </div>
      </div>
    </div>
  );
}
