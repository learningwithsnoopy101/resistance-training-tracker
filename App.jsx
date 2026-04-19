import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '@/styles/globals.css';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import ExerciseForm from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';
import TabNavigation from '@/components/TabNavigation';
import Analytics from '@/components/Analytics';

export default function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [copyData, setCopyData] = useState(null);

  const navigate = useNavigate();

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
      .select('name, type, primary_muscle, secondary_muscles')
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
    navigate('/');
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
    navigate('/');
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

  const latestDate = exercises[0]?.date;
  const recentExercises = latestDate ? exercises.filter(ex => ex.date === latestDate) : [];

  const logPage = (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-96 lg:sticky lg:top-24 lg:h-fit">
        <ExerciseForm
          onSubmit={handleAddExercise}
          editingData={editingData}
          onCancelEdit={handleCancelEdit}
          copyData={copyData}
          onCopyConsumed={() => setCopyData(null)}
          exerciseLibrary={exerciseLibrary}
        />
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <p className="text-ink-muted">Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <h3 className="text-h2-warm text-ink mb-2">No exercises logged yet</h3>
            <p className="text-ink-muted text-xs-warm">Start by adding your first exercise using the form.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-h1-warm text-ink mb-4">Recent activity</h2>
            <ExerciseList
              exercises={recentExercises}
              exerciseLibrary={exerciseLibrary}
              onEdit={handleEditExercise}
              onDelete={handleDeleteExercise}
              onCopy={handleCopyExercise}
              editingId={editingId}
            />
          </div>
        )}
      </div>
    </div>
  );

  const historyPage = (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-h1-warm text-ink">History</h1>
        <span className="text-tiny text-ink-muted">
          {exercises.length} session{exercises.length !== 1 ? 's' : ''}
        </span>
      </div>
      {loading ? (
        <p className="text-ink-muted">Loading exercises...</p>
      ) : (
        <ExerciseList
          exercises={exercises}
          exerciseLibrary={exerciseLibrary}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
          onCopy={handleCopyExercise}
          editingId={editingId}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-page">

      {/* Top bar — title + desktop tabs + sign out */}
      <div className="bg-cream border-b-[0.5px] border-taupe px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-h1-warm text-ink whitespace-nowrap">Resistance Tracker</h1>
        <TabNavigation className="hidden lg:inline-flex" />
        <button
          onClick={handleSignOut}
          className="text-xs-warm text-ink-muted hover:text-ink transition whitespace-nowrap"
        >
          Sign out
        </button>
      </div>

      {/* Mobile tab bar — sticky below the header */}
      <div className="lg:hidden sticky top-0 z-10 bg-cream border-b-[0.5px] border-taupe flex justify-center py-2">
        <TabNavigation />
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={logPage} />
          <Route path="/analytics" element={<Analytics exercises={exercises} />} />
          <Route path="/history" element={historyPage} />
        </Routes>
      </div>
    </div>
  );
}
