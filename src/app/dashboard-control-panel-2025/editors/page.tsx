import AdminEditorsManager from '@/components/AdminEditorsManager';

export default function DashboardEditorsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">إدارة الكُتّاب</h2>
        <p className="mt-2 text-muted-foreground">إضافة الكُتّاب وتعديلهم وحذفهم وتغيير تصنيفاتهم (التخصصات).</p>
      </div>

      <AdminEditorsManager />
    </section>
  );
}
