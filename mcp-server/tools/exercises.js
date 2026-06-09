import { supabase } from '../lib/supabase.js';

// Logged-session tools. Because the server uses the service-role key (RLS
// bypassed), every query is scoped by user_id explicitly. Each tool returns the
// consistent { data, error } shape with human-readable error messages.

// get_exercises — fetch a user's logged exercises, newest first, optional range.
export async function get_exercises({ user_id, start_date = null, end_date = null }) {
  if (!user_id) return { data: null, error: 'user_id is required' };

  let query = supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (start_date) query = query.gte('date', start_date);
  if (end_date) query = query.lte('date', end_date);

  const { data, error } = await query;
  return { data, error: error ? error.message : null };
}

// log_exercise — insert one exercise row, return the created row.
export async function log_exercise({ user_id, exercise }) {
  if (!user_id) return { data: null, error: 'user_id is required' };
  if (!exercise || !exercise.name || !exercise.type || !exercise.date) {
    return { data: null, error: 'exercise must include at least name, type, and date' };
  }

  const row = {
    user_id,
    name: exercise.name,
    type: exercise.type,
    date: exercise.date,
    sets: exercise.sets ?? null,
    reps: exercise.reps ?? null,
    weight: exercise.weight ?? null,
    unit: exercise.unit ?? 'lbs',
    is_max_weight: exercise.is_max_weight ?? false,
    is_max_reps: exercise.is_max_reps ?? false,
    notes: exercise.notes ?? null,
  };

  const { data, error } = await supabase
    .from('exercises')
    .insert(row)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}

// update_exercise — edit an existing row (scoped to the owning user).
export async function update_exercise({ user_id, id, updates }) {
  if (!user_id) return { data: null, error: 'user_id is required' };
  if (!id) return { data: null, error: 'id is required' };
  if (!updates || Object.keys(updates).length === 0) {
    return { data: null, error: 'updates object is required and cannot be empty' };
  }

  // Whitelist editable columns; never allow user_id or id to be reassigned.
  const allowed = [
    'name', 'type', 'date', 'sets', 'reps', 'weight', 'unit',
    'is_max_weight', 'is_max_reps', 'notes',
  ];
  const patch = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  if (Object.keys(patch).length === 0) {
    return { data: null, error: 'no editable fields in updates' };
  }

  const { data, error } = await supabase
    .from('exercises')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}

// delete_exercise — remove a row (scoped to the owning user).
export async function delete_exercise({ user_id, id }) {
  if (!user_id) return { data: null, error: 'user_id is required' };
  if (!id) return { data: null, error: 'id is required' };

  const { data, error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}
