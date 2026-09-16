"use client";

import { getLoginFeatureFlags } from "@/lib/login-features";
import { useState } from "react";

interface LoginFormProps {
  type: "admin" | "sponsor";
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  error?: string;
  loading?: boolean;
}

/**
 * Login form with conditional OTP, remember-device, and forgot-password controls.
 * Controls are hidden until backend support is confirmed via feature flags.
 * See specs/006-match-dashboard-shell-login/contracts/feature-flags.md
 */
export function LoginForm({ type, onSubmit, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const features = getLoginFeatureFlags();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-label-md font-medium text-on-surface mb-2">
          อีเมล
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ height: 'var(--form-field-height, 44px)' }}
          placeholder="your@email.com"
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-label-md font-medium text-on-surface mb-2">
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ height: 'var(--form-field-height, 44px)' }}
          placeholder="••••••••"
        />
      </div>

      {/* OTP Field (conditional) */}
      {features.otp && (
        <div>
          <label htmlFor="otp" className="block text-label-md font-medium text-on-surface mb-2">
            รหัส OTP
          </label>
          <input
            id="otp"
            type="text"
            maxLength={6}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ height: 'var(--form-field-height, 44px)' }}
            placeholder="000000"
          />
        </div>
      )}

      {/* Remember Device (conditional) */}
      {features.rememberDevice && (
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary"
          />
          <label htmlFor="remember" className="ml-2 text-label-md text-on-surface">
            จดจำอุปกรณ์นี้
          </label>
        </div>
      )}

      {/* Forgot Password (conditional) */}
      {features.forgotPassword && (
        <div className="text-right">
          <a href="/forgot-password" className="text-label-md text-primary hover:underline">
            ลืมรหัสผ่าน?
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-container border border-error rounded-lg text-body-md text-error">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ height: 'var(--button-height, 44px)' }}
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      {/* Audit Notice (Sponsor only) */}
      {type === "sponsor" && (
        <p className="text-xs text-on-surface-variant text-center">
          การเข้าสู่ระบบทั้งหมดจะถูกบันทึกเพื่อการตรวจสอบ
        </p>
      )}
    </form>
  );
}
