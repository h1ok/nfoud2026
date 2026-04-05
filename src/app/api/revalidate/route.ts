import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, tag } = body;

    if (path) {
      revalidatePath(path, 'page');
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    if (tag) {
      revalidatePath(`/${tag}`, 'page');
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/all-news', 'page');
    revalidatePath('/live', 'page');
    
    return NextResponse.json({ 
      revalidated: true, 
      message: 'All main paths revalidated',
      now: Date.now() 
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
  }
}
