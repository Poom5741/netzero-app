# Contract: Feature Flags for Conditional Login Controls

**Feature**: 006-match-dashboard-shell-login
**Date**: 2026-09-15

## Overview

This contract defines the feature flag mechanism for conditionally rendering OTP, remember-device, and forgot-password controls in Admin and Sponsor login forms. These controls are hidden until backend support is confirmed.

## Feature Flag Configuration

### Configuration Source

Feature flags are read from environment variables at build time (static export):

```bash
# .env.local or .env.production
NEXT_PUBLIC_ENABLE_OTP=false
NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE=false
NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD=false
```

### Feature Flag Interface

```typescript
interface LoginFeatureFlags {
  otp: boolean;
  rememberDevice: boolean;
  forgotPassword: boolean;
}

function getLoginFeatureFlags(): LoginFeatureFlags {
  return {
    otp: process.env.NEXT_PUBLIC_ENABLE_OTP === 'true',
    rememberDevice: process.env.NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE === 'true',
    forgotPassword: process.env.NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD === 'true',
  };
}
```

## Conditional Rendering

### Admin Login Form

```tsx
<LoginForm
  type="admin"
  onSubmit={handleLogin}
  features={getLoginFeatureFlags()}
/>
```

The `LoginForm` component conditionally renders controls based on `features`:

- `features.otp === true` → Render OTP input field
- `features.rememberDevice === true` → Render "Remember this device" checkbox
- `features.forgotPassword === true` → Render "Forgot password?" link

### Sponsor Login Form

```tsx
<LoginForm
  type="sponsor"
  onSubmit={handleLogin}
  features={getLoginFeatureFlags()}
/>
```

Same conditional rendering as Admin login.

## Backend Integration (Future)

When backend support is available:

1. Set environment variables to `true`:
   ```bash
   NEXT_PUBLIC_ENABLE_OTP=true
   NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE=true
   NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD=true
   ```

2. Rebuild the static export:
   ```bash
   npm run build
   ```

3. Deploy the new build

4. Implement backend endpoints:
   - `POST /api/auth/otp/send` — Send OTP to user email
   - `POST /api/auth/otp/verify` — Verify OTP code
   - `POST /api/auth/remember-device` — Register device for persistent session
   - `POST /api/auth/forgot-password` — Send password reset email

## Testing

### Feature Flag Disabled (Current State)

```typescript
// Test: OTP field not rendered when flag is false
test('OTP field hidden when NEXT_PUBLIC_ENABLE_OTP is false', () => {
  process.env.NEXT_PUBLIC_ENABLE_OTP = 'false';
  render(<LoginForm type="admin" onSubmit={jest.fn()} />);
  expect(screen.queryByLabelText(/OTP/i)).not.toBeInTheDocument();
});
```

### Feature Flag Enabled (Future State)

```typescript
// Test: OTP field rendered when flag is true
test('OTP field visible when NEXT_PUBLIC_ENABLE_OTP is true', () => {
  process.env.NEXT_PUBLIC_ENABLE_OTP = 'true';
  render(<LoginForm type="admin" onSubmit={jest.fn()} />);
  expect(screen.getByLabelText(/OTP/i)).toBeInTheDocument();
});
```

## Migration Path

1. **Phase 1 (Current)**: All flags `false`, controls hidden
2. **Phase 2**: Backend OTP implemented → Set `NEXT_PUBLIC_ENABLE_OTP=true`
3. **Phase 3**: Backend remember-device implemented → Set `NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE=true`
4. **Phase 4**: Backend password-reset implemented → Set `NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD=true`

Each phase requires:
- Backend endpoint implementation
- Environment variable update
- Static export rebuild
- Deployment
- Visual parity verification (controls match reference capture)
