export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <section className="card w-full max-w-md p-8 text-center">
        <h1 className="text-headline-md text-on-surface mb-3">ติดต่อ / วิธีใช้งาน</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          หากต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่ NetZeroCarbon
        </p>
        <a className="btn-primary inline-flex items-center justify-center px-6 py-3" href="mailto:support@netzero.local?subject=NetZeroCarbon%20help">
          ติดต่อเจ้าหน้าที่
        </a>
      </section>
    </main>
  );
}
