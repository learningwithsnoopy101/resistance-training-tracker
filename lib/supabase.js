import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efluojvfzcmldhtwnwic.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GHwYvZl4Us7Cu6yAx-CepA_BszZmGyf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
