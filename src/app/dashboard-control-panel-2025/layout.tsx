import DashboardNav from '@/components/dashboard/DashboardNav';
import AuthGuard from '@/components/dashboard/AuthGuard';

export const metadata = {
  title: 'لوحة التحكم - نفود الإخبارية',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav user={null} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
