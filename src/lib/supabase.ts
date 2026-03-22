import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Client عادي للـ Frontend
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);

// ✅ Admin Client - Lazy (يُنشأ فقط عند الاستخدام الفعلي وليس أثناء البناء)
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  _supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  });

  return _supabaseAdmin;
}

// للتوافق مع الكود القديم (optional)
export { _supabaseAdmin as supabaseAdmin };
