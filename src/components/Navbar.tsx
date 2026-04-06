'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const NavbarSearch = dynamic(() => import('@/components/NavbarSearch'), {
  ssr: true,
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "الرئيسية", path: "/" },
    { name: "🔴 تغطيات حية", path: "/live" },
    { name: "سياسية", path: "/politics" },
    { name: "اقتصادية", path: "/economy" },
    { name: "محلية", path: "/local" },
    { name: "رياضية", path: "/sports" },
    { name: "من نحن", path: "/about" },
  ];

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 border-b border-gold/20 backdrop-blur-sm shadow-elegant" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-all group">
            <Image 
              src="/icon.png" 
              alt="نفود" 
              width={48} 
              height={48}
              className="h-10 w-10 md:h-12 md:w-12 transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col">
              <span className="text-gold font-bold text-lg md:text-xl lg:text-2xl tracking-tight">شبكة نفود</span>
              <span className="text-gold/80 text-xs md:text-sm font-light tracking-wide">الإخبارية</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = mounted && pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-300 font-medium text-base relative overflow-hidden group ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "hover:bg-secondary/10 text-primary-foreground"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {!isActive && (
                    <span className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <div className="hidden md:block">
            <NavbarSearch />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <NavbarSearch />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gold p-2 hover:bg-secondary/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            {navItems.map((item) => {
              const isActive = mounted && pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-5 py-3 rounded-lg transition-all duration-300 font-medium ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "hover:bg-secondary/10 text-primary-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
