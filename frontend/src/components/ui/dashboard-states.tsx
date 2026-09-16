export function DashboardLoading() {
  return (
    <div role="status" aria-label="กำลังโหลด" className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 rounded-lg bg-surface-container-high" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl bg-surface-container-high" />)}
      </div>
      <div className="h-48 rounded-xl bg-surface-container-high" />
    </div>
  );
}

export function DashboardEmpty({ message = "ยังไม่มีข้อมูล" }: { message?: string }) {
  return (
    <div role="status" className="card flex min-h-40 items-center justify-center p-6 text-center text-on-surface-variant">
      <div>
        <span aria-hidden="true" className="material-symbols-outlined mb-2 text-3xl">inbox</span>
        <p>{message}</p>
      </div>
    </div>
  );
}
