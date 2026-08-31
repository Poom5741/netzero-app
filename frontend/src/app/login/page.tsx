"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiRequest<{ email: string; role: string }>("/login", {
        method: "POST",
        json: { email, password },
      });

      if (!res.ok) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // Redirect based on role
      const role = res.data.role;
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "sponsor") {
        window.location.href = "/sponsor";
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <span className="material-symbols-outlined text-on-primary text-3xl">eco</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">NetZero Carbon</h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            โครงการคาร์บอนเครดิตนาข้าว AWD
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-8 shadow-neumorphic">
          <h2 className="text-headline-md font-semibold text-on-surface mb-6 text-center">
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-label-md font-medium text-on-surface mb-2"
              >
                อีเมล
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-label-md font-medium text-on-surface mb-2"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container rounded-lg">
                <span className="material-symbols-outlined text-error text-xl">error</span>
                <p className="text-label-md text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg text-body-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-label-md text-on-surface-variant mt-6">
          สำหรับผู้ดูแลระบบและผู้สนับสนุนโครงการ
        </p>
      </div>
    </div>
  );
}
