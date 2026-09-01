"use client";

import { useState, useEffect } from "react";
import { LiffProvider, useLiff } from "@/lib/liff-context";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/ui/bottom-nav";

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

interface FormData {
  waterLevel: number;
  strawManagement: string;
  fuelLiters: number;
  electricityKwh: number;
}

// Demo user maps to farmer-001
const DEMO_FARMER_ID = "farmer-001";

function SummaryContent() {
  const { userId, isLoading } = useLiff();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [form, setForm] = useState<FormData>({
    waterLevel: 5,
    strawManagement: "",
    fuelLiters: 0,
    electricityKwh: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      .catch(() => setError("โหลดข้อมูลแปลงล้มเหลว"));
  }, [farmerId]);

  // Fetch seasons when plot changes
  useEffect(() => {
    if (!selectedPlot) return;
    apiRequest<{ seasons: Season[] }>(`/api/seasons?plot_id=${selectedPlot}`)
      .then((res) => {
        if (res.ok) {
          setSeasons(res.data.seasons);
          // Default to active season or first
          const active = res.data.seasons.find((s) => s.status === "active");
          setSelectedSeason(active?.id || res.data.seasons[0]?.id || "");
        }
      })
      .catch(() => setError("โหลดข้อมูลฤดูกาลล้มเหลว"));
  }, [selectedPlot]);

  const progress = Math.round(
    ((form.waterLevel > 0 ? 1 : 0) +
      (form.strawManagement ? 1 : 0) +
      (form.fuelLiters > 0 ? 1 : 0) +
      (form.electricityKwh > 0 ? 1 : 0)) /
      4 *
      100,
  );

  const isFormValid = form.strawManagement !== "" && selectedPlot !== "" && selectedSeason !== "";

  const strawOptions = [
    { value: "plough_under", label: "ไถกลบ" },
    { value: "burn", label: "เผา" },
    { value: "bale_sell", label: "มัดขาย" },
    { value: "remove", label: "เอาออก" },
  ];

  async function handleSave() {
    setValidationError(null);
    
    if (!selectedPlot || !selectedSeason) {
      setValidationError("กรุณาเลือกแปลงและฤดูกาล");
      return;
    }

    if (!form.strawManagement) {
      setValidationError("กรุณาเลือกการจัดการฟางข้าว");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await apiRequest("/api/season", {
        method: "POST",
        json: {
          plot_id: selectedPlot,
          season_id: selectedSeason,
          water_level_cm: form.waterLevel,
          straw_mgmt: form.strawManagement,
          fuel_liters: form.fuelLiters,
          electricity_kwh: form.electricityKwh,
        },
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
    } catch {
      setError("บันทึกล้มเหลว กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  const navItems = [
    { icon: "chat", label: "แชท", href: "/chat" },
    { icon: "photo_camera", label: "อัปโหลด", href: "/upload" },
    { icon: "bar_chart", label: "สรุป", href: "/summary", active: true },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-3 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-container-low">
      {/* Header */}
      <header className="glass fixed top-0 w-full z-50 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">eco</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">สรุปฤดูกาล</span>
          </div>
          <span className="text-label-md text-on-surface-variant">{progress}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-surface-container-highest">
          <div
            className="h-full bg-gradient-to-r from-primary-container to-line-green-dark transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 pt-20 pb-24 px-5 overflow-y-auto">
        {saved ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-5">
            <span className="material-symbols-outlined text-primary text-6xl">check_circle</span>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface text-center">บันทึกสำเร็จ!</h2>
            <p className="text-on-surface-variant text-center max-w-sm">ข้อมูลสรุปฤดูกาลถูกบันทึกเรียบร้อยแล้ว</p>
            <Button onClick={() => setSaved(false)} variant="secondary" className="whitespace-nowrap">
              แก้ไขข้อมูล
            </Button>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {/* Plot Selector */}
            <div className="neumorphic rounded-xl p-4">
              <label className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-3">
                <span className="material-symbols-outlined text-[20px]">landscape</span>
                เลือกแปลงนา
              </label>
              <select
                value={selectedPlot}
                onChange={(e) => setSelectedPlot(e.target.value)}
                className="w-full neumorphic-inset px-4 py-3 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="">เลือกแปลง...</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.plot_code} ({plot.area_rai} ไร่)
                  </option>
                ))}
              </select>
            </div>

            {/* Season Selector */}
            <div className="neumorphic rounded-xl p-4">
              <label className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-3">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                ฤดูกาล
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full neumorphic-inset px-4 py-3 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                disabled={!selectedPlot}
              >
                <option value="">เลือกฤดูกาล...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.status === "active" ? "●" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Water Level */}
            <div className="neumorphic rounded-xl p-4">
              <label className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-3">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                ระดับน้ำ (ซม.)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={form.waterLevel}
                onChange={(e) => setForm({ ...form, waterLevel: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[12px] text-on-surface-variant">0 ซม.</span>
                <span className="text-label-md font-medium text-primary">{form.waterLevel} ซม.</span>
                <span className="text-[12px] text-on-surface-variant">10 ซม.</span>
              </div>
            </div>

            {/* Straw Management */}
            <div className="neumorphic rounded-xl p-4">
              <label className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-3">
                <span className="material-symbols-outlined text-[20px]">grass</span>
                การจัดการฟางข้าว <span className="text-error">*</span>
              </label>
              <select
                value={form.strawManagement}
                onChange={(e) => {
                  setForm({ ...form, strawManagement: e.target.value });
                  setValidationError(null);
                }}
                className="w-full neumorphic-inset px-4 py-3 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="">เลือก...</option>
                {strawOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {validationError && validationError.includes("ฟางข้าว") && (
                <p className="text-label-md text-error mt-2">{validationError}</p>
              )}
              {form.strawManagement === "burn" && (
                <div className="mt-3 p-3 bg-tertiary-container/20 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[14px] mt-0.5 shrink-0">warning</span>
                  <p className="text-label-md text-on-tertiary-container">
                    การเผาฟางปล่อยก๊าซเรือนกระจกและ PM 2.5 แนะนำให้ไถกลบเพื่อรับคาร์บอนเครดิต
                  </p>
                </div>
              )}
            </div>

            {/* Energy */}
            <div className="neumorphic rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-3">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                พลังงานที่ใช้
              </label>
              <Input
                label="น้ำมัน (ลิตร)"
                type="number"
                min="0"
                step="0.1"
                value={form.fuelLiters || ""}
                onChange={(e) => setForm({ ...form, fuelLiters: Number(e.target.value) })}
                placeholder="0.0"
              />
              <Input
                label="ไฟฟ้า (kWh)"
                type="number"
                min="0"
                step="0.1"
                value={form.electricityKwh || ""}
                onChange={(e) => setForm({ ...form, electricityKwh: Number(e.target.value) })}
                placeholder="0.0"
              />
            </div>

            {error && (
              <div className="bg-error-container rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span className="text-label-md text-on-error-container">{error}</span>
              </div>
            )}

            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!isFormValid}
              className="w-full claymorphic text-body-md py-4 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">save</span>
              <span>บันทึกข้อมูล</span>
            </Button>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}

export default function SummaryPage() {
  return (
    <LiffProvider>
      <SummaryContent />
    </LiffProvider>
  );
}
