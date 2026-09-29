"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

type Role = "admin" | "sponsor";

const ROLE_META: Record<Role, { label: string; endpoint: string; hint: string; dest: string }> = {
  admin: {
    label: "ผู้ดูแลระบบ",
    endpoint: "/login",
    hint: "ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงาน",
    dest: "/admin",
  },
  sponsor: {
    label: "ผู้สนับสนุน",
    endpoint: "/sponsor-login",
    hint: "ติดตามพื้นที่ที่สนับสนุน ผลคาร์บอน และเอกสารรับรอง",
    dest: "/sponsor",
  },
};

/**
 * Portal entry point. The farmer-facing surface lives in LINE, so the web app
 * serves only the admin and sponsor consoles — this page picks which one.
 */
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(credentials: {
    email: string;
    password: string;
    otp?: string;
    remember?: boolean;
  }) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(ROLE_META[role].endpoint, {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (res.status === 0 || res.status === 302) {
        router.push(ROLE_META[role].dest);
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
    // Split-panel layout matching spec 006 and the per-role login pages.
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns:
          "var(--login-branding-panel-width, 45%) var(--login-form-panel-width, 55%)",
      }}
    >
      {/* ── Left Panel: Navy Gradient + Branding ── */}
      <div
        className="relative flex flex-col justify-between p-10 overflow-hidden"
        style={{ background: "var(--gradient-deep)" }}
      >
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">eco</span>
          </div>
          <span className="text-white font-bold tracking-tight" style={{ fontSize: 20 }}>
            NetZero
          </span>
        </div>

        <div className="relative flex flex-col gap-5">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#52ECCA" }}
            >
              {role === "admin" ? "Admin Console" : "Sponsor Portal"}
            </p>
            <h1
              className="text-white leading-tight max-w-[22ch]"
              style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.02em" }}
            >
              {role === "admin"
                ? "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน"
                : "โครงการทำนาลดโลกร้อน — ผู้สนับสนุน"}
            </h1>
          </div>

          <div
            className="w-28 h-0.5 rounded-full"
            style={{ background: "linear-gradient(90deg, #52ECCA, transparent)" }}
          />

          <p className="text-white/80 max-w-[44ch]" style={{ fontSize: 16, lineHeight: 1.7 }}>
            {ROLE_META[role].hint}
          </p>
        </div>

        <div className="relative text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด
        </div>
      </div>

      {/* ── Right Panel: Role chooser + Login Form ── */}
      <div className="flex items-center justify-center p-10 bg-white">
        <div className="w-full" style={{ maxWidth: "var(--login-form-max-width, 420px)" }}>
          <div className="mb-6">
            <h2
              className="mb-1"
              style={{ fontSize: 26, fontWeight: 300, color: "var(--color-on-surface)" }}
            >
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              เลือกประเภทบัญชีเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <div
            role="tablist"
            aria-label="ประเภทบัญชี"
            className="flex gap-2 p-1 mb-6 rounded-xl"
            style={{ background: "var(--color-surface-container, #eaeef2)" }}
          >
            {(["admin", "sponsor"] as const).map((r) => (
              <button
                key={r}
                role="tab"
                type="button"
                aria-selected={role === r}
                onClick={() => {
                  setRole(r);
                  setError("");
                }}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: role === r ? "#fff" : "transparent",
                  color: role === r ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                  boxShadow: role === r ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {ROLE_META[r].label}
              </button>
            ))}
          </div>

          <LoginForm type={role} onSubmit={handleLogin} error={error} loading={loading} />
        </div>
      </div>
    </div>
  );
}
