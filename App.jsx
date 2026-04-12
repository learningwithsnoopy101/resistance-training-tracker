import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import ExerciseForm from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';
import BulkImport from '@/components/BulkImport';
import DataPortability from '@/components/DataPortability';

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
  const [mobileTab, setMobileTab] = useState('log'); // 'log' | 'history'

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
    setMobileTab('log');
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

      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileTab('log')}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            mobileTab === 'log' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          Log Exercise
        </button>
        <button
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            mobileTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          History {exercises.length > 0 && <span className="ml-1 text-xs text-gray-400">({exercises.length})</span>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Left panel — always visible on desktop, tab-controlled on mobile */}
        <div className={`w-full lg:w-96 lg:sticky lg:top-8 lg:h-fit lg:block ${mobileTab === 'log' ? 'block' : 'hidden'}`}>
          <ExerciseForm
            onSubmit={(data) => { handleAddExercise(data); setMobileTab('history'); }}
            editingData={editingData}
            onCancelEdit={handleCancelEdit}
          />
          <div className="mt-4">
            <BulkImport onImport={(items) => {
              const newExercises = items.map(ex => ({ ...ex, id: Date.now() + Math.random() }));
              setExercises(prev => [...newExercises, ...prev]);
              setMobileTab('history');
            }} />
          </div>
          <div className="mt-4">
            <DataPortability
              exercises={exercises}
              onImport={(data) => { setExercises(data); setMobileTab('history'); }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className={`flex-1 min-w-0 lg:block ${mobileTab === 'history' ? 'block' : 'hidden'}`}>
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
