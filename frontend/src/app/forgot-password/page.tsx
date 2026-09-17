export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <section className="card w-full max-w-md p-8 text-center">
        <h1 className="text-headline-md text-on-surface mb-3">ลืมรหัสผ่าน?</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          กรุณาติดต่อผู้ดูแลระบบของบริษัทเพื่อรีเซ็ตรหัสผ่านและยืนยันตัวตน
        </p>
        <a className="btn-primary inline-flex items-center justify-center px-6 py-3" href="mailto:support@netzero.local?subject=Reset%20password">
          ติดต่อผู้ดูแลระบบ
        </a>
      </section>
    </main>
  );
}
