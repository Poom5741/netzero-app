"use client";

import { useState, useEffect } from "react";
import { getReports, downloadReport, type ReportItem } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    getReports()
      .then((data) => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("ไม่สามารถโหลดข้อมูลได้"); setLoading(false); });
  }, [authed]);

  const handleDownload = async (reportId: string) => {
    setDownloading(reportId);
    try {
      await downloadReport(reportId);
      // In a real implementation, this would trigger a file download
    } catch {
      setError("ไม่สามารถดาวน์โหลดรายงานได้");
    } finally {
      setDownloading(null);
    }
  };

  if (authed === null) return null;

  return (
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">รายงาน</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            แคตตาล็อกรายงานและดาวน์โหลด
          </p>
        </div>

        {loading && (
          <div className="neumorphic p-6 text-center rounded-xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="neumorphic p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="neumorphic p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีรายงาน</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`neumorphic rounded-xl p-5 ${
                  !report.ready ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      report.ready ? "bg-primary/10" : "bg-surface-container-high"
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${
                        report.ready ? "text-primary" : "text-outline"
                      }`}>
                        {report.format === "PDF" ? "picture_as_pdf" : "table_chart"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-body-md font-semibold text-on-surface">{report.name}</h3>
                      <p className="text-[10px] text-on-surface-variant">{report.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    report.format === "PDF"
                      ? "bg-error/10 text-error"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {report.format}
                  </span>
                </div>

                <p className="text-label-sm text-on-surface-variant mb-4">{report.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${
                    report.ready ? "text-primary" : "text-tertiary"
                  }`}>
                    {report.ready ? "พร้อมดาวน์โหลด" : "ยังไม่พร้อม"}
                  </span>
                  <Button
                    variant={report.ready ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    disabled={!report.ready || downloading === report.id}
                    loading={downloading === report.id}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    ดาวน์โหลด
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
