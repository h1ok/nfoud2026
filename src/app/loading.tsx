export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent mb-4"></div>
        <p className="text-xl font-bold text-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}
