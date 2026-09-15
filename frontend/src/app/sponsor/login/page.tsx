"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "https://netzero-carbon-poc.poom-a1d.workers.dev";

export default function SponsorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/sponsor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }),
        redirect: "manual",
        credentials: "include",
      });

      if (res.status === 0 || res.status === 302) {
        window.location.href = "/sponsor";
      } else if (res.status === 401) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        window.location.href = "/sponsor";
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    /**
     * Split-panel login layout matching reference 9482f706 (sponsor variant):
     * - Left panel (≈55%): navy gradient background with branding
     * - Right panel (≈45%): white background with login form
     */
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "1.05fr 0.95fr" }}>
      {/* ── Left Panel: Navy Gradient + Branding ── */}
      <div
        className="relative flex flex-col justify-between p-10 overflow-hidden"
        style={{ background: "var(--gradient-deep)" }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-[0.18] bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/imagery/renewables-wind-farm.png')" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">eco</span>
          </div>
          <span className="text-white font-bold tracking-tight" style={{ fontSize: 20 }}>NetZero</span>
        </div>

        {/* Branding content */}
        <div className="relative flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#52ECCA" }}>
              Sponsor Portal
            </p>
            <h1 className="text-white leading-tight max-w-[22ch]" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน
            </h1>
          </div>

          {/* Gradient rule */}
          <div className="w-28 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #52ECCA, transparent)" }} />

          <p className="text-white/80 max-w-[44ch]" style={{ fontSize: 16, lineHeight: 1.7 }}>
            ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้
          </p>
        </div>

        {/* Footer */}
        <div className="relative text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex items-center justify-center p-10 bg-white">
        <div className="w-full" style={{ maxWidth: 392 }}>
          {/* Form header */}
          <div className="mb-6">
            <h2 className="mb-1" style={{ fontSize: 26, fontWeight: 300, color: "var(--color-on-surface)" }}>
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[16px]">error</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-on-surface)" }}>
                อีเมลบริษัท
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sponsor@netzero.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#f0f4f8] text-[16px] text-[#171c1f] placeholder:text-[#171c1f]/40 outline-none border border-transparent focus:border-[#028E91] focus:ring-2 focus:ring-[#028E91]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-on-surface)" }}>
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#f0f4f8] text-[16px] text-[#171c1f] placeholder:text-[#171c1f]/40 outline-none border border-transparent focus:border-[#028E91] focus:ring-2 focus:ring-[#028E91]/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          {/* Audit notice */}
          <div className="mt-4 p-4 rounded-xl bg-[#f0f4f8] flex items-start gap-3" style={{ fontSize: 12, lineHeight: 1.7, color: "var(--color-on-surface-variant)" }}>
            <span className="material-symbols-outlined text-[#028E91] flex-shrink-0 mt-0.5" style={{ fontSize: 16 }}>shield</span>
            <span>ทุกการเข้าดูและแก้ไขถูกบันทึกใน audit log (AD-11) พร้อมผู้ใช้ เวลา และค่าก่อน-หลัง</span>
          </div>

          {/* Dev bypass */}
          <div className="mt-6 pt-4 border-t border-[#e4e9ed]">
            <p className="text-[11px] text-[#3c4a3c]/50 text-center mb-2">Development Only</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("nzc_admin_email", "sponsor@netzero.com");
                  sessionStorage.setItem("nzc_admin_pass", "bypass");
                  window.location.href = "/sponsor";
                }}
                className="flex-1 py-2 rounded-lg bg-[#f0f4f8] text-[#171c1f] text-sm hover:bg-[#e4e9ed] transition-colors"
              >
                Sponsor (Bypass)
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "/admin/login"}
                className="flex-1 py-2 rounded-lg bg-[#f0f4f8] text-[#171c1f] text-sm hover:bg-[#e4e9ed] transition-colors"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
