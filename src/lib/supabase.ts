import { createClient } from '@supabase/supabase-js';

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:',
    !!supabaseUrl,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
    !!supabaseAnonKey
  );
}

// ✅ Client عادي للـ Frontend (anon key)
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);

// ✅ Admin Client للـ Server فقط (service_role يتجاوز RLS)
export const supabaseAdmin = createClient(
  supabaseUrl ?? '',
  supabaseServiceKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
