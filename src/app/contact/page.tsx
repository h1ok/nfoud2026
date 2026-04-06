import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'تواصل مع فريق شبكة نفود الإخبارية',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    title: `اتصل بنا | ${SITE_NAME}`,
    description: 'تواصل مع فريق شبكة نفود الإخبارية',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `اتصل بنا | ${SITE_NAME}`,
    description: 'تواصل مع فريق شبكة نفود الإخبارية',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">اتصل بنا</h1>
          <p className="text-base md:text-xl text-gold">نحن هنا للاستماع إليك</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-card rounded-xl shadow-elegant border border-border/50 p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-4 p-5 bg-secondary rounded-xl border border-border/50">
              <div className="p-3 bg-accent/10 rounded-full">
                <Mail className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-1">البريد الإلكتروني</h3>
                <a href="mailto:info@nfoud.com" className="text-gold hover:text-gold/80 transition-colors font-medium">
                  info@nfoud.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-secondary rounded-xl border border-border/50">
              <div className="p-3 bg-accent/10 rounded-full">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-1">الموقع</h3>
                <p className="text-muted-foreground">المملكة العربية السعودية</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">تابعنا على وسائل التواصل</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <a 
                href="https://x.com/Nfoud_ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground p-4 rounded-xl text-center hover:bg-primary/80 transition-colors font-medium border border-gold/20"
              >
                تويتر (X)
              </a>
              <a 
                href="https://www.instagram.com/nfooud.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 to-pink-500 text-white p-4 rounded-xl text-center hover:opacity-90 transition-opacity font-medium"
              >
                إنستغرام
              </a>
              <a 
                href="https://www.tiktok.com/@nfoud_ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground p-4 rounded-xl text-center hover:bg-primary/80 transition-colors font-medium border border-gold/20"
              >
                تيك توك
              </a>
              <a 
                href="https://www.snapchat.com/add/nfoudnews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent text-accent-foreground p-4 rounded-xl text-center hover:bg-accent/80 transition-colors font-medium"
              >
                سناپ شات
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
