"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterTabs, type FilterTab } from "@/components/admin-review/filter-tabs";
import { ReviewCard } from "@/components/admin-review/review-card";
import { ReviewDetailPanel } from "@/components/admin-review/review-detail-panel";
import { getReviewQueue, reviewPhoto, type PhotoReview } from "@/lib/api";

const sidebarEntries = [
  { key: "review", label: "ตรวจสอบภาพ", href: "/admin", icon: "rate_review", active: true },
];

const filterTabs: FilterTab[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอตรวจสอบ" },
  { key: "flagged", label: "ถูกธง" },
  { key: "verified", label: "ผ่านแล้ว" },
  { key: "rejected", label: "ปฏิเสธแล้ว" },
];

const filterToApiStatus: Record<string, string | undefined> = {
  all: undefined,
  pending: "pending",
  flagged: "flagged",
  verified: "verified",
  rejected: "rejected",
};

export default function AdminReviewPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queue, setQueue] = useState<PhotoReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchQueue = useCallback(async (filter: string) => {
    // Prevent duplicate calls for same filter
    if (fetchedRef.current.has(filter)) {
      return;
    }
    fetchedRef.current.add(filter);

    setLoading(true);
    setError(null);
    try {
      const data = await getReviewQueue(filterToApiStatus[filter]);
      setQueue(data);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(activeFilter);
  }, [activeFilter, fetchQueue]);

  const selectedReview = queue.find((r) => r.id === selectedId) ?? null;

  const handleApprove = async (id: string) => {
    try {
      await reviewPhoto(id, "verified");
      setSelectedId(null);
      fetchQueue(activeFilter);
    } catch {
      setError("ไม่สามารถอนุมัติได้ กรุณาลองใหม่");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await reviewPhoto(id, "rejected", reason);
      setSelectedId(null);
      fetchQueue(activeFilter);
    } catch {
      setError("ไม่สามารถปฏิเสธได้ กรุณาลองใหม่");
    }
  };

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <DashboardSidebar
          entries={sidebarEntries}
          userName="System Admin"
          userEmail="admin@netzerocarbon.com"
        />
      </div>
      <div className="hidden lg:block">
        <DashboardHeader userLabel="Admin" />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/60 backdrop-blur-xl z-40 px-4 flex items-center shadow-sm">
        <span data-testid="mobile-brand" className="text-headline-md font-bold text-on-surface">NetZero</span>
        <span className="ml-4 text-body-md text-on-surface font-semibold">Review Queue</span>
      </header>

      <main className="lg:ml-72 pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-headline-lg font-bold text-on-surface">Review Queue</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            ตรวจสอบและอนุมัติภาพถ่ายหลักฐานจากเกษตรกร
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <FilterTabs tabs={filterTabs} activeKey={activeFilter} onChange={handleFilterChange} />
        </div>

        {/* Content area */}
        <div className="flex gap-6">
          {/* Grid area */}
          <section className="flex-1 min-w-0" aria-label="รายการตรวจสอบ">
            {error && (
              <div className="neumorphic p-6 text-center">
                <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
                <p className="text-body-md text-on-surface mb-2">{error}</p>
                {error.includes("401") && (
                  <p className="text-sm text-on-surface-variant mb-4">
                    กรุณาเข้าสู่ระบบเพื่อดูข้อมูล
                  </p>
                )}
                <button
                  onClick={() => fetchQueue(activeFilter)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            )}

            {loading && !error && (
              <div className="neumorphic p-6 text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                  <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                  <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                </div>
                <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
              </div>
            )}

            {!loading && !error && queue.length === 0 && (
              <div className="neumorphic p-6 text-center">
                <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
                <p className="text-body-md text-on-surface-variant">ไม่มีรายการในขณะนี้</p>
              </div>
            )}

            {!loading && !error && queue.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {queue.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    selected={review.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Detail panel */}
          {selectedReview && (
            <ReviewDetailPanel
              review={selectedReview}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
