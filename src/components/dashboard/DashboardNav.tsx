'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Newspaper, 
  PlusCircle, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface DashboardNavProps {
  user: any;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard-control-panel-2025', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/dashboard-control-panel-2025/news', label: 'إدارة الأخبار', icon: Newspaper },
    { href: '/dashboard-control-panel-2025/news/new', label: 'إضافة خبر', icon: PlusCircle },
    { href: '/dashboard-control-panel-2025/live-events', label: 'الأحداث الحية', icon: Radio },
    { href: '/dashboard-control-panel-2025/statistics', label: 'الإحصائيات', icon: BarChart3 },
  ];

  return (
    <nav className="bg-primary text-primary-foreground border-b-2 border-gold">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard-control-panel-2025" className="flex items-center gap-3">
              <Image
                src="/nafud-logo.png"
                alt="نفود"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-xl font-bold hidden md:block">لوحة التحكم</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
