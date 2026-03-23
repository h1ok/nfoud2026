import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: `فريق التحرير | ${SITE_NAME}`,
  description: 'تعرف على فريق التحرير والمحررين المتخصصين في تغطية الأخبار السعودية والعربية في موقع نفود',
  alternates: {
    canonical: `${SITE_URL}/authors`,
  },
};

export default function AuthorsPage() {
  const authors = [
    {
      name: 'فريق تحرير نفود',
      role: 'فريق التحرير',
      bio: 'فريق من المحررين والصحفيين المتخصصين في تغطية الأخبار السعودية والعربية، مع خبرة تزيد عن 10 سنوات في المجال الإعلامي',
      expertise: ['السياسة السعودية', 'الاقتصاد السعودي', 'الأخبار العاجلة', 'التغطية الإخبارية', 'التحليل السياسي'],
      image: '/nafud-logo.png',
      articles: '500+',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">فريق التحرير</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            يلتزم فريق تحرير نفود بتقديم محتوى إخباري دقيق وموثوق، مع التركيز على المهنية والنزاهة في تغطية الأحداث السعودية والعربية
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {authors.map((author, index) => (
            <article key={index} className="bg-card rounded-2xl p-8 border border-border/50 hover:border-gold/50 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full flex items-center justify-center mb-6">
                  <img
                    src={author.image}
                    alt={author.name}
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{author.name}</h2>
                <p className="text-gold font-medium mb-4">{author.role}</p>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {author.bio}
                </p>
                
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-foreground mb-3">مجالات الخبرة:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {author.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  عدد المقالات: <span className="text-gold font-bold">{author.articles}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="bg-card rounded-2xl p-8 border border-border/50">
          <h2 className="text-3xl font-bold mb-6 text-center">معاييرنا التحريرية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">الدقة والموثوقية</h3>
              <p className="text-muted-foreground">
                نلتزم بالتحقق من جميع المعلومات قبل نشرها وضمان دقة المصادر
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">النزاهة والموضوعية</h3>
              <p className="text-muted-foreground">
                نقدم تغطية متوازنة وموضوعية دون تحيز أو تأثير خارجي
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-2">السرعة والدقة</h3>
              <p className="text-muted-foreground">
                نحرص على تقديم الأخبار العاجلة بسرعة مع الحفاظ على دقة المعلومات
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
