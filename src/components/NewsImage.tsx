'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsImageProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  category?: string;
}

export default function NewsImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = 'object-cover',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  category,
}: NewsImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/90 via-primary/70 to-accent/30 flex flex-col items-center justify-center gap-3">
        <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
          <Newspaper className="w-10 h-10 text-gold/80" />
        </div>
        <span className="text-gold/70 text-sm font-bold tracking-wide">شبكة نفود الإخبارية</span>
        {category && (
          <span className="text-gold/50 text-xs">{category}</span>
        )}
      </div>
    );
  }

  const isExternal = src.startsWith('http');

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={isExternal}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={isExternal}
      onError={() => setHasError(true)}
    />
  );
}
