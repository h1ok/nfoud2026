import AdminCategoriesManager from '@/components/AdminCategoriesManager';

export default function DashboardCategoriesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">إدارة التصنيفات</h2>
        <p className="mt-2 text-muted-foreground">إضافة أقسام جديدة (مثل التقنية والذكاء الاصطناعي) وتعديلها وحذفها.</p>
      </div>

      <AdminCategoriesManager />
    </section>
  );
}
