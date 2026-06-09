import { supabase } from '../lib/supabase.js';

// Exercise-library + aggregation tools.

// get_exercise_library — fetch the full shared catalog (read-only for users).
export async function get_exercise_library() {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('name, type, primary_muscle, secondary_muscles, equipment, movement_pattern')
    .order('type')
    .order('name');

  return { data, error: error ? error.message : null };
}

// get_progress_by_muscle — aggregate a user's sets/reps/sessions by primary
// muscle group over an optional date range. Joins logged exercises to the
// library by name to resolve each exercise's primary muscle.
export async function get_progress_by_muscle({ user_id, start_date = null, end_date = null }) {
  if (!user_id) return { data: null, error: 'user_id is required' };

  // Pull the user's exercises in range.
  let exQuery = supabase
    .from('exercises')
    .select('name, sets, reps, weight, date')
    .eq('user_id', user_id);
  if (start_date) exQuery = exQuery.gte('date', start_date);
  if (end_date) exQuery = exQuery.lte('date', end_date);

  const { data: exercises, error: exError } = await exQuery;
  if (exError) return { data: null, error: exError.message };

  // Pull the library to map name -> primary_muscle.
  const { data: library, error: libError } = await supabase
    .from('exercise_library')
    .select('name, primary_muscle');
  if (libError) return { data: null, error: libError.message };

  const muscleByName = new Map(library.map((row) => [row.name, row.primary_muscle]));

  // Aggregate by primary muscle.
  const byMuscle = {};
  for (const ex of exercises) {
    const muscle = muscleByName.get(ex.name) || 'Uncategorized';
    if (!byMuscle[muscle]) {
      byMuscle[muscle] = {
        primary_muscle: muscle,
        session_count: 0,
        total_sets: 0,
        total_reps: 0,
        last_trained: null,
      };
    }
    const bucket = byMuscle[muscle];
    bucket.session_count += 1;
    bucket.total_sets += ex.sets || 0;
    bucket.total_reps += (ex.sets || 0) * (ex.reps || 0);
    if (!bucket.last_trained || ex.date > bucket.last_trained) {
      bucket.last_trained = ex.date;
    }
  }

  return { data: Object.values(byMuscle), error: null };
}
