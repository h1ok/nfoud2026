'use client';

import dynamic from 'next/dynamic';

const NewsTicker = dynamic(() => import('@/components/NewsTicker'), {
  ssr: true,
});

export default function NewsTickerWrapper() {
  return <NewsTicker />;
}
