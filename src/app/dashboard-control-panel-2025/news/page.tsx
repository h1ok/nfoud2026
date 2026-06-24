import Link from 'next/link';
import { Plus } from 'lucide-react';
import AdminNewsManager from '@/components/AdminNewsManager';

export default function DashboardNewsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">إدارة الأخبار</h2>
          <p className="mt-2 text-muted-foreground">تحكم كامل في عرض الأخبار والبحث والتعديل والحذف.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard-control-panel-2025/news/new" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-primary transition hover:opacity-90">
            <Plus size={16} />
            <span>إنشاء خبر</span>
          </Link>
          <Link href="/api/webhook-add-news" className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold/10">
            <Plus size={16} />
            <span>واجهة إضافة الأخبار</span>
          </Link>
        </div>
      </div>

      <AdminNewsManager />
    </section>
  );
}
