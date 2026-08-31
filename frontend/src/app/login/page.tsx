"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

interface LoginResponse {
  role: "admin" | "sponsor";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        json: { email, password },
      });
      if (res.ok) {
        window.location.href = res.data.role === "sponsor" ? "/sponsor" : "/admin";
      } else {
        const msg = (res.data as { error?: string })?.error;
        setError(msg || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="neumorphic w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary text-3xl">eco</span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">เข้าสู่ระบบ</h1>
          <p className="text-label-md text-on-surface-variant mt-1">NetZero Carbon Credit</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-label-md text-on-surface-variant mb-1">
              อีเมล
            </label>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2 shadow-[var(--shadow-neumorphic-inset)]">
              <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-transparent outline-none w-full text-body-md text-on-surface placeholder:text-outline-variant"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-label-md text-on-surface-variant mb-1">
              รหัสผ่าน
            </label>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2 shadow-[var(--shadow-neumorphic-inset)]">
              <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-body-md text-on-surface placeholder:text-outline-variant"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-label-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="touch-target mt-2 w-full py-3 bg-primary text-on-primary rounded-lg font-semibold text-body-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
