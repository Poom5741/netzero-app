# Data Model: Match Shared Tokens, Dashboard Shell and Login Presentation

**Feature**: 006-match-dashboard-shell-login
**Date**: 2026-09-15

## Overview

This spec is primarily visual/CSS work. The data model focuses on design token definitions and component prop interfaces. No database schema changes are required.

## Design Token Definitions

### Layout Tokens (to be added to globals.css)

```css
/* Layout Dimensions */
--sidebar-width: 260px;
--sidebar-collapsed-width: 64px;
--header-height: 64px;
--nav-item-height: 40px;
--nav-item-padding: 12px 16px;

/* Login Panel */
--login-branding-panel-width: 45%;
--login-form-panel-width: 55%;
--login-form-max-width: 420px;

/* Button Dimensions */
--button-height: 44px;
--button-padding: 12px 24px;

/* Form Field Dimensions */
--form-field-height: 44px;
--form-field-padding: 12px 16px;
```

### Color Tokens (existing, verified)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#028E91` | Teal — primary actions |
| `--color-inverse-surface` | `#061E5C` | Navy — sidebar bg, login panels |
| `--color-surface` | `#f0f4f8` | Gray — page background |
| `--color-surface-container-lowest` | `#ffffff` | White — neumorphic cards |
| `--color-line-green` | `#06c755` | LINE OA accent |
| `--gradient-deep` | `linear-gradient(150deg, #061E5C, #0B2A72, #027276)` | Login branding panel |

### Typography Tokens (existing, verified)

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `"Plus Jakarta Sans", Sarabun, ...` | Primary font with Thai fallback |
| `--text-headline-lg` | `32px` | Page titles |
| `--text-body-md` | `16px` | Body text |
| `--text-label-md` | `14px` | Labels, nav items |

### Shadow Tokens (existing, verified)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 6px rgba(6,30,92,.07)` | Cards, buttons |
| `--shadow-md` | `0 8px 24px rgba(6,30,92,.09)` | Elevated panels |
| `--shadow-accent` | `0 12px 28px rgba(2,142,145,.24)` | Primary action focus |

## Component Interfaces

### Sidebar Component

```typescript
interface SidebarProps {
  items: NavigationItem[];
  activePath: string;
  collapsed?: boolean;
  onNavigate: (path: string) => void;
}

interface NavigationItem {
  label: string;        // Thai label (e.g., "ภาพรวม")
  icon: string;         // Material Symbols icon name
  path: string;         // Route path
  badge?: number;       // Optional count badge
}
```

### Header Component

```typescript
interface HeaderProps {
  title: string;
  user?: {
    name: string;
    role: 'admin' | 'sponsor';
    avatar?: string;
  };
  notifications?: number;
  onMenuToggle?: () => void;
}
```

### Login Form Component

```typescript
interface LoginFormProps {
  type: 'admin' | 'sponsor';
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  error?: string;
  loading?: boolean;
  // Conditional controls — only rendered when backend support is confirmed
  features?: {
    otp?: boolean;
    rememberDevice?: boolean;
    forgotPassword?: boolean;
  };
}
```

### Dashboard Shell Component

```typescript
interface DashboardShellProps {
  role: 'admin' | 'sponsor';
  children: React.ReactNode;
  sidebarItems: NavigationItem[];
}
```

## State Transitions

### Login Page States

1. **Default**: Email + password fields visible, submit enabled
2. **Loading**: Submit disabled, spinner shown
3. **Error**: Error message displayed below form
4. **Success**: Redirect to dashboard

### Dashboard Shell States

1. **Default**: Sidebar expanded, content visible
2. **Collapsed**: Sidebar icons-only (viewport < 1280px)
3. **Loading**: Skeleton placeholders in content area
4. **Empty**: Empty-state message in content area

## Validation Rules

### Design Token Validation

- All color values must be valid hex codes
- All spacing values must be multiples of 4px
- All shadow values must use rgba with alpha < 0.2
- All font sizes must be in px (not rem/em for consistency)

### Layout Validation

- Sidebar width must be 260px (expanded) or 64px (collapsed)
- Header height must be 64px
- Navigation items must be 40px height
- Login form max-width must be 420px
- Button and form field heights must be 44px (touch target minimum)

### Visual Parity Validation

- Discrete tokens (colors, hex codes) must match reference exactly
- Pixel-level measurements must match within per-region tolerance from spec 005
- Thai text must render without clipping or overflow
- All viewports must be tested: 1280x720, 1440x900, 390x844, 360x844, 430x844
