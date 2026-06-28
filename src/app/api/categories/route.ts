import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await getCategories();
  return NextResponse.json({ items });
}
