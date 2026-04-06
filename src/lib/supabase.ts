import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const fetchOptions = {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
      return fetch(url, { ...options, cache: 'no-store' as RequestCache });
    },
  },
};

// Client-side (anon key) - used in client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey, fetchOptions);

// Server-side (service role key) - bypasses RLS, use ONLY in server components
export const supabaseServer = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, fetchOptions)
  : supabase;
