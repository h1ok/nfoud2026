import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { News, LiveEvent } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import LiveEventCard from '@/components/LiveEventCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FaqSection';
import { faqSchema, FaqItem } from '@/lib/schema';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { TrendingUp, Newspaper, Globe, Trophy, ChevronLeft, Radio } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
    description: SITE_DESCRIPTION,
  },
};

async function getFeaturedNews(): Promise<News[]> {
  try {
    const { data: linkedNews } = await supabaseServer
      .from('live_event_updates')
      .select('source_news_id, live_events!inner(status)')
      .not('source_news_id', 'is', null)
      .eq('live_events.status', 'active');

    const linkedNewsIds = linkedNews?.map((item: any) => item.source_news_id).filter(Boolean) || [];

    const query = supabaseServer
      .from('news')
      .select('*, editors(name, position)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (linkedNewsIds.length > 0) {
      query.not('id', 'in', `(${linkedNewsIds.join(',')})`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching news:', error);
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
    const { data, error } = await supabaseServer
      .from('live_events')
      .select('*, live_event_updates(count)')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching live events:', error);
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

const faqItems: FaqItem[] = [
  {
    question: 'ما معنى كلمة "نفود"؟',
    answer:
      'كلمة "نفود" تعني في اللغة العربية الصحراء الرملية الواسعة ذات الكثبان المرتفعة، وقد اخترنا هذا الاسم ليكون عنواناً لشبكتنا الإخبارية لأنه يرمز إلى الأصالة السعودية والامتداد والاتساع، تماماً كما تسعى "شبكة نفود الإخبارية" (nfoud.com) لتغطية الأخبار من كل أنحاء المملكة والعالم العربي.',
  },
  {
    question: 'ما هو النفود؟',
    answer:
      'النفود هو نوع من الصحاري الرملية المعروفة في شبه الجزيرة العربية، وأشهرها صحراء النفود الكبير في شمال المملكة العربية السعودية، وتتميز بكثبانها الرملية الحمراء الشاهقة. وقد استلهمت "شبكة نفود الإخبارية" اسمها من هذا المعلم الجغرافي السعودي العريق لتقدّم محتوى إخبارياً سعودي الهوية مدعوماً بالذكاء الاصطناعي.',
  },
  {
    question: 'ما هي شبكة نفود الإخبارية؟',
    answer:
      'شبكة نفود الإخبارية (nfoud.com) هي أول شبكة أخبار سعودية مدعومة بالذكاء الاصطناعي، تقدّم آخر الأخبار والتحليلات السياسية والاقتصادية والمحلية والرياضية من المملكة العربية السعودية والعالم العربي، مع تغطيات حية على مدار الساعة تجمع بين الموثوقية الصحفية وتقنيات الذكاء الاصطناعي.',
  },
  {
    question: 'كيف شكل النفود؟',
    answer:
      'يتميّز النفود بكثبانه الرملية الحمراء الواسعة والمتموّجة التي تمتد على مساحات شاسعة، وتعدّ من أجمل التضاريس الصحراوية في المملكة العربية السعودية. ونحن في شبكة نفود الإخبارية نستلهم من هذا الامتداد والجمال رؤيتنا في تقديم تغطية إخبارية شاملة وعصرية.',
  },
  {
    question: 'هل أخبار شبكة نفود موثوقة؟',
    answer:
      'نعم، تحرص شبكة نفود الإخبارية على تقديم أخبار موثوقة ودقيقة من مصادر معتمدة، حيث يجمع فريق التحرير بين الخبرة الصحفية وتقنيات الذكاء الاصطناعي لمراجعة المحتوى والتأكد من مصداقيته قبل نشره عبر الموقع nfoud.com.',
  },
];

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
      <header className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/nafud-desert-hero.jpg"
            alt="صورة خلفية لصحراء النفود"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <span className="inline-block px-5 py-2.5 bg-accent/90 text-accent-foreground rounded-full text-sm font-extrabold mb-6 animate-fade-in backdrop-blur-sm tracking-wide">
              أخبار حصرية وموثوقة مدعومة بالذكاء الاصطناعي
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 md:mb-6 text-gold animate-fade-in leading-[1.15]" style={{ animationDelay: '0.1s' }}>
              نفود – شبكة أخبار سعودية بالذكاء الاصطناعي
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 animate-fade-in font-bold text-white/95" style={{ animationDelay: '0.2s' }}>
              آخر الأخبار والتحليلات من المملكة والعالم
            </p>
            <p className="hidden sm:block text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-white/80 leading-loose animate-fade-in max-w-2xl font-medium" style={{ animationDelay: '0.3s' }}>
              منصة إخبارية سعودية تجمع بين الموثوقية الصحفية وتقنيات الذكاء الاصطناعي لتقديم أحدث الأخبار السياسية والاقتصادية والمحلية والرياضية بأسلوب عصري واحترافي
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </header>

      {/* Categories Quick Access */}
      <nav className="py-6 sm:py-8 md:py-12 -mt-8 sm:-mt-12 md:-mt-16 relative z-10" aria-label="الوصول السريع للأقسام">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">أقسام الأخبار</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon];
              return (
                <Link
                  key={category.name}
                  href={category.link}
                  className="flex flex-row-reverse items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-card p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border border-border/50 shadow-elegant hover:shadow-xl transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  aria-label={`الانتقال إلى قسم ${category.name}`}
                >
                  <span className="text-sm sm:text-base md:text-lg font-bold group-hover:text-gold transition-colors">{category.name}</span>
                  <div className="p-2 sm:p-3 md:p-4 bg-secondary rounded-full group-hover:bg-accent/10 transition-colors">
                    <IconComponent className={`${category.color} group-hover:scale-110 transition-transform duration-300`} size={24} aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        {/* Live Events Section */}
        <section className="mb-12 md:mb-20" aria-labelledby="live-events-heading">
          <header className="flex items-center mb-6 md:mb-12">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-destructive animate-pulse" aria-hidden="true" />
              </div>
              <h2 id="live-events-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">تغطيات حية</h2>
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
        <section className="mb-12 md:mb-20" aria-labelledby="featured-news-heading">
          <header className="flex items-center mb-6 md:mb-12">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <div className="h-1.5 w-16 gradient-gold rounded-full" aria-hidden="true"></div>
              <h2 id="featured-news-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">أحدث الأخبار</h2>
              <div className="h-1.5 flex-1 bg-gradient-to-r from-gold/50 to-transparent rounded-full" aria-hidden="true"></div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl mb-10 md:mb-16" aria-labelledby="newsletter-heading">
          <div className="absolute inset-0 gradient-gold opacity-95" aria-hidden="true"></div>
          <div className="relative p-6 sm:p-10 md:p-16 text-center">
            <h2 id="newsletter-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-primary">اشترك في النشرة الإخبارية</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto text-primary/90 leading-relaxed">
              اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والتحليلات مباشرة في بريدك الإلكتروني
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl text-foreground border-2 border-transparent focus:border-primary focus:outline-none shadow-md text-base md:text-lg"
              />
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap">
                اشترك الآن
              </button>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-10 md:mb-16">
          <Link href="/politics" className="block p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-gold transition-colors">الأخبار السياسية</h3>
            <p className="text-xs md:text-sm text-muted-foreground">آخر التطورات السياسية</p>
          </Link>
          <Link href="/economy" className="block p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-gold transition-colors">الأخبار الاقتصادية</h3>
            <p className="text-xs md:text-sm text-muted-foreground">تقارير اقتصادية شاملة</p>
          </Link>
          <Link href="/local" className="block p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-gold transition-colors">الأخبار المحلية</h3>
            <p className="text-xs md:text-sm text-muted-foreground">أخبار من داخل المملكة</p>
          </Link>
          <Link href="/sports" className="block p-4 md:p-6 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-lg transition-all group">
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-gold transition-colors">الأخبار الرياضية</h3>
            <p className="text-xs md:text-sm text-muted-foreground">كل ما يخص الرياضة</p>
          </Link>
        </section>

        {/* FAQ Section */}
        <FaqSection items={faqItems} />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }}
      />
    </div>
  );
}
