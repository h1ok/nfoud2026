import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold text-muted-foreground/30 mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4 text-foreground">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
            <Link href="/all-news">
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                تصفح الأخبار
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
