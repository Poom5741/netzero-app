"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "https://netzero-carbon-poc.poom-a1d.workers.dev";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // POST to backend login endpoint — browser handles the cookie
      // Try login — backend returns 302 redirect on success
      // With redirect:"follow", a successful login navigates to /admin on backend
      // With redirect:"manual", 302 becomes status 0 (opaqueredirect)
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }),
        redirect: "manual",
      });

      // status 0 = opaqueredirect (302 success), 200 = login page with error, 401 = bad creds
      if (res.status === 0 || res.status === 302) {
        // Login succeeded — store credentials for Basic Auth on API calls
        sessionStorage.setItem("nzc_admin_email", email);
        sessionStorage.setItem("nzc_admin_pass", password);
        window.location.href = "/admin";
      } else if (res.status === 401) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        // Unknown status — try anyway
        sessionStorage.setItem("nzc_admin_email", email);
        sessionStorage.setItem("nzc_admin_pass", password);
        window.location.href = "/admin";
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        <div className="neumorphic rounded-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">eco</span>
            </div>
            <span className="font-headline-lg text-headline-lg text-on-surface">NetZeroCarbon</span>
          </div>

          <h1 className="text-title-lg text-on-surface text-center mb-6">เข้าสู่ระบบ Admin</h1>

          {error && (
            <div className="bg-error-container/20 border border-error/30 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[16px]">error</span>
              <span className="text-label-md text-on-surface">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-label-md font-medium text-on-surface block mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@netzero.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-on-surface block mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none"
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
        </div>
      </div>
    </div>
  );
}
