"use client";

import { useState, useRef, useEffect } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { PhotoTypePicker } from "@/components/upload/photo-type-picker";
import { VerdictResult } from "@/components/upload/verdict-result";
import { uploadPhoto, type UploadVerdict } from "@/lib/photo";

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
    if (!photo.preview || !userId || !photoType) return;

    setPhoto((p) => ({ ...p, uploading: true, error: null, verdict: null }));

    try {
      const res = await fetch(photo.preview);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("photo", blob, "photo.jpg");
      formData.append("plot_id", "plot-004");
      formData.append("season_id", "2568-napi");
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
    { icon: "bar_chart", label: "สรุป", href: "/summary" },
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
            <span className="font-semibold text-lg text-on-surface">ผลการตรวจสอบ</span>
          </div>
        </header>
        <main className="flex-1 pt-16 pb-24 px-5 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-sm neumorphic rounded-2xl">
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
              <span className="material-symbols-outlined text-white text-sm">eco</span>
            </div>
            <span className="font-semibold text-lg text-on-surface">อัปโหลดรูป</span>
          </div>
          {!gpsLoading && (
            <div className={`neumorphic-inset px-3 py-1 rounded-full flex items-center gap-1 ${!photo.gps ? 'border border-error/30' : ''}`}>
              <span className={`material-symbols-outlined text-sm ${photo.gps ? 'text-primary' : 'text-error'}`}>
                {photo.gps ? 'location_on' : 'location_off'}
              </span>
              <span className="text-xs text-on-surface-variant">
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
            {/* Photo Type Picker */}
            <PhotoTypePicker value={photoType} onChange={setPhotoType} />

            {/* Camera frame */}
            <div className="w-full aspect-square neumorphic rounded-2xl flex items-center justify-center relative overflow-hidden">
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
                <p className="text-base text-center leading-relaxed">แตะเพื่อถ่ายรูปแปลงนา</p>
                <p className="text-sm text-center text-on-surface-variant/60 leading-relaxed">
                  จัดให้ต้นข้าวอยู่กลางกรอบ
                </p>
              </div>
            </div>

            {/* GPS Status */}
            <div className="w-full neumorphic rounded-xl p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined shrink-0 ${photo.gps ? 'text-primary' : 'text-error'}`}>
                {photo.gps ? 'my_location' : 'location_off'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">
                  {gpsLoading ? "กำลังค้นหาตำแหน่ง..." : "ตำแหน่ง GPS"}
                </p>
                <p className="text-sm text-on-surface-variant break-all">
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
                <span className="material-symbols-outlined text-error shrink-0 text-sm mt-0.5">warning</span>
                <p className="text-xs text-on-surface">
                  กรุณาเปิดใช้งาน GPS เพื่อระบุตำแหน่งแปลงนา
                </p>
              </div>
            )}

            {/* Capture Button — disabled until type selected */}
            <Button
              onClick={handleCapture}
              disabled={!photoType}
              className="w-full claymorphic text-base py-4"
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
            <div className="w-full aspect-square neumorphic rounded-2xl overflow-hidden relative">
              <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {photo.error && (
              <div className="w-full bg-error-container rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span className="text-sm text-on-error-container">{photo.error}</span>
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
                disabled={!photo.gps}
                className="flex-1 claymorphic"
              >
                อัปโหลด
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
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
