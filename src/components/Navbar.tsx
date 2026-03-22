'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const NavbarSearch = dynamic(() => import('@/components/NavbarSearch'), {
  ssr: false,
  loading: () => (
    <button className="text-gold p-2 hover:bg-secondary/10 rounded-lg transition-colors" aria-label="بحث">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </button>
  ),
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", path: "/" },
    { name: "سياسية", path: "/politics" },
    { name: "اقتصادية", path: "/economy" },
    { name: "محلية", path: "/local" },
    { name: "رياضية", path: "/sports" },
    { name: "من نحن", path: "/about" },
  ];

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 border-b border-gold/30 shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-all group">
            <Image 
              src="/nafud-logo.png" 
              alt="نفود" 
              width={48} 
              height={48}
              className="h-10 w-10 md:h-12 md:w-12 transition-transform group-hover:scale-105 drop-shadow-md" 
            />
            <div className="flex flex-col">
              <span className="text-gold font-black text-xl md:text-2xl lg:text-3xl tracking-tight">شبكة نفود</span>
              <span className="text-gold/90 text-xs md:text-sm font-semibold tracking-wider">الإخبارية</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 lg:px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-base lg:text-lg relative overflow-hidden group ${
                  pathname === item.path
                    ? "bg-gradient-to-r from-gold-dark to-gold text-accent-foreground shadow-lg"
                    : "hover:bg-white/10 text-primary-foreground"
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                {pathname !== item.path && (
                  <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                )}
              </Link>
            ))}
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-5 py-3 rounded-xl transition-all duration-300 font-bold ${
                  pathname === item.path
                    ? "bg-gradient-to-r from-gold-dark to-gold text-accent-foreground shadow-md"
                    : "hover:bg-white/10 text-primary-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
