---
name: Carbon Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 38px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an austere, high-focus environment tailored for elite practitioners, strategists, and engineers orchestrating landing page execution. The aesthetic marries architectural minimalism with high-end editorial precision.

Key attributes:
- **Atmosphere:** Deep, quiet, monolithic. The UI recedes entirely to let generative structures and preview environments command primary visual attention.
- **Negative Space as Structure:** Layouts reject artificial dividers and lines. Spatial discipline, deliberate typography scaling, and matte tonal contrast create order without visual noise.
- **Tone:** Uncompromising, intellectual, quiet luxury. Rejects decorative trends: no faux-intelligence indicators, no floating badges, no gratuitous glow effects, and no ornamental micro-indicators. Every visual element serves immediate spatial or content utility.

## Colors

The palette relies on absolute darkness, calibrated matte transitions, and stark luminance contrast. Borders and hairpins are strictly forbidden; depth and delineation occur entirely via surface luminance stacking.

### Surface Tiers
- **Canvas Base (`#0A0A0A`):** The foundational void. Used for canvas backgrounds, root viewport frames, and non-interactive negative space.
- **Elevated Graphite Surface (`#141414`):** Primary container tier. Applied to workspace panels, inspector drawers, modal sheets, and sidebars.
- **Interactive Surface Highlight (`#1F1F1F`):** Default interactive elements, unselected pill tracks, cards, and input backgrounds.
- **Active / Hover Accent Surface (`#282828`):** Hover states, active pressed states, and drag-over indicators.
- **Muted Structural Accent (`#333333`):** High-interaction feedback states, scrubbers, and focused tracks.

### Typographic Luminance
- **Primary Text (`#F3F3F3`):** High-contrast off-white for headlines, active selections, and core editorial copy.
- **Secondary Text (`#A1A1A1`):** Subheadings, descriptive metadata, and active form values.
- **Tertiary / Muted Text (`#737373`):** Labels, placeholders, disabled indicators, and timestamps.

## Typography

Typography relies entirely on **Hanken Grotesk**, an engineered neo-grotesque sans-serif with geometric precision and crisp rendering in dark environments. 

Rules:
- Never apply decorative serif headers or faux-mechanical monospaced tags unless displaying raw executable code.
- Letter spacing tightens progressively as font size ascends to preserve structural density.
- Secondary hierarchy is conveyed through intentional luminance stepping (`#F3F3F3` -> `#A1A1A1` -> `#737373`), preserving single-weight continuity across related blocks.
- Body paragraphs must maintain generous vertical breathing room (`line-height: 1.6` equivalent) to counterbalance the deep carbon backgrounds.

## Layout & Spacing

The workspace uses a full-bleed adaptive application grid, maximizing screen utility while maintaining intentional whitespace buffers.

### Layout Principles
- **Desktop Grid:** 12-column variable fluid grid framed by dedicated control panels (inspector, tree, asset dock). Outer canvas margins sit at `2.5rem` (`margin`) with `1.5rem` (`gutter`) inter-column gutters.
- **Panel Logic:** Floating docks and side sheets float over the workspace canvas separated exclusively by a `0.5rem` to `1rem` buffer of pure canvas `#0A0A0A`. No borders or dividers exist between panels.
- **Mobile & Narrow Viewports:** At `<768px`, grids collapse to a single structural column with unified `1.25rem` outer canvas margins. Multi-pane controls convert to bottom-pinned sheet tiers.
- **Spacing Rhythm:** Internal component structures must adhere strictly to an 8px base rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 40px). Vertical stack separation relies on generous spacing tokens rather than line breaks or cards.

## Elevation & Depth

Separation without lines demands extreme calibration of matte luminance, backdrop filters, and low-frequency shadow dispersion.

### Principles
- **Absolute Rule:** `border: none`, `outline: none`, and `box-shadow: inset` lines are categorically banned. Depth cannot rely on strokes.
- **Tonal Layering:**
  - Base viewport: `#0A0A0A`
  - Elevated surfaces / side panels: `#141414`
  - Floating overlays / popovers / command bars: `#1F1F1F`
- **Soft Dispersion Shadows:** Shadows must not appear hard-edged. They simulate heavy light dissipation across an unlit room:
  - Low (Cards, interactive components): `0 8px 24px -4px rgba(0, 0, 0, 0.45)`
  - High (Command palettes, context modals): `0 24px 64px -12px rgba(0, 0, 0, 0.75)`
- **Atmospheric Translucency (Backdrop Blur):** Floating headers, context toolbars, and sticky controls utilize matte glass: `background-color: rgba(20, 20, 20, 0.8)` paired with `backdrop-filter: blur(20px) saturate(140%)`.

## Shapes

The design system maintains an architectural, restrained geometry with soft corner treatments. 

- **Base Radius (0.25rem / 4px):** Applied to inputs, list rows, context menus, and small interactive targets. Gives a precise, machined feel without visual harshness.
- **Container Radius (`rounded-lg`, 0.5rem / 8px):** Applied to panels, preview viewports, dynamic cards, and floating dialogs.
- **Selection Pill Radius (`rounded-full`, 9999px):** Applied solely to segmented controls, multi-state pill switchers, and standalone action pills.

## Components

Every component functions under strict negative constraints: zero borders, zero ornamental badges, zero status blinks, and zero redundant iconography.

### Buttons & Action Triggers
- **Primary:** Solid `#F3F3F3` surface with `#0A0A0A` text, `label-md` weight. On hover: slight scale down `scale(0.98)` and opacity shift to `0.92`.
- **Secondary:** Matte `#1F1F1F` surface with `#F3F3F3` text. On hover: surface transitions to `#282828` with smooth 180ms ease.
- **Ghost:** Transparent background, `#A1A1A1` text. On hover: background shifts to `#141414` and text to `#F3F3F3`.

### Segmented Pill Controls
- Container track rendered in `#141414` with `rounded-full` curvature and `0.25rem` padding.
- Selected state: Smooth sliding pill surface in `#282828` with `#F3F3F3` typography.
- Unselected state: Transparent surface with `#737373` typography, transitioning to `#A1A1A1` on cursor proximity.

### Cards & Content Surfaces
- Zero outlines. Background is locked to `#141414` against the `#0A0A0A` floor.
- Content hierarchy is established through typographic weight and generous padding (`space-lg`).
- Interactive cards shift background to `#1F1F1F` on hover with a 200ms cubic-bezier transition.

### Input Fields
- Flat `#141414` surface, no border stroke.
- Placeholder text in `#737373`. Entered text in `#F3F3F3`.
- Focus state: Surface luminance lifts to `#1F1F1F`. A glowing outline is strictly forbidden; focus is communicated through background tone shift and cursor intensity.

### Toggles, Checkboxes & Radios
- Selection indicators are flat geometric tiles in `#1F1F1F`.
- Active state fills the indicator with `#F3F3F3`, masking out inner geometry with `#0A0A0A`. No exterior glows or active pulse animation.

### Lists & Tree Views
- Rows avoid separator lines. Row items sit at `#0A0A0A` and illuminate to `#141414` on hover.
- Selected tree node sits permanently on `#1F1F1F` with a primary `#F3F3F3` typographic label.

### Inspector & Execution Dock
- Monolithic side panel floating above the workspace in `#141414`.
- Collapsible section groups defined by `space-lg` separation and `label-sm` category headers in `#737373` (uppercase, tracked +0.03em).