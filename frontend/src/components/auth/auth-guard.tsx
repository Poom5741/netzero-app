"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface AuthGuardProps {
  requiredRole: "admin" | "sponsor";
  children: React.ReactNode;
}

/**
 * Client-side auth guard. Calls /me on mount:
 * - 401 → redirect to /login
 * - role mismatch → show access-denied in Thai
 * - admin can access sponsor pages (admin is superset)
 */
export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    apiRequest<{ email: string; role: string }>("/me").then((res) => {
      if (!res.ok || res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const role = res.data.role;
      // admin can access sponsor pages; sponsor cannot access admin pages
      if (requiredRole === "admin" && role !== "admin") {
        setState("denied");
      } else {
        setState("ok");
      }
    });
  }, [requiredRole]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <p className="text-body-lg text-on-surface-variant">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <div className="bg-white p-8 rounded-xl shadow-neumorphic text-center max-w-md">
          <span className="material-symbols-outlined text-error text-6xl mb-4">block</span>
          <h1 className="text-headline-md font-bold text-on-surface mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-3 bg-primary text-white rounded-lg text-body-md font-medium hover:bg-primary/90 transition-colors"
          >
            กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
