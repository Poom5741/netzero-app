"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { PhotoTypePicker } from "@/components/upload/photo-type-picker";
import { uploadPhoto } from "@/lib/photo";

type UploadPhase = "idle" | "captured" | "uploading" | "success" | "error";

function UploadContent() {
  const { userId, isLoading } = useLiff();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoType, setPhotoType] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsFailed, setGpsFailed] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
          setGpsFailed(true);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setGpsFailed(true);
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
      setPreview(ev.target?.result as string);
      setPhase("captured");
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!preview || !userId || !photoType) return;

    setPhase("uploading");

    try {
      const res = await fetch(preview);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("photo", blob, "photo.jpg");
      formData.append("plot_id", "plot-004");
      formData.append("season_id", "2568-napi");
      formData.append("gps_lat", String(gps?.lat || 0));
      formData.append("gps_lng", String(gps?.lng || 0));
      formData.append("gps_accuracy", String(gps?.accuracy || 0));
      formData.append("taken_at", new Date().toISOString());
      formData.append("photo_type", photoType!);

      await uploadPhoto(formData);
      setPhase("success");
    } catch {
      setPhase("error");
    }
  }

  function handleRetake() {
    setPreview(null);
    setPhase("idle");
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

  // Success state
  if (phase === "success") {
    return (
      <div className="flex flex-col h-screen bg-surface-container-low">
        <header className="glass fixed top-0 w-full z-50 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-5 flex items-center">
            <span className="font-headline-md text-headline-md text-on-surface">อัปโหลดรูป</span>
          </div>
        </header>
        <main className="flex-1 pt-16 pb-24 px-5 flex items-center justify-center">
          <div className="w-full max-w-sm neumorphic rounded-2xl p-8 flex flex-col items-center gap-4" data-testid="success-screen">
            <span className="material-symbols-outlined text-primary text-6xl">check_circle</span>
            <p className="text-headline-md font-medium text-on-surface">อัปโหลดสำเร็จ</p>
            <Button
              onClick={() => router.push("/chat")}
              className="w-full claymorphic text-body-md py-4"
            >
              <span className="material-symbols-outlined">chat</span>
              <span>กลับไปแชท</span>
            </Button>
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
            <div className={`neumorphic-inset px-3 py-1 rounded-full flex items-center gap-1 ${gpsFailed ? 'border border-orange-400/30' : ''}`}>
              <span className={`material-symbols-outlined text-[14px] ${gps ? 'text-primary' : 'text-orange-500'}`}>
                {gps ? 'location_on' : 'location_off'}
              </span>
              <span className="text-[12px] text-on-surface-variant">
                {gps
                  ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`
                  : "ไม่มี GPS"}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pt-16 pb-24 px-5 overflow-y-auto">
        {phase === "idle" ? (
          <div className="flex flex-col gap-5">
            {/* Photo Type Picker */}
            <PhotoTypePicker value={photoType} onChange={setPhotoType} />

            {/* Camera frame */}
            <div
              className="w-full neumorphic rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer"
              style={{ aspectRatio: "1/1" }}
              onClick={handleCapture}
              data-testid="camera-frame"
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
                <p className="text-label-md text-center text-on-surface-variant/60 leading-relaxed">
                  จัดให้ต้นข้าวอยู่กลางกรอบ
                </p>
              </div>
            </div>

            {/* GPS Status */}
            <div className="w-full neumorphic rounded-xl p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined shrink-0 ${gps ? 'text-primary' : 'text-orange-500'}`}>
                {gps ? 'my_location' : 'location_off'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-medium text-on-surface">
                  {gpsLoading ? "กำลังค้นหาตำแหน่ง..." : "ตำแหน่ง GPS"}
                </p>
                <p className="text-label-md text-on-surface-variant break-all">
                  {gpsLoading
                    ? "กำลังรอสัญญาณ GPS..."
                    : gps
                    ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)} (±${gps.accuracy.toFixed(0)}m)`
                    : "ไม่สามารถระบุตำแหน่งได้"}
                </p>
              </div>
              {gps && !gpsLoading && (
                <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>
              )}
            </div>

            {/* GPS Warning — orange, not red */}
            {gpsFailed && (
              <div className="w-full bg-orange-50 border border-orange-300 rounded-xl p-3 flex items-start gap-2" data-testid="gps-warning">
                <span className="material-symbols-outlined text-orange-500 shrink-0 text-[14px] mt-0.5">warning</span>
                <p className="text-[12px] text-on-surface">
                  ไม่มี GPS — เปิด Location Services เพื่อระบุตำแหน่ง
                </p>
              </div>
            )}

            {/* Capture Button — disabled until type selected */}
            <Button
              onClick={handleCapture}
              disabled={!photoType}
              className="w-full claymorphic text-body-md py-4"
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
          /* captured / uploading / error phases */
          <div className="flex flex-col gap-4">
            <div className="w-full neumorphic rounded-2xl overflow-hidden relative" style={{ aspectRatio: "1/1" }}>
              <img src={preview!} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {/* Error banner */}
            {phase === "error" && (
              <div className="w-full bg-error-container rounded-xl p-3 flex items-center gap-2" data-testid="error-banner">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span className="text-label-md text-on-error-container flex-1">อัปโหลดไม่สำเร็จ กรุณาลองใหม่</span>
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
                loading={phase === "uploading"}
                disabled={!gps}
                className="flex-1 claymorphic"
              >
                {phase === "error" ? "ลองใหม่" : "อัปโหลด"}
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
