import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { News, LiveEvent } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import LiveEventCard from '@/components/LiveEventCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrendingUp, Newspaper, Globe, Trophy, ChevronLeft, Radio } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

async function getFeaturedNews(): Promise<News[]> {
  try {
    const { data: linkedNews } = await supabase
      .from('live_event_updates')
      .select('source_news_id, live_events!inner(status)')
      .not('source_news_id', 'is', null)
      .eq('live_events.status', 'active');

    const linkedNewsIds = Array.from(new Set(linkedNews?.map((item: any) => item.source_news_id).filter(Boolean) || []));

    const query = supabase
      .from('news')
      .select('*') // Removed ', editors(name, position)' as relationship is missing
      .order('created_at', { ascending: false })
      .limit(20);

    // If there are too many linkedNewsIds, it causes a Headers Overflow Error in the HTTP request.
    // We limit the exclude list to a reasonable number to prevent the URL from getting too long.
    // UUIDs are ~36 chars long, so 20 of them is ~720 chars, which is very safe.
    const safeLinkedNewsIds = linkedNewsIds.slice(0, 20);

    if (safeLinkedNewsIds.length > 0) {
      query.not('id', 'in', `(${safeLinkedNewsIds.join(',')})`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching news:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []).slice(0, 6);
  } catch (error) {
    console.error('Error in getFeaturedNews:', error);
    return [];
  }
}

async function getLiveEvents(): Promise<LiveEvent[]> {
  try {
    const { data, error } = await supabase
      .from('live_events')
      .select('*') // Removed ', live_event_updates(count)' as relationship is missing
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching live events:', JSON.stringify(error, null, 2));
      return [];
    }

    return data?.map((event: any) => ({
      ...event,
      updates_count: event.live_event_updates?.[0]?.count || 0
    })) || [];
  } catch (error) {
    console.error('Error in getLiveEvents:', error);
    return [];
  }
}

const categories = [
  { name: "سياسية", icon: "Globe", color: "text-blue-500", link: "/politics" },
  { name: "اقتصادية", icon: "TrendingUp", color: "text-green-500", link: "/economy" },
  { name: "محلية", icon: "Newspaper", color: "text-purple-500", link: "/local" },
  { name: "رياضية", icon: "Trophy", color: "text-red-500", link: "/sports" },
];

const iconMap: Record<string, any> = { Globe, TrendingUp, Newspaper, Trophy };

