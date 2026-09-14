"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getApplications,
  approveApplication,
  rejectApplication,
  type ApplicationItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";

type TabKey = "pending" | "verified" | "rejected" | "all";

const tabs: { key: TabKey; label: string }[] = [
  { key: "pending", label: "รอตรวจสอบ" },
  { key: "verified", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ปฏิเสธแล้ว" },
  { key: "all", label: "ทั้งหมด" },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthed(true);
  }, []);

  const fetchApplications = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const status = tab === "all" ? undefined : tab;
      const data = await getApplications(status);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchApplications(activeTab);
  }, [authed, activeTab, fetchApplications]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const result = await approveApplication(id);
      if (result.ok) {
        fetchApplications(activeTab);
      }
    } catch {
      setError("ไม่สามารถอนุมัติได้");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    try {
      const result = await rejectApplication(id, rejectReason);
      if (result.ok) {
        setRejectingId(null);
        setRejectReason("");
        fetchApplications(activeTab);
      }
    } catch {
      setError("ไม่สามารถปฏิเสธได้");
    }
  };

  if (authed === null) return null;

  return (
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">ตรวจสอบใบสมัคร</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            ตรวจสอบและอนุมัติใบสมัครของเกษตรกร
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-label-md font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="neumorphic p-6 text-center rounded-2xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="neumorphic p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="neumorphic p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีรายการในขณะนี้</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((app) => {
              const isReady = app.doc_count >= app.docs_needed;
              const isPending = activeTab === "pending";

              return (
                <div
                  key={app.id}
                  className={`neumorphic rounded-2xl p-5 border-l-4 ${
                    isReady ? "border-primary" : "border-tertiary"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Farmer info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body-lg font-semibold text-on-surface truncate">
                          {app.farmer_name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isReady
                            ? "bg-primary/10 text-primary"
                            : "bg-tertiary/10 text-tertiary"
                        }`}>
                          {isReady ? "พร้อมอนุมัติ" : "เอกสารไม่ครบ"}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant">
                        {app.province} {app.district} | {app.phone}
                      </p>
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        LINE: {app.line_user_id}
                      </p>
                    </div>

                    {/* Doc status */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-body-lg font-bold ${
                          app.doc_count >= app.docs_needed ? "text-primary" : "text-tertiary"
                        }`}>
                          {app.doc_count}/{app.docs_needed}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">เอกสาร</p>
                      </div>
                      <div className="text-center">
                        <p className="text-body-lg font-bold text-on-surface">
                          {app.consent_count}/4
                        </p>
                        <p className="text-[10px] text-on-surface-variant"> consent</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                          disabled={approving === app.id}
                          loading={approving === app.id}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRejectingId(app.id)}
                        >
                          ปฏิเสธ
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Reject form */}
                  {rejectingId === app.id && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/20">
                      <label className="text-label-md text-on-surface block mb-1">เหตุผลที่ปฏิเสธ</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="กรุณาระบุเหตุผล..."
                          className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(app.id)}
                          disabled={!rejectReason.trim()}
                        >
                          ยืนยันปฏิเสธ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setRejectingId(null); setRejectReason(""); }}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
