import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:',
    !!supabaseUrl,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    !!supabaseAnonKey,
    '— Did you create .env.local and restart the dev server?'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
