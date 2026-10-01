"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { GradientRule } from "@/components/ui/gradient-rule";

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
     * SP-AUTH LoginScreen — spec 017 sponsor-design-spec.md:444-511 + sponsor-artifact.json
     * SP-AUTH. Sponsor token variants per the login token table (:504-511 / :925 table):
     * eyebrow "Sponsor Portal", Thai headline, sponsor description + sub copy. Two-column
     * artifact split gridTemplateColumns 1.05fr .95fr, minHeight 100vh. LEFT: gradient-deep
     * brand panel with the existing logo lockup pipeline (no logo asset gap invention).
     * NO wind-farm <img>: renewables-wind-farm.png is the documented designer gap (R-027,
     * sponsor-design-spec.md:925 unknown #2) — the reversible alternative ships (the
     * --gradient-deep background alone; the decorative 18%-opacity image does not affect
     * component geometry) and is tracked as a release-matrix gap row. No placeholder PNG
     * is fabricated. RIGHT: white form panel centred at the artifact 392px max-width
     * (:479; page-local override — the shared spec-006 tokens --login-form-max-width and
     * the panel-width pair in globals.css stay untouched: /login still consumes them).
     * Auth/session wiring preserved verbatim (R-026): /sponsor-login POST, opaque-302
     * handling, router.push, error/loading state, LoginForm type="sponsor".
     * R-006: the last 2 raw-hex literals in parity scope (the raw-teal eyebrow literal at :76 and
     * the raw-teal gradient-stop literal at :85) migrate to var(--teal-300) and the GradientRule
     * token (--gradient-rule) — after this file the literal-freedom HEX_RAW suite is green.
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

        {/* Headline block — artifact: eyebrow --text-xs/--weight-semibold/--teal-300/
            --tracking-eyebrow (0.14em); h1 --text-4xl (artifact 48px)/--weight-light/
            --leading-snug (1.2)/--tracking-display; description --text-md (18px)/
            --leading-relaxed (1.7)/rgba(255,255,255,.82) (sponsor-design-spec.md:461-467);
            Thai copy verbatim (R-028). */}
        <div className="relative flex flex-col" style={{ gap: "var(--space-5)" }}>
          <div>
            <p
              className="text-xs font-semibold uppercase"
              style={{
                color: "var(--teal-300)",
                letterSpacing: "var(--tracking-eyebrow)",
                marginBottom: "var(--space-2)",
              }}
            >
              Sponsor Portal
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
              พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน
            </h1>
          </div>

          {/* GradientRule 120px (artifact SP-AUTH layout :466) — token-gradient
              replacement for the hand-rolled rule (R-006 migration) */}
          <GradientRule width={120} />

          <p
            className="max-w-[44ch]"
            style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,.82)" }}
          >
            ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้
          </p>
        </div>

        {/* Footer — rgba(255,255,255,.55) per sponsor-design-spec.md:469; rgba step on
            gradient-deep has no token (artifact rgba catalogue) — rgba literal per the
            R-006 GAP-B allowance, no hex. */}
        <div className="relative text-xs" style={{ color: "rgba(255,255,255,.55)" }}>
          ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด
        </div>
      </div>

      {/* ── Right Panel: white form panel, centred at 392px ── */}
      <div className="flex items-center justify-center p-10 bg-white">
        <div className="w-full" style={{ maxWidth: "392px" }}>
          {/* Form header — artifact sub copy variant for sponsor (:925 table,
              R-028); heading --text-2xl (artifact 30px) as AD-AUTH. */}
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
