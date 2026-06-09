import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client. Credentials come from env vars only — never
// hardcoded. Uses the service-role key, which bypasses RLS, so every data tool
// MUST scope queries by user_id explicitly.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY. Copy .env.example to .env and fill in the service-role key.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
