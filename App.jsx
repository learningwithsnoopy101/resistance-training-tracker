import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import ExerciseForm from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';

export default function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [mobileTab, setMobileTab] = useState('log');

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load exercises and exercise library from Supabase when logged in
  useEffect(() => {
    if (session) {
      fetchExercises();
      fetchExerciseLibrary();
    }
  }, [session]);

  const fetchExerciseLibrary = async () => {
    const { data } = await supabase
      .from('exercise_library')
      .select('name, type')
      .order('type')
      .order('name');
    if (data) setExerciseLibrary(data);
  };

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error) setExercises(data.map(fromDb));
    setLoading(false);
  };

  // Map DB row to app format
  const fromDb = (row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    date: row.date,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight || '',
    unit: row.unit || 'lbs',
    isMaxWeight: row.is_max_weight,
    isMaxReps: row.is_max_reps,
    focus: row.focus || '',
    notes: row.notes || '',
  });

  // Map app format to DB row
  const toDb = (ex) => ({
    user_id: session.user.id,
    name: ex.name,
    type: ex.type,
    date: ex.date,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight || null,
    unit: ex.unit,
    is_max_weight: ex.isMaxWeight,
    is_max_reps: ex.isMaxReps,
    focus: ex.focus || null,
    notes: ex.notes || null,
  });

  const handleAddExercise = async (formData) => {
    if (editingId) {
      const { error } = await supabase
        .from('exercises')
        .update(toDb(formData))
        .eq('id', editingId);
      if (!error) {
        setExercises(exercises.map(ex => ex.id === editingId ? { ...formData, id: editingId } : ex));
        setEditingId(null);
        setEditingData(null);
      }
    } else {
      const { data, error } = await supabase
        .from('exercises')
        .insert(toDb(formData))
        .select()
        .single();
      if (!error) setExercises([fromDb(data), ...exercises]);
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingId(exercise.id);
    setEditingData(exercise);
    setMobileTab('log');
  };

  const handleDeleteExercise = async (id) => {
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (!error) setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleCopyExercise = (exercise) => {
    setCopyData(exercise);
    setMobileTab('log');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setExercises([]);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-ink-muted">Loading...</p>
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-page">

      {/* Top bar */}
      <div className="bg-cream border-b-[0.5px] border-taupe px-4 py-3 flex items-center justify-between">
        <h1 className="text-h1-warm text-ink">Resistance Tracker</h1>
        <button
          onClick={handleSignOut}
          className="text-xs-warm text-ink-muted hover:text-ink transition"
        >
          Sign out
        </button>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-0 z-10 bg-cream border-b-[0.5px] border-taupe flex">
        <button
          onClick={() => setMobileTab('log')}
          className={`flex-1 py-3 text-sm-warm font-medium transition ${
            mobileTab === 'log'
              ? 'text-ink border-b-2 border-lower-body'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Log Exercise
        </button>
        <button
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-3 text-sm-warm font-medium transition ${
            mobileTab === 'history'
              ? 'text-ink border-b-2 border-lower-body'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          History {exercises.length > 0 && <span className="ml-1 text-tiny text-ink-muted">({exercises.length})</span>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        <div className={`w-full lg:w-96 lg:sticky lg:top-8 lg:h-fit lg:block ${mobileTab === 'log' ? 'block' : 'hidden'}`}>
          <ExerciseForm
            onSubmit={(data) => { handleAddExercise(data); setMobileTab('history'); }}
            editingData={editingData}
            onCancelEdit={handleCancelEdit}
            copyData={copyData}
            onCopyConsumed={() => setCopyData(null)}
            exerciseLibrary={exerciseLibrary}
          />
        </div>

        <div className={`flex-1 min-w-0 lg:block ${mobileTab === 'history' ? 'block' : 'hidden'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-ink-muted">Loading exercises...</p>
            </div>
          ) : (
            <ExerciseList
              exercises={exercises}
              onEdit={handleEditExercise}
              onDelete={handleDeleteExercise}
              onCopy={handleCopyExercise}
              editingId={editingId}
            />
          )}
        </div>

      </div>
    </div>
  );
}
