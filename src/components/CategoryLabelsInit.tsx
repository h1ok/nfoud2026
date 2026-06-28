'use client';

import { setCategoryLabels } from '@/lib/utils';

type CategoryLite = { slug: string; name: string };

// Warms the shared client-side label registry during render (SSR + hydration)
// so getCategoryLabel() returns correct Arabic labels for dynamic categories.
export default function CategoryLabelsInit({ categories }: { categories: CategoryLite[] }) {
  if (categories?.length) {
    setCategoryLabels(Object.fromEntries(categories.map((c) => [c.slug, c.name])));
  }
  return null;
}
