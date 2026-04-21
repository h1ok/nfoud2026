export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { supabaseServer } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'تعرف على شبكة نفود الإخبارية - أول شبكة أخبار سعودية مدعومة بالذكاء الاصطناعي',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/about`,
    title: `من نحن | ${SITE_NAME}`,
    description: 'تعرف على شبكة نفود الإخبارية - أول شبكة أخبار سعودية مدعومة بالذكاء الاصطناعي',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `من نحن | ${SITE_NAME}`,
    description: 'تعرف على شبكة نفود الإخبارية - أول شبكة أخبار سعودية مدعومة بالذكاء الاصطناعي',
  },
};

interface Editor {
  id: string;
  name: string;
  position: string | null;
  bio: string | null;
}

async function getEditors(): Promise<Editor[]> {
  const { data, error } = await supabaseServer
    .from('editors')
    .select('id, name, position, bio')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching editors:', error);
    return [];
  }

  return data || [];
}

export default async function AboutPage() {
  const editors = await getEditors();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">من نحن</h1>
          <p className="text-base md:text-xl text-gold">تعرف على شبكة نفود الإخبارية</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-card rounded-xl shadow-elegant border border-border/50 p-6 md:p-10">
          <div className="space-y-6">
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              <strong>{SITE_NAME}</strong> هي شبكة الأخبار السعودية الأولى المدعومة بالذكاء الاصطناعي،
              نقدم تغطية شاملة وموثوقة لآخر الأخبار من المملكة العربية السعودية والعالم العربي.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-foreground border-r-4 border-gold pr-4">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              نسعى لأن نكون المصدر الأول والأكثر موثوقية للأخبار في المملكة العربية السعودية،
              من خلال الجمع بين الصحافة الاحترافية وتقنيات الذكاء الاصطناعي المتقدمة.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-foreground border-r-4 border-gold pr-4">مهمتنا</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-gold mt-1">✦</span>تقديم أخبار دقيقة وموثوقة على مدار الساعة</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-1">✦</span>تغطية شاملة للأحداث السياسية والاقتصادية والمحلية والرياضية</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-1">✦</span>استخدام الذكاء الاصطناعي لتحسين جودة المحتوى وسرعة التغطية</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-1">✦</span>الالتزام بأعلى معايير الأخلاقيات الصحفية</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold text-foreground border-r-4 border-gold pr-4">ما يميزنا</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-secondary p-5 rounded-xl border border-border/50">
                <h3 className="font-bold text-base md:text-lg mb-2 text-gold">تغطية فورية</h3>
                <p className="text-muted-foreground text-sm md:text-base">نقدم تغطية حية للأحداث العاجلة مع تحديثات مستمرة</p>
              </div>
              <div className="bg-secondary p-5 rounded-xl border border-border/50">
                <h3 className="font-bold text-base md:text-lg mb-2 text-gold">ذكاء اصطناعي</h3>
                <p className="text-muted-foreground text-sm md:text-base">نستخدم AI لتحليل الأخبار وتقديم رؤى معمقة</p>
              </div>
              <div className="bg-secondary p-5 rounded-xl border border-border/50">
                <h3 className="font-bold text-base md:text-lg mb-2 text-gold">موثوقية</h3>
                <p className="text-muted-foreground text-sm md:text-base">نلتزم بالدقة والحيادية في جميع تقاريرنا</p>
              </div>
              <div className="bg-secondary p-5 rounded-xl border border-border/50">
                <h3 className="font-bold text-base md:text-lg mb-2 text-gold">تجربة مستخدم متميزة</h3>
                <p className="text-muted-foreground text-sm md:text-base">موقع سريع وسهل الاستخدام على جميع الأجهزة</p>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-foreground border-r-4 border-gold pr-4">اتصل بنا</h2>
            <p className="text-muted-foreground">
              للاستفسارات والتواصل: <a href="mailto:info@nfoud.com" className="text-gold hover:text-gold/80 font-medium transition-colors">info@nfoud.com</a>
            </p>

            {editors.length > 0 && (
              <section className="pt-4" aria-label="الكتّاب">
                <div className="mb-6 md:mb-8 rounded-2xl border border-gold/20 bg-gradient-to-br from-primary to-primary/90 p-6 md:p-8 text-primary-foreground shadow-elegant">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-8 w-1 rounded-full bg-gold"></span>
                    <h2 className="text-2xl md:text-3xl font-bold text-gold">كتّاب نفود</h2>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-primary-foreground/85 max-w-3xl">
                    نخبة من الكتّاب والمحررين يقدّمون محتوى خبرياً وتحليلياً باحترافية، مع التزام بالدقة والوضوح ومواكبة الأحداث محلياً وإقليمياً ودولياً.
                  </p>
                </div>
                <div className="space-y-5 md:space-y-6">
                  {editors.map((editor) => (
                    <article key={editor.id} className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-card to-secondary/70 p-6 md:p-8 shadow-elegant transition-all duration-300 hover:border-gold/40 hover:shadow-xl">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold/30 via-gold to-gold/30"></div>
                      <div className="flex items-start gap-4 md:gap-6">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground text-2xl font-bold shadow-md ring-4 ring-gold/10">
                          {editor.name?.charAt(0) || '✍'}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <h3 className="font-bold text-xl md:text-2xl text-foreground">{editor.name}</h3>
                            <span className="inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs md:text-sm font-medium text-gold">
                              {editor.position || 'محرر'}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm md:text-base leading-loose max-w-3xl">
                            {editor.bio || 'كاتب ومحرر في شبكة نفود الإخبارية.'}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
