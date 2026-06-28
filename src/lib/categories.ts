import { supabaseServer } from '@/lib/supabase';
import { setCategoryLabels } from '@/lib/utils';

export interface Category {
  slug: string;
  name: string;
  description?: string | null;
  sort_order?: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { slug: 'politics', name: 'سياسة', sort_order: 1 },
  { slug: 'economy', name: 'اقتصاد', sort_order: 2 },
  { slug: 'local', name: 'محليات', sort_order: 3 },
  { slug: 'sports', name: 'رياضة', sort_order: 4 },
];

// Fetches categories from the DB, falling back to the built-in defaults if the
// table is missing or empty. Also warms the shared label registry so that the
// synchronous getCategoryLabel() returns correct Arabic labels during SSR.
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('slug, name, description, sort_order')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const categories = data as Category[];
      setCategoryLabels(Object.fromEntries(categories.map((c) => [c.slug, c.name])));
      return categories;
    }
  } catch (err) {
    console.error('getCategories failed, using defaults:', err);
  }

  setCategoryLabels(Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.slug, c.name])));
  return DEFAULT_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}
