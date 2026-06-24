import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const RESERVED_CATEGORY_KEYS = new Set(['id', 'editor_id', 'created_at']);

function extractCategoryValue(row: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(row)) {
    if (RESERVED_CATEGORY_KEYS.has(key)) continue;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim().toLowerCase();
    }
  }
  return null;
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from('editors')
    .select('id, name, position')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Admin editors GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch editors' }, { status: 500 });
  }

  const editors = data ?? [];

  const categoriesByEditor = new Map<string, string[]>();
  const { data: mappings, error: mappingError } = await supabaseServer
    .from('editor_categories')
    .select('*');

  if (mappingError) {
    console.error('Admin editor_categories GET failed:', mappingError);
  } else if (mappings) {
    for (const row of mappings as Record<string, unknown>[]) {
      const editorId = typeof row.editor_id === 'string' ? row.editor_id : null;
      const category = extractCategoryValue(row);
      if (!editorId || !category) continue;

      const existing = categoriesByEditor.get(editorId) ?? [];
      if (!existing.includes(category)) existing.push(category);
      categoriesByEditor.set(editorId, existing);
    }
  }

  const items = editors.map((editor) => ({
    ...editor,
    categories: categoriesByEditor.get(editor.id) ?? [],
  }));

  return NextResponse.json({ items });
}
