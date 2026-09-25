/**
 * Feature flags for conditional login controls (OTP, remember-device, forgot-password)
 * These controls are hidden until backend support is confirmed.
 * See specs/006-match-dashboard-shell-login/contracts/feature-flags.md
 */

export interface LoginFeatureFlags {
  otp: boolean;
  rememberDevice: boolean;
  forgotPassword: boolean;
}

export function getLoginFeatureFlags(): LoginFeatureFlags {
  return {
    otp: process.env.NEXT_PUBLIC_ENABLE_OTP !== 'false',
    rememberDevice: process.env.NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE !== 'false',
    forgotPassword: process.env.NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD === 'true', // opt-in only: no /forgot-password route exists yet
  };
}
