import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('editors')
    .select('id, name, position')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Admin editors GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch editors' }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
