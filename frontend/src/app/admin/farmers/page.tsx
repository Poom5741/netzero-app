"use client";

import { useState, useEffect, useCallback } from "react";
import { createFarmer, getFarmers, getFarmerDetail, type FarmerDetail, type FarmerListItem } from "@/lib/api";
import { Button } from "@/components/ui/button";

// ── Farmer List Page ──────────────────────────────────────────────

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    queueMicrotask(() => setAuthed(true));
  }, []);

  const loadFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFarmers(await getFarmers());
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => void loadFarmers());
  }, [authed, loadFarmers]);

  const handleCreated = () => {
    setShowCreateForm(false);
    setNotice("เพิ่มเกษตรกรเรียบร้อยแล้ว");
    void loadFarmers();
  };

  if (authed === null) return null;

  return (
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">เกษตรกร</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              รายชื่อเกษตรกรในระบบ
            </p>
          </div>
          <Button type="button" onClick={() => { setNotice(null); setShowCreateForm(true); }}>
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            เพิ่มเกษตรกร
          </Button>
        </div>

        {notice && (
          <div role="status" className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-body-md text-primary">
            {notice}
          </div>
        )}

        {showCreateForm && (
          <CreateFarmerForm onCancel={() => setShowCreateForm(false)} onCreated={handleCreated} />
        )}

        {loading && (
          <div className="card p-6 text-center rounded-2xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && farmers.length === 0 && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีเกษตรกรในระบบ</p>
          </div>
        )}

        {!loading && !error && farmers.length > 0 && (
          <div className="card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface">ชื่อ</th>
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface">CPA</th>
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface">จังหวัด</th>
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">แปลง</th>
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">ความน่าเชื่อถือ</th>
                  <th className="px-4 py-3 text-label-md font-semibold text-on-surface"> Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 cursor-pointer"
                    onClick={() => setSelectedFarmerId(f.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-body-md text-on-surface font-medium">{f.full_name}</p>
                      <p className="text-[11px] text-on-surface-variant">{f.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {f.cpa_code ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                          {f.cpa_code}
                        </span>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-md text-on-surface-variant">
                      {f.addr_province ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-body-md text-on-surface text-right">{f.plot_count}</td>
                    <td className="px-4 py-3 text-right">
                      <TrustBadge score={f.trust_score} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFarmerId(f.id); }}>
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail slide-out panel */}
        {selectedFarmerId && (
          <FarmerDetailPanel
            farmerId={selectedFarmerId}
            onClose={() => setSelectedFarmerId(null)}
          />
        )}
      </div>
    </main>
  );
}

function CreateFarmerForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "unspecified" as "male" | "female" | "unspecified",
    addr_province: "",
    addr_district: "",
    addr_subdistrict: "",
    addr_village: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!form.full_name.trim()) {
      setError("กรุณาระบุชื่อเกษตรกร");
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      setError("เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมีความยาว 10 หลัก)");
      return;
    }

    setSaving(true);
    try {
      const result = await createFarmer({ ...form, phone });
      if (!result.ok) {
        const body = result.data as { message?: string; details?: { message?: string } };
        if (result.status === 409) {
          setError("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว");
        } else if (result.status === 400) {
          setError(body.details?.message ?? body.message ?? "ข้อมูลไม่ถูกต้อง");
        } else {
          setError("ไม่สามารถเพิ่มเกษตรกรได้ กรุณาลองใหม่");
        }
        return;
      }
      onCreated();
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-6 rounded-2xl p-5" aria-labelledby="create-farmer-title">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="create-farmer-title" className="text-headline-md font-semibold text-on-surface">เพิ่มเกษตรกร</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">กรอกชื่อและเบอร์โทรศัพท์เพื่อให้เกษตรกรผูกบัญชีผ่าน LINE</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="ปิดฟอร์ม">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl bg-error/10 px-4 py-3 text-body-sm text-error">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-label-md text-on-surface">
          ชื่อ-นามสกุล <span aria-hidden="true">*</span>
          <input value={form.full_name} onChange={update("full_name")} required maxLength={100} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
        </label>
        <label className="text-label-md text-on-surface">
          เบอร์โทรศัพท์ <span aria-hidden="true">*</span>
          <input value={form.phone} onChange={update("phone")} required inputMode="tel" pattern="0[0-9]{9}" maxLength={12} placeholder="0812345678" className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
        </label>
        <label className="text-label-md text-on-surface">
          เพศ
          <select value={form.gender} onChange={update("gender")} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md">
            <option value="unspecified">ไม่ระบุ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
        </label>
        {(["addr_province", "addr_district", "addr_subdistrict", "addr_village"] as const).map((field) => (
          <label key={field} className="text-label-md text-on-surface">
            {{ addr_province: "จังหวัด", addr_district: "อำเภอ", addr_subdistrict: "ตำบล", addr_village: "หมู่บ้าน" }[field]}
            <input value={form[field]} onChange={update(field)} maxLength={50} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={saving}>บันทึกเกษตรกร</Button>
      </div>
    </form>
  );
}

// ── Trust Badge ────────────────────────────────────────────────────

function TrustBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  let color = "text-error";
  if (pct >= 70) color = "text-primary";
  else if (pct >= 40) color = "text-tertiary";

  return (
    <span className={`text-label-md font-bold ${color}`}>{pct}%</span>
  );
}

// ── Farmer Detail Panel (5 tabs) ──────────────────────────────────

type TabKey = "plots" | "credit" | "nitrogen" | "photos" | "audit";

const tabDefs: { key: TabKey; label: string; icon: string }[] = [
  { key: "plots", label: "แปลง & เอกสาร", icon: "landscape" },
  { key: "credit", label: "CalcTrace", icon: "calculate" },
  { key: "nitrogen", label: "แหล่งไนโตรเจน", icon: "science" },
  { key: "photos", label: "ภาพหลักฐาน", icon: "photo_library" },
  { key: "audit", label: "ประวัติ", icon: "history" },
];

function FarmerDetailPanel({
  farmerId,
  onClose,
}: {
  farmerId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("plots");

  useEffect(() => {
    queueMicrotask(() => setLoading(true));
    getFarmerDetail(farmerId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [farmerId]);

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Slide-out panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-surface-container-low shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div>
            {loading ? (
              <div className="h-6 w-32 bg-surface-container-high rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-headline-md font-bold text-on-surface">{detail?.full_name}</h2>
                <p className="text-label-sm text-on-surface-variant">
                  {detail?.cpa_code ?? "ไม่มี CPA"} | {detail?.province} {detail?.district}
                </p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20 overflow-x-auto">
          {tabDefs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-4 py-3 text-label-md font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-10">
              <div className="flex justify-center gap-2 mb-2">
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              </div>
              <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
            </div>
          )}

          {!loading && detail && activeTab === "plots" && (
            <PlotsTab detail={detail} />
          )}
          {!loading && detail && activeTab === "credit" && (
            <CreditTab detail={detail} />
          )}
          {!loading && detail && activeTab === "nitrogen" && (
            <NitrogenTab detail={detail} />
          )}
          {!loading && detail && activeTab === "photos" && (
            <PhotosTab detail={detail} />
          )}
          {!loading && detail && activeTab === "audit" && (
            <AuditTab detail={detail} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Plots & Documents ──────────────────────────────────────

function PlotsTab({ detail }: { detail: FarmerDetail }) {
  return (
    <div className="space-y-4">
      <h3 className="text-label-lg font-semibold text-on-surface">แปลงที่ดิน</h3>
      {detail.plots.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">ไม่มีแปลงในระบบ</p>
      ) : (
        detail.plots.map((plot) => (
          <div key={plot.id} className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-md font-semibold text-on-surface">{plot.plot_code}</span>
              <span className="text-label-sm text-on-surface-variant">{plot.area_rai} ไร่</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-label-sm text-on-surface-variant">
              <span>โฉนด: {plot.deed_no}</span>
              <span>ประเภท: {plot.doc_type ?? "-"}</span>
              <span>ฤดู: {plot.season_name ?? "-"}</span>
              <span>คาร์บอน: {plot.carbon_total?.toFixed(2) ?? "-"} tCO2e</span>
            </div>
          </div>
        ))
      )}

      <h3 className="text-label-lg font-semibold text-on-surface mt-6">เอกสาร</h3>
      {detail.documents.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">ไม่มีเอกสาร</p>
      ) : (
        <div className="space-y-2">
          {detail.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 card rounded-2xl">
              <span className="text-body-md text-on-surface">{doc.doc_type}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                doc.review_status === "approved"
                  ? "bg-primary/10 text-primary"
                  : doc.review_status === "rejected"
                    ? "bg-error/10 text-error"
                    : "bg-tertiary/10 text-tertiary"
              }`}>
                {doc.review_status === "approved" ? "ผ่าน" : doc.review_status === "rejected" ? "ปฏิเสธ" : "รอตรวจสอบ"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Credit Calculation (CalcTrace) ─────────────────────────

function CreditTab({ detail }: { detail: FarmerDetail }) {
  if (detail.carbonTrace.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีข้อมูลการคำนวณ</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-label-lg font-semibold text-on-surface">CalcTrace (12 ขั้นตอน)</h3>
      <div className="card rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface w-12">#</th>
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface">ขั้นตอน</th>
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">ค่า</th>
            </tr>
          </thead>
          <tbody>
            {detail.carbonTrace.map((entry) => (
              <tr key={entry.step} className="border-b border-outline-variant/10 last:border-0">
                <td className="px-4 py-3 text-label-md text-on-surface-variant">{entry.step}</td>
                <td className="px-4 py-3 text-body-md text-on-surface">{entry.label}</td>
                <td className="px-4 py-3 text-body-md text-on-surface text-right font-mono">{entry.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Nitrogen Source ────────────────────────────────────────

function NitrogenTab({ detail }: { detail: FarmerDetail }) {
  if (detail.nitrogenEntries.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีข้อมูลปุ๋ย</p>;
  }

  const stepLabels: Record<string, string> = {
    base: "ปุ๋ยพื้นฐาน",
    tillering: "ปุ๋ยแตกกอ",
    panicle: "ปุ๋ยออกรวง",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-label-lg font-semibold text-on-surface">แหล่งไนโตรเจน</h3>
      <div className="card rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface">ขั้นตอน</th>
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface">สูตร</th>
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">อัตรา (กก./ไร่)</th>
              <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">ไนโตรเจน (กก./ไร่)</th>
            </tr>
          </thead>
          <tbody>
            {detail.nitrogenEntries.map((entry, i) => (
              <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                <td className="px-4 py-3 text-body-md text-on-surface">{stepLabels[entry.step] ?? entry.step}</td>
                <td className="px-4 py-3 text-body-md text-on-surface font-mono">{entry.formula}</td>
                <td className="px-4 py-3 text-body-md text-on-surface text-right">{entry.rate_kg_per_rai}</td>
                <td className="px-4 py-3 text-body-md text-on-surface text-right">{entry.nitrogen_kg_per_rai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Photo Evidence ─────────────────────────────────────────

function PhotosTab({ detail }: { detail: FarmerDetail }) {
  if (detail.photos.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีภาพหลักฐาน</p>;
  }

  const photoTypeLabels: Record<string, string> = {
    prepare: "เตรียมพื้นที่",
    wetdry: "น้ำขัง/แห้ง",
    harvest: "เก็บเกี่ยว",
  };

  const statusColors: Record<string, string> = {
    verified: "bg-primary/10 text-primary",
    rejected: "bg-error/10 text-error",
    pending: "bg-tertiary/10 text-tertiary",
    pass: "bg-primary/10 text-primary",
    flag: "bg-tertiary/10 text-tertiary",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-label-lg font-semibold text-on-surface">ภาพหลักฐาน</h3>
      <div className="grid grid-cols-2 gap-3">
        {detail.photos.map((photo) => (
          <div key={photo.id} className="card rounded-2xl p-3">
            <div className="aspect-square bg-surface-container-high rounded-lg mb-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-3xl">image</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">
                {photoTypeLabels[photo.photo_type ?? ""] ?? photo.photo_type ?? "-"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[photo.admin_status] ?? "bg-surface-container-high text-on-surface-variant"}`}>
                {photo.admin_status === "verified" ? "ผ่าน" : photo.admin_status === "rejected" ? "ปฏิเสธ" : "รอตรวจ"}
              </span>
            </div>
            {photo.water_state && (
              <p className="text-[10px] text-on-surface-variant mt-1">{photo.water_state}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Audit Log ──────────────────────────────────────────────

function AuditTab({ detail }: { detail: FarmerDetail }) {
  if (detail.auditLog.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีประวัติ</p>;
  }

  const actionLabels: Record<string, string> = {
    verified: "อนุมัติ",
    rejected: "ปฏิเสธ",
    superseded: "แทนที่",
    promoted: "ยกระดับ",
    reject_application: "ปฏิเสธใบสมัคร",
    approve_application: "อนุมัติใบสมัคร",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-label-lg font-semibold text-on-surface">ประวัติการดำเนินการ</h3>
      <div className="space-y-3">
        {detail.auditLog.map((entry) => (
          <div key={entry.id} className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-body-md font-medium text-on-surface">
                {actionLabels[entry.action] ?? entry.action}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {new Date(entry.created_at).toLocaleString("th-TH")}
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              โดย: {entry.actor_type === "admin" ? "แอดมิน" : "ระบบ"}
            </p>
            {entry.field_name && (
              <p className="text-[11px] text-on-surface-variant mt-1">
                {entry.field_name}: {entry.old_value} → {entry.new_value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
