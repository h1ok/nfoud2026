import Link from 'next/link';
import type { ReactNode } from 'react';
import { LayoutDashboard, Newspaper, Radio, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard-control-panel-2025', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard-control-panel-2025/news', label: 'إدارة الأخبار', icon: Newspaper },
  { href: '/dashboard-control-panel-2025/live-events', label: 'الأحداث الحية', icon: Radio },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-primary text-lg font-bold">ن</div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">لوحة التحكم</h1>
              <p className="text-xs md:text-sm text-primary-foreground/70">إدارة محتوى نفود الإخبارية</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-2 text-sm font-medium transition hover:bg-primary-foreground/10"
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/20"
            >
              <LogOut size={16} />
              <span>العودة للموقع</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
