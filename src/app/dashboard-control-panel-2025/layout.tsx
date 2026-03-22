import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import DashboardNav from '@/components/dashboard/DashboardNav';

export const metadata = {
  title: 'لوحة التحكم - نفود الإخبارية',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
