import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface InternalLink {
  title: string;
  href: string;
  description?: string;
}

interface InternalLinksProps {
  title: string;
  links: InternalLink[];
}

export default function InternalLinks({ title, links }: InternalLinksProps) {
  if (links.length === 0) return null;

  return (
    <aside className="mt-12 p-6 bg-secondary/50 rounded-xl border border-border" role="complementary">
      <h3 className="text-xl font-bold mb-4 text-foreground">{title}</h3>
      <nav>
        <ul className="space-y-3">
          {links.map((link, index) => (
            <li key={index}>
              <Link 
                href={link.href}
                className="flex items-start gap-3 group hover:bg-card/50 p-3 rounded-lg transition-all"
              >
                <ChevronLeft size={18} className="text-gold mt-1 shrink-0 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                <div className="flex-1">
                  <span className="font-bold text-foreground group-hover:text-gold transition-colors block">
                    {link.title}
                  </span>
                  {link.description && (
                    <span className="text-sm text-muted-foreground block mt-1">
                      {link.description}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
