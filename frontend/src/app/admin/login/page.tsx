"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GradientRule } from "@/components/ui/gradient-rule";

export default function AdminLoginPage() {
  useEffect(() => {
    sessionStorage.removeItem("nzc_admin_email");
    sessionStorage.removeItem("nzc_admin_pass");
  }, []);


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(credentials: { email: string; password: string; otp?: string; remember?: boolean }) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/login", { signal: AbortSignal.timeout(8000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          ...(credentials.otp ? { otp: credentials.otp } : {}),
          ...(credentials.remember ? { remember: true } : {}),
        }),
        redirect: "manual",
        credentials: "include",
      });

      if (res.status === 0 || res.status === 302) {
        // Same-origin 302 (fetch reports status 0 for an opaque redirect):
        // backend verified the credentials and set the HttpOnly nzc_session
        // cookie. Only then navigate. Anything else is a visible failure.
        window.location.href = "/admin";
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
     * AD-AUTH LoginScreen — spec 017 admin-design-spec.md:268-291 +
     * admin-artifact.json AD-AUTH: two-column split
     * gridTemplateColumns 1.05fr .95fr, minHeight 100vh (artifact grid
     * string :328). LEFT: gradient-deep brand panel (logo lockup via the
     * existing icon pipeline — no logo asset gap invention per R-027),
     * eyebrow "Admin Console" (--teal-300), Thai headline verbatim,
     * GradientRule 120px, description, footer. RIGHT: white form panel
     * (artifact layout string "white bg" = --surface-page #FFFFFF,
     * admin-artifact.json:329) with the form centred at 392px max-width
     * (artifact :329; page-local override — the shared spec-006 token
     * --login-form-max-width: 420px in globals.css:109 stays untouched
     * because /login and sponsor/login still consume it). Auth/session
     * logic and the LoginForm wiring are preserved verbatim (R-026).
     */
    <div className="grid" style={{ gridTemplateColumns: "1.05fr 0.95fr", minHeight: "100vh" }}>
      {/* ── Left Panel: gradient-deep brand panel ── */}
      <div
        className="relative flex flex-col justify-between p-10 overflow-hidden"
        style={{ background: "var(--gradient-deep)" }}
      >

        {/* Logo (existing lockup pipeline — material icon tile + wordmark) */}
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">eco</span>
          </div>
          <span className="text-white font-bold tracking-tight" style={{ fontSize: 20 }}>NetZero</span>
        </div>

        {/* Headline block — artifact: eyebrow --text-xs/--weight-semibold/
            --teal-300/--tracking-eyebrow; h1 --text-4xl (artifact 48px,
            globals.css:239 mapping)/--weight-light/--leading-snug(1.2)/
            --tracking-display(-0.02em); Thai copy verbatim (R-028). */}
        <div className="relative flex flex-col" style={{ gap: "var(--space-5)" }}>
          <p
            className="text-xs font-semibold uppercase"
            style={{
              color: "var(--teal-300)",
              letterSpacing: "var(--tracking-eyebrow)",
              marginBottom: "var(--space-2)",
            }}
          >
            Admin Console
          </p>
          <h1
            className="text-white max-w-[22ch]"
            style={{
              fontSize: "48px",
              fontWeight: "var(--weight-light)",
              lineHeight: 1.2,
              letterSpacing: "var(--tracking-display)",
            }}
          >
            โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน
          </h1>

          {/* GradientRule 120px (artifact AD-AUTH layout) */}
          <GradientRule width={120} />

          <p
            className="text-white/80 max-w-[44ch]"
            style={{ fontSize: "18px", lineHeight: 1.7 }}
          >
            ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงานสำหรับขึ้นทะเบียน Premium T-VER
          </p>
        </div>

        {/* Footer — rgba white step on gradient-deep; artifact on-dark text
            uses rgba(255,255,255,α) steps with no token (admin-artifact.json
            rgba catalogue, e.g. .6/.66/.72) — rgba literal per R-006 GAP-B
            allowance, no hex. */}
        <div className="relative text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด
        </div>
      </div>

      {/* ── Right Panel: white form panel, centred at 392px ── */}
      <div className="flex items-center justify-center p-10 bg-white">
        <div className="w-full" style={{ maxWidth: "392px" }}>
          {/* Form header — artifact copy.heading --text-2xl (artifact 30px)
              + copy.subheading (the admin audit/note line, R-028). */}
          <div className="mb-6">
            <h2
              className="mb-1"
              style={{
                fontSize: "30px",
                fontWeight: "var(--weight-light)",
                color: "var(--text-heading)",
              }}
            >
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              บัญชีเจ้าหน้าที่ NZC · เข้าถึงได้ทุกพื้นที่และทุกเมนู
            </p>
          </div>

          <LoginForm
            type="admin"
            onSubmit={handleLogin}
            error={error}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
