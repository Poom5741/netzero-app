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
    <div className="min-h-screen bg-[#E7FCF7] flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        <div className="card rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#028E91] flex items-center justify-center">
              <span className="material-symbols-outlined text-white">eco</span>
            </div>
            <span className="font-headline-lg text-headline-lg text-[#061E5C]">NetZeroCarbon</span>
          </div>

          <h1 className="text-title-lg text-[#061E5C] text-center mb-6">เข้าสู่ระบบผู้สนับสนุน</h1>

          {error && (
            <div className="bg-error-container/20 border border-error/30 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[16px]">error</span>
              <span className="text-label-md text-on-surface">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-label-md font-medium text-[#061E5C] block mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sponsor@netzero.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#E7FCF7] text-body-md text-[#061E5C] placeholder:text-[#061E5C]/50 outline-none border border-[#028E91]/20 focus:border-[#028E91] focus:ring-2 focus:ring-[#028E91]/30 transition-all"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-[#061E5C] block mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#E7FCF7] text-body-md text-[#061E5C] placeholder:text-[#061E5C]/50 outline-none border border-[#028E91]/20 focus:border-[#028E91] focus:ring-2 focus:ring-[#028E91]/30 transition-all"
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

          {/* Dev bypass */}
          <div className="mt-6 pt-4 border-t border-[#028E91]/20">
            <p className="text-[11px] text-[#061E5C]/50 text-center mb-2">Development Only</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("nzc_admin_email", "sponsor@netzero.com");
                  sessionStorage.setItem("nzc_admin_pass", "bypass");
                  window.location.href = "/sponsor";
                }}
                className="flex-1 py-2 rounded-lg bg-[#E7FCF7] text-[#061E5C] text-label-md hover:bg-[#028E91]/10 transition-colors border border-[#028E91]/20"
              >
                Sponsor (Bypass)
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/admin/login";
                }}
                className="flex-1 py-2 rounded-lg bg-[#E7FCF7] text-[#061E5C] text-label-md hover:bg-[#028E91]/10 transition-colors border border-[#028E91]/20"
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