export default async function Home() {
  const [featuredNews, liveEvents] = await Promise.all([
    getFeaturedNews(),
    getLiveEvents()
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />
      
      {/* Hero Section */}
      <header className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/nafud-desert-hero.jpg"
            alt="صورة خلفية لصحراء النفود"
            fill
            className="object-cover scale-105 animate-pulse-slow"
            priority
            quality={85}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/90 to-primary/60"></div>
          {/* Decorative CSS Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="text-white max-w-5xl mt-16">
            <span className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-2xl text-sm font-black mb-8 animate-fade-in shadow-xl tracking-wider uppercase">
              أول شبكة سعودية تعمل بالذكاء الاصطناعي
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-dark animate-fade-in leading-[1.2]" style={{ animationDelay: '0.1s' }}>
              نفود الإخبارية
            </h1>
            <p className="text-2xl md:text-4xl mb-8 animate-fade-in font-bold text-white/95" style={{ animationDelay: '0.2s' }}>
              دقة في نقل الحدث.. وموضوعية في التحليل
            </p>
            <p className="text-lg md:text-2xl mb-12 text-white/80 leading-relaxed animate-fade-in max-w-3xl mx-auto font-medium" style={{ animationDelay: '0.3s' }}>
              منصة إخبارية سعودية تجمع بين الموثوقية الصحفية وتقنيات الذكاء الاصطناعي لتقديم أحدث الأخبار السياسية والاقتصادية والمحلية والرياضية بأسلوب عصري واحترافي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link href="#featured-news-heading" className="px-8 py-4 bg-gradient-to-r from-gold-dark to-gold text-accent-foreground font-black text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                تصفح أحدث الأخبار
              </Link>
              <Link href="#live-events-heading" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-white/20 hover:scale-105 transition-all">
                التغطيات الحية
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
      </header>

      {/* Categories Quick Access */}
      <nav className="py-12 -mt-20 relative z-10" aria-label="الوصول السريع للأقسام">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">أقسام الأخبار</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon];
              return (
                <Link
                  key={category.name}
                  href={category.link}
                  className="flex flex-col md:flex-row-reverse items-center justify-center gap-3 md:gap-4 bg-card/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-border shadow-elegant hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  aria-label={`الانتقال إلى قسم ${category.name}`}
                >
                  <span className="text-xl md:text-2xl font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gold-dark group-hover:to-gold transition-all">{category.name}</span>
                  <div className="p-4 md:p-5 bg-secondary/50 rounded-2xl group-hover:bg-accent/10 group-hover:scale-110 transition-all duration-500">
                    <IconComponent className={`${category.color} drop-shadow-md`} size={32} aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Live Events Section */}
        <section className="mb-20" aria-labelledby="live-events-heading">
          <header className="flex items-center mb-12">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Radio className="w-6 h-6 text-destructive animate-pulse" aria-hidden="true" />
              </div>
              <h2 id="live-events-heading" className="text-4xl font-bold text-foreground">تغطيات حية</h2>
              <div className="h-1.5 flex-1 bg-gradient-to-r from-destructive/50 to-transparent rounded-full" aria-hidden="true"></div>
            </div>
          </header>
          
          {liveEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveEvents.map((event, index) => (
                <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <LiveEventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <Link href="/live" className="block">
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-border/50 hover:border-gold/30 transition-all duration-300 cursor-pointer group">
                {/* Radar Animation */}
                <div className="relative w-40 h-40 mb-8">
                  <div className="absolute inset-0 rounded-full border border-destructive/15" />
                  <div className="absolute inset-4 rounded-full border border-destructive/20" />
                  <div className="absolute inset-8 rounded-full border border-destructive/25" />
                  <div className="absolute inset-12 rounded-full border border-destructive/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-destructive/10" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-destructive/10" />
                  </div>
                  <div className="absolute inset-0" style={{ animation: 'spin 3s linear infinite' }}>
                    <div className="absolute top-1/2 left-1/2 w-[50%] h-0.5 origin-left -translate-y-1/2 bg-gradient-to-r from-destructive/80 to-destructive/10 rounded-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-4 h-4 bg-destructive/60 rounded-full shadow-[0_0_12px_hsl(var(--destructive)/0.4)] group-hover:shadow-[0_0_20px_hsl(var(--destructive)/0.6)] transition-shadow" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد تغطيات حية حالياً</h3>
                <p className="text-muted-foreground mb-4">الرادار يعمل.. سنعلمك فور بدء أي تغطية جديدة</p>
                <span className="text-gold group-hover:text-gold/80 font-medium flex items-center gap-2 transition-colors">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  تصفح التغطيات المؤرشفة
                </span>
              </div>
            </Link>
          )}
          
          {liveEvents.length > 0 && (
            <div className="flex justify-start mt-8">
              <Link href="/live" className="text-gold hover:text-gold/80 font-bold flex items-center gap-2 transition-colors text-lg group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                عرض جميع التغطيات الحية
              </Link>
            </div>
          )}
        </section>

        {/* Featured News Section */}
        <section className="mb-20" aria-labelledby="featured-news-heading">
          <header className="flex items-center mb-12">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-1.5 w-16 gradient-gold rounded-full" aria-hidden="true"></div>
              <h2 id="featured-news-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">أحدث الأخبار</h2>
              <div className="h-1.5 flex-1 bg-gradient-to-r from-gold/50 to-transparent rounded-full" aria-hidden="true"></div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredNews.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار متاحة حالياً</p>
              </div>
            ) : (
              featuredNews.map((news, index) => (
                <article key={news.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <NewsCard news={news} />
                </article>
              ))
            )}
          </div>
          
          <div className="flex justify-start mt-8">
            <Link href="/all-news" className="text-gold hover:text-gold/80 font-bold flex items-center gap-2 transition-colors text-lg group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              عرض جميع الأخبار
            </Link>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl mb-16" aria-labelledby="newsletter-heading">
          <div className="absolute inset-0 gradient-gold opacity-95" aria-hidden="true"></div>
          <div className="relative p-8 sm:p-12 md:p-16 text-center">
            <h2 id="newsletter-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-primary">اشترك في النشرة الإخبارية</h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto text-primary/90 leading-relaxed">
              اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والتحليلات مباشرة في بريدك الإلكتروني
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-foreground border-2 border-transparent focus:border-primary focus:outline-none shadow-md text-base sm:text-lg"
              />
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                اشترك الآن
              </button>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Link href="/politics" className="block p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">الأخبار السياسية</h3>
            <p className="text-sm text-muted-foreground">آخر التطورات السياسية</p>
          </Link>
          <Link href="/economy" className="block p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">الأخبار الاقتصادية</h3>
            <p className="text-sm text-muted-foreground">تقارير اقتصادية شاملة</p>
          </Link>
          <Link href="/local" className="block p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">الأخبار المحلية</h3>
            <p className="text-sm text-muted-foreground">أخبار من داخل المملكة</p>
          </Link>
          <Link href="/sports" className="block p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">الأخبار الرياضية</h3>
            <p className="text-sm text-muted-foreground">كل ما يخص الرياضة</p>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
