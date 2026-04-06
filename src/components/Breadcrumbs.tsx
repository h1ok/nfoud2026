import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ label: 'الرئيسية', href: '/' }, ...items];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="مسار التنقل" className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronLeft size={14} className="text-muted-foreground/50" aria-hidden="true" />
              )}
              {index === allItems.length - 1 ? (
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[400px]">
                  {index === 0 && <Home size={14} className="inline ml-1" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gold transition-colors whitespace-nowrap"
                >
                  {index === 0 && <Home size={14} className="inline ml-1" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
