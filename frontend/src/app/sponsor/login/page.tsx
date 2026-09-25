"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function SponsorLoginPage() {
  useEffect(() => {
    sessionStorage.removeItem("nzc_admin_email");
    sessionStorage.removeItem("nzc_admin_pass");
  }, []);


  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(credentials: { email: string; password: string; otp?: string; remember?: boolean }) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/sponsor-login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
          ...(credentials.otp ? { otp: credentials.otp } : {}),
          ...(credentials.remember ? { remember: "on" } : {}),
        }),
        redirect: "manual",
        credentials: "include",
      });

      if (res.status === 0 || res.status === 302) {
        // Same-origin 302 (opaque redirect): backend verified credentials
        // and set the HttpOnly nzc_session cookie. Only then navigate.
        router.push("/sponsor");
      } else if (res.status === 401) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    /**
     * Split-panel login layout matching spec 006:
     * - Left panel (45%): navy gradient background with branding
     * - Right panel (55%): white background with login form
     */
    <div className="min-h-screen grid" style={{ gridTemplateColumns: 'var(--login-branding-panel-width, 45%) var(--login-form-panel-width, 55%)' }}>
      {/* ── Left Panel: Navy Gradient + Branding ── */}
      <div
        className="relative flex flex-col justify-between p-10 overflow-hidden"
        style={{ background: "var(--gradient-deep)" }}
      >

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
        <div className="w-full" style={{ maxWidth: 'var(--login-form-max-width, 420px)' }}>
          {/* Form header */}
          <div className="mb-6">
            <h2 className="mb-1" style={{ fontSize: 26, fontWeight: 300, color: "var(--color-on-surface)" }}>
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน
            </p>
          </div>

          <LoginForm
            type="sponsor"
            onSubmit={handleLogin}
            error={error}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
