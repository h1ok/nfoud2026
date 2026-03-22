import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/constants';
import { Instagram, Mail } from 'lucide-react';
import { RiTwitterXFill, RiSnapchatFill, RiTiktokFill } from 'react-icons/ri';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-primary to-[#0a1610] text-primary-foreground border-t-[3px] border-gold/40 mt-24 relative overflow-hidden">
      {/* Decorative top pattern */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <Image src="/nafud-logo.png" alt="نفود" width={80} height={80} className="h-20 w-20 drop-shadow-xl" />
              <div className="flex flex-col">
                <span className="text-gold font-black text-3xl md:text-4xl tracking-tight">شبكة نفود</span>
                <span className="text-gold/90 text-sm font-semibold tracking-widest uppercase mt-1">الإخبارية</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-8 leading-loose text-base max-w-md font-medium">
              شبكة نفود الإخبارية - مصدرك الموثوق للأخبار من المملكة العربية السعودية والعالم. نقدم لكم آخر الأخبار السياسية والاقتصادية والمحلية والرياضية على مدار الساعة بمصداقية واحترافية.
            </p>
            <div className="flex gap-4">
              <a href="https://www.tiktok.com/@nfoud_ai" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-gold hover:text-primary transition-all duration-300 shadow-lg hover:scale-110" aria-label="TikTok">
                <RiTiktokFill size={22} />
              </a>
              <a href="https://x.com/Nfoud_ai" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-gold hover:text-primary transition-all duration-300 shadow-lg hover:scale-110" aria-label="X (Twitter)">
                <RiTwitterXFill size={22} />
              </a>
              <a href="https://www.instagram.com/nfooud.ai/" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-gold hover:text-primary transition-all duration-300 shadow-lg hover:scale-110" aria-label="Instagram">
                <Instagram size={22} />
              </a>
              <a href="https://www.snapchat.com/add/nfoudnews" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-gold hover:text-primary transition-all duration-300 shadow-lg hover:scale-110" aria-label="Snapchat">
                <RiSnapchatFill size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="روابط القائمة الرئيسية">
            <h3 className="text-white font-black mb-8 text-xl flex items-center gap-2">
              <span className="w-2 h-6 bg-gold rounded-full inline-block"></span>
              روابط سريعة
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'الرئيسية', path: '/' },
                { name: 'سياسية', path: '/politics' },
                { name: 'اقتصادية', path: '/economy' },
                { name: 'محلية', path: '/local' },
                { name: 'رياضية', path: '/sports' },
                { name: 'الأحداث الحية', path: '/live' },
              ].map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="text-primary-foreground/70 hover:text-gold font-medium flex items-center gap-3 group transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold group-hover:scale-150 transition-all duration-300" aria-hidden="true"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* About & Contact */}
          <div>
            <h3 className="text-white font-black mb-8 text-xl flex items-center gap-2">
              <span className="w-2 h-6 bg-gold rounded-full inline-block"></span>
              عن الشبكة
            </h3>
            <ul className="space-y-4 mb-10">
              {[
                { name: 'من نحن', path: '/about' },
                { name: 'اتصل بنا', path: '/contact' },
              ].map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="text-primary-foreground/70 hover:text-gold font-medium flex items-center gap-3 group transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold group-hover:scale-150 transition-all duration-300" aria-hidden="true"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <address className="not-italic">
              <a href="mailto:info@nfoud.com" className="flex items-center gap-4 group text-primary-foreground/90 hover:text-gold transition-colors p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30">
                <div className="p-2.5 bg-gold/10 rounded-xl group-hover:bg-gold group-hover:text-primary transition-colors" aria-hidden="true">
                  <Mail size={20} className="text-gold group-hover:text-primary transition-colors" />
                </div>
                <span className="font-bold tracking-wider">info@nfoud.com</span>
              </a>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm font-medium">
            © {currentYear} {SITE_NAME}. جميع الحقوق محفوظة.
          </p>
          <div className="text-primary-foreground/40 text-xs font-semibold tracking-widest uppercase">
            مدعوم بالذكاء الاصطناعي
          </div>
        </div>
      </div>
    </footer>
  );
}
