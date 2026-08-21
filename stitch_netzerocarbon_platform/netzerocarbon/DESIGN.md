---
name: NetZeroCarbon
colors:
  surface: '#f6fafe'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#3c4a3c'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#6c7b6b'
  outline-variant: '#bbcbb8'
  surface-tint: '#006e2b'
  primary: '#006e2b'
  on-primary: '#ffffff'
  primary-container: '#06c755'
  on-primary-container: '#004c1b'
  inverse-primary: '#3ee26c'
  secondary: '#5d5c74'
  on-secondary: '#ffffff'
  secondary-container: '#e2e0fc'
  on-secondary-container: '#63627a'
  tertiary: '#ab3500'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff8e67'
  on-tertiary-container: '#782300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#69ff89'
  primary-fixed-dim: '#3ee26c'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#00531f'
  secondary-fixed: '#e2e0fc'
  secondary-fixed-dim: '#c6c4df'
  on-secondary-fixed: '#1a1a2e'
  on-secondary-fixed-variant: '#45455b'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832600'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  touch-target-min: 44px
---

## Brand & Style

The design system is engineered for a multi-user ecosystem connecting Thai rice farmers, administrators, and global sponsors. The brand personality is **Trustworthy, Eco-Innovative, and Approachable.** It bridges the gap between traditional agriculture and the high-tech carbon credit market.

The visual style is a sophisticated hybrid of **Claymorphism, Glassmorphism, and Neumorphism**. 
- **Claymorphism** provides soft, 3D-like depth to primary action elements, making them feel tactile and friendly for farmers.
- **Neumorphism** is used for structural background elements and input containers, creating a sense of physical presence and organization.
- **Glassmorphism** is reserved for high-level navigation, modal overlays, and secondary data insights, ensuring the UI feels modern and premium for sponsors and admins.

The target emotional response is "Confidence through Transparency." The UI should feel like a living tool—organic yet mathematically precise.

## Colors

The palette is rooted in the lush greenery of Thai rice fields, utilizing the familiar **LINE Green (#06C755)** as the primary anchor to build immediate trust with the local user base. 

- **Primary:** A vibrant green gradient represents growth and ecological health. It is the dominant color for success states and primary CTAs.
- **Secondary (Dark Navy):** Provides a professional, authoritative contrast, used primarily for typography and administrative headers.
- **Accent (Warm Orange):** Used sparingly to draw attention to critical notifications or "Sponsor" actions, providing a warm, sun-like contrast to the greens.
- **Background:** A soft gray-blue (#F0F4F8) that serves as the base for neumorphic shadows, allowing white surfaces to pop with subtle depth.

## Typography

This design system utilizes **Inter** for its systematic, clean, and highly legible qualities. When implemented in the Thai context, it must be paired with **Sarabun** (not available in the base token set but required for production) to ensure a seamless bilingual experience.

- **Line Height:** A generous **1.6** is maintained for all body text to ensure readability for elderly farmers and clarity in data-dense admin panels.
- **Hierarchy:** High contrast in weights is used to separate data labels from values. 
- **Scale:** On mobile devices, display titles scale down to ensure they remain within the viewport while maintaining their bold, authoritative presence.

## Layout & Spacing

The layout follows a **fluid grid system** designed for high accessibility. 
- **Grid:** 12-column for desktop, 4-column for mobile.
- **Rhythm:** An 8px baseline grid dictates all vertical spacing.
- **Safe Areas:** Generous margins (20px-24px) are maintained to prevent the UI from feeling cluttered, essential for the "Calm Tech" approach of the system.
- **Touch Targets:** All interactive elements (chips, buttons, toggles) have a minimum height of **44px** to accommodate outdoor usage conditions (bright sun, one-handed operation in the field).

## Elevation & Depth

This design system uses a triple-layered approach to depth:

1.  **Level 0 (Base):** The #F0F4F8 background.
2.  **Level 1 (Neumorphic Surfaces):** Soft-raised cards using two shadows: a light shadow (-5px -5px 15px #FFFFFF) and a dark shadow (5px 5px 15px #D1D9E6). This is used for main content areas and input groups.
3.  **Level 2 (Claymorphic Actions):** Primary buttons and status cards feature "inner-glow" effects (inset shadows) and high-saturation gradients to appear squishy and 3D.
4.  **Level 3 (Glassmorphic Overlays):** Floating navigation bars and modal dialogs use a 20px backdrop-blur with a 60% white opacity fill and a 1px white border to simulate polished glass.

## Shapes

The shape language is **distinctly organic**. 
- Standard UI elements (Inputs, secondary buttons) use a **0.5rem (8px)** radius.
- Feature cards and primary containers use **1rem (16px)**.
- Status badges and primary action buttons use a **full pill-shape** to emphasize their tactile, claymorphic nature.
- Avoid all sharp corners to maintain the "Soft Tech" brand ethos.

## Components

### Buttons
- **Primary:** Claymorphic style. Large (min 48px height), gradient background (#06C755 to #00A854), white text, with an inner white semi-transparent glow at the top.
- **Secondary:** Neumorphic style. Raised from the background with a soft border.

### Cards
- Cards must use a combination of a subtle external drop shadow and a soft border. For farmer data, cards should feel "sunken" (inner shadow) to indicate input areas and "raised" for display areas.

### Input Fields
- Use a neumorphic "inset" shadow to create a well-defined trough for data entry. Labels should sit clearly above the field in Secondary Navy.

### Status Badges
- **Verified:** Primary Green gradient, white text, pill-shaped.
- **Pending:** Soft Yellow (#F9C74F), dark text.
- **Rejected:** Soft Red (#F94144), white text.
- All badges use a subtle glassmorphic sheen overlay.

### Glassmorphic Nav
- The bottom navigation for mobile and the top bar for desktop should be frosted glass (backdrop-blur: 15px) to allow the farm imagery or data visualizations to scroll underneath beautifully.