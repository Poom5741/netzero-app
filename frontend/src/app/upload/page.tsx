"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { PhotoTypePicker } from "@/components/upload/photo-type-picker";
import { VerdictResult } from "@/components/upload/verdict-result";
import { uploadPhoto, type UploadVerdict } from "@/lib/photo";

interface Plot {
  id: string;
  plot_code: string;
  area_rai: number;
  deed_no: string;
}

interface Season {
  id: string;
  name: string;
  status: string;
}

const DEMO_FARMER_ID = "farmer-001";

interface PhotoState {
  preview: string | null;
  gps: { lat: number; lng: number; accuracy: number } | null;
  uploading: boolean;
  verdict: UploadVerdict | null;
  verdictReason: string | null;
  verdictWaterState: string | null;
  error: string | null;
}

function UploadContent() {
  const { userId, isLoading } = useLiff();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [photoType, setPhotoType] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoState>({
    preview: null,
    gps: null,
    uploading: false,
    verdict: null,
    verdictReason: null,
    verdictWaterState: null,
    error: null,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showGpsWarning, setShowGpsWarning] = useState(false);
  const gpsModalRef = useRef<HTMLDivElement>(null);

  const trapFocus = useCallback((modalRef: React.RefObject<HTMLDivElement | null>) => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    modal.addEventListener("keydown", handleTab);
    return () => modal.removeEventListener("keydown", handleTab);
  }, []);

  // Escape key + focus trap for GPS warning modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showGpsWarning) {
        setShowGpsWarning(false);
      }
    };
    if (showGpsWarning) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showGpsWarning]);
  useEffect(() => {
    if (showGpsWarning) return trapFocus(gpsModalRef)?.();
  }, [showGpsWarning, trapFocus]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPhoto((p) => ({
            ...p,
            gps: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
          }));
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  // Derive farmer_id from userId
  const farmerId = userId === "demo-user" ? DEMO_FARMER_ID : userId;

  // Fetch plots on mount
  useEffect(() => {
    if (!farmerId) return;
    apiRequest<{ plots: Plot[] }>(`/api/plots?farmer_id=${farmerId}`)
      .then((res) => {
        if (res.ok) {
          setPlots(res.data.plots);
          if (res.data.plots.length > 0) {
            setSelectedPlot(res.data.plots[0].id);
          }
        }
      })
      .catch(() => {});
  }, [farmerId]);

  // Fetch seasons when plot changes
  useEffect(() => {
    if (!selectedPlot) return;
    apiRequest<{ seasons: Season[] }>(`/api/seasons?plot_id=${selectedPlot}`)
      .then((res) => {
        if (res.ok) {
          setSeasons(res.data.seasons);
          const active = res.data.seasons.find((s) => s.status === "active");
          setSelectedSeason(active?.id || res.data.seasons[0]?.id || "");
        }
      })
      .catch(() => {});
  }, [selectedPlot]);

  function handleCapture() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto((p) => ({
        ...p,
        preview: ev.target?.result as string,
        verdict: null,
        verdictReason: null,
        verdictWaterState: null,
        error: null,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!photo.preview) {
      setPhoto((p) => ({ ...p, error: "กรุณาเลือกรูปก่อนอัปโหลด" }));
      return;
    }
    if (!photoType) {
      setPhoto((p) => ({ ...p, error: "กรุณาเลือกประเภทรูปก่อนอัปโหลด" }));
      return;
    }
    if (!userId) {
      setPhoto((p) => ({ ...p, error: "ไม่สามารถระบุผู้ใช้ได้ กรุณาลองใหม่" }));
      return;
    }
    if (!selectedPlot || !selectedSeason) {
      setPhoto((p) => ({ ...p, error: "กรุณาเลือกแปลงและฤดูกาล" }));
      return;
    }

    // Warn if no GPS but still allow upload
    if (!photo.gps) {
      setShowGpsWarning(true);
      return;
    }

    setPhoto((p) => ({ ...p, uploading: true, error: null, verdict: null }));

    try {
      const res = await fetch(photo.preview);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("photo", blob, "photo.jpg");
      formData.append("plot_id", selectedPlot);
      formData.append("season_id", selectedSeason);
      formData.append("gps_lat", String(photo.gps?.lat || 0));
      formData.append("gps_lng", String(photo.gps?.lng || 0));
      formData.append("gps_accuracy", String(photo.gps?.accuracy || 0));
      formData.append("taken_at", new Date().toISOString());
      formData.append("photo_type", photoType!);

      const result = await uploadPhoto(formData);

      setPhoto((p) => ({
        ...p,
        uploading: false,
        verdict: result.verdict,
        verdictReason: result.reason || null,
        verdictWaterState: result.water_state || null,
      }));
    } catch {
      setPhoto((p) => ({ ...p, uploading: false, verdict: "failure" }));
    }
  }

  function handleRetake() {
    setPhoto({
      preview: null,
      gps: photo.gps,
      uploading: false,
      verdict: null,
      verdictReason: null,
      verdictWaterState: null,
      error: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const navItems = [
    { icon: "chat", label: "แชท", href: "/chat" },
    { icon: "photo_camera", label: "อัปโหลด", href: "/upload", active: true },
    { icon: "bar_chart", label: "สรุปผล", href: "/summary" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-3 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  // Show verdict result
  if (photo.verdict) {
    return (
      <div className="flex flex-col h-screen bg-surface-container-low">
        <header className="glass fixed top-0 w-full z-50 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-5 flex items-center">
            <span className="font-headline-md text-headline-md text-on-surface">ผลการตรวจสอบ</span>
          </div>
        </header>
        <main className="flex-1 pt-16 pb-24 px-5 flex items-center justify-center overflow-y-auto">
          <div className="w-full card rounded-2xl">
            <VerdictResult
              verdict={photo.verdict}
              reason={photo.verdictReason || undefined}
              water_state={photo.verdictWaterState || undefined}
              onRetake={photo.verdict === "refused" ? handleRetake : undefined}
            />
          </div>
        </main>
        <BottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-container-low">
      <header className="glass fixed top-0 w-full z-50 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">eco</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">อัปโหลดรูป</span>
          </div>
          {!gpsLoading && (
            <div className={`card-inset px-3 py-1 rounded-full flex items-center gap-1 ${!photo.gps ? 'border border-error/30' : ''}`}>
              <span className={`material-symbols-outlined text-[14px] ${photo.gps ? 'text-primary' : 'text-error'}`}>
                {photo.gps ? 'location_on' : 'location_off'}
              </span>
              <span className="text-[12px] text-on-surface-variant">
                {photo.gps
                  ? `${photo.gps.lat.toFixed(4)}, ${photo.gps.lng.toFixed(4)}`
                  : "ไม่มี GPS"}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pt-16 pb-24 px-5 overflow-y-auto">
        {!photo.preview ? (
          <div className="flex flex-col gap-5">
            {/* Plot & Season Selector */}
            {plots.length > 0 && (
              <div className="card rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-label-md font-medium text-on-surface-variant block mb-1">แปลงนา</label>
                  <select
                    value={selectedPlot}
                    onChange={(e) => setSelectedPlot(e.target.value)}
                    className="w-full px-3 py-2 pr-8 rounded-xl bg-surface-container-low text-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#028E91] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%236c7b6b%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
                  >
                    {plots.map((p) => (
                      <option key={p.id} value={p.id}>{p.plot_code} — {p.area_rai} ไร่</option>
                    ))}
                  </select>
                </div>
                {seasons.length > 0 && (
                  <div>
                    <label className="text-label-md font-medium text-on-surface-variant block mb-1">ฤดูกาล</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="w-full px-3 py-2 pr-8 rounded-xl bg-surface-container-low text-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#028E91] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%236c7b6b%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
                    >
                      {seasons.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}{s.status === "active" ? " (ปัจจุบัน)" : ""}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Photo Type Picker */}
            <PhotoTypePicker value={photoType} onChange={setPhotoType} />

            {/* Camera frame */}
            <div
              data-testid="camera-frame"
              role="button"
              tabIndex={0}
              aria-label="ถ่ายรูป"
              onClick={handleCapture}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCapture(); }}
              className="w-full card rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer"
              style={{ aspectRatio: "1 / 1" }}
            >
              <div className="absolute inset-4 border-2 border-primary/30 rounded-xl pointer-events-none" />
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="w-6 h-6 border-l-2 border-t-2 border-primary rounded-tl-lg" />
                <div className="w-6 h-6 border-r-2 border-t-2 border-primary rounded-tr-lg" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="w-6 h-6 border-l-2 border-b-2 border-primary rounded-bl-lg" />
                <div className="w-6 h-6 border-r-2 border-b-2 border-primary rounded-br-lg" />
              </div>
              <div className="flex flex-col items-center gap-3 text-on-surface-variant px-8">
                <span className="material-symbols-outlined text-5xl text-primary/40">photo_camera</span>
                <p className="text-body-md text-center leading-relaxed">แตะเพื่อถ่ายรูปแปลงนา</p>
                <p className="text-label-md text-center text-on-surface-variant leading-relaxed">
                  จัดให้ต้นข้าวอยู่กลางกรอบ
                </p>
              </div>
            </div>

            {/* GPS Status */}
            <div className="w-full card rounded-xl p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined shrink-0 ${photo.gps ? 'text-primary' : 'text-error'}`}>
                {photo.gps ? 'my_location' : 'location_off'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-medium text-on-surface">
                  {gpsLoading ? "กำลังค้นหาตำแหน่ง..." : "ตำแหน่ง GPS"}
                </p>
                <p className="text-label-md text-on-surface-variant break-all">
                  {gpsLoading
                    ? "กำลังรอสัญญาณ GPS..."
                    : photo.gps
                    ? `${photo.gps.lat.toFixed(4)}, ${photo.gps.lng.toFixed(4)} (±${photo.gps.accuracy.toFixed(0)}m)`
                    : "ไม่สามารถระบุตำแหน่งได้"}
                </p>
              </div>
              {photo.gps && !gpsLoading && (
                <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>
              )}
            </div>

            {!photo.gps && !gpsLoading && (
              <div className="w-full bg-error-container/20 border border-error/30 rounded-xl p-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-error shrink-0 text-[14px] mt-0.5">warning</span>
                <p className="text-[12px] text-on-surface">
                  กรุณาเปิดใช้งาน GPS เพื่อระบุตำแหน่งแปลงนา
                </p>
              </div>
            )}

            {/* Capture Button — disabled until type selected */}
            <Button
              onClick={handleCapture}
              disabled={!photoType}
              className="w-full btn-primary text-body-md py-4"
            >
              <span className="material-symbols-outlined">photo_camera</span>
              <span>{photoType ? "ถ่ายรูป" : "เลือกประเภทรูปก่อน"}</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full card rounded-2xl overflow-hidden relative" style={{ aspectRatio: "1 / 1" }}>
              <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {photo.error && (
              <div className="w-full bg-error-container rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span className="text-label-md text-on-error-container">{photo.error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleRetake}
                className="flex-1"
              >
                ถ่ายใหม่
              </Button>
              <Button
                onClick={handleUpload}
                loading={photo.uploading}
                className="flex-1 btn-primary"
              >
                อัปโหลด
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />

      {/* GPS Warning Modal */}
      {showGpsWarning && (
        <div
          ref={gpsModalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gps-warning-title"
        >
          <div className="card bg-surface-container-low p-6 w-[400px] max-w-[90vw] rounded-2xl shadow-xl">
            <h3 id="gps-warning-title" className="text-headline-md font-bold text-on-surface mb-4">
              ไม่มีข้อมูล GPS
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              รูปจะไม่มีพิกัด ต้องการอัปโหลดต่อหรือไม่?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowGpsWarning(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowGpsWarning(false);
                  setPhoto((p) => ({ ...p, uploading: true, error: null, verdict: null }));
                }}
              >
                อัปโหลดต่อ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <LiffProvider>
      <UploadContent />
    </LiffProvider>
  );
}
