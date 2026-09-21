---
name: Entrospec Carbon Editorial
colors:
  canvas: '#0A0A0A'
  surface-elevated: '#141414'
  surface-interactive: '#1F1F1F'
  surface-hover: '#282828'
  surface-accent: '#333333'
  text-primary: '#F3F3F3'
  text-secondary: '#A1A1A1'
  text-tertiary: '#737373'
  accent-phosphor: '#22C55E'
  accent-cobalt: '#3B82F6'
  accent-terracotta: '#E06D53'
  error: '#EF4444'
typography:
  fontFamily:
    sans: 'Hanken Grotesk, sans-serif'
    mono: 'Geist Mono, JetBrains Mono, monospace'
  display:
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-lg:
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-sm:
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  label-sm:
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  md: 0.25rem
  lg: 0.5rem
  full: 9999px
spacing:
  base: 8px
  margin: 2.5rem
  gutter: 1.5rem
---

# Entrospec Design System: Carbon Editorial

## 1. Core Atmosphere & Philosophy
Entrospec is built for elite frontend practitioners, interaction designers, and growth engineers. The atmosphere is **deep, monolithic, and austere** (`#0A0A0A`). The UI recedes completely to let generative landing pages and high-entropy prompts command visual attention.

- **Zero-Border Discipline:** 0px borders everywhere. Spatial division relies entirely on luminance stacking (`#0A0A0A` -> `#141414` -> `#1F1F1F` -> `#282828`) and negative space.
- **Negative Space Breathing:** Generous padding (`px-8 py-10`, `gap-6` to `gap-8`) preventing cognitive overload.
- **Anti-AI Slop:** Banned AI cliches (no emojis ✨🚀, no decorative live pulsing dots, no bento grids by default, no purple/cyan AI gradients, no generic stock images).

## 2. Color Calibration & Roles
- **Canvas Base (`#0A0A0A`):** Foundational void. Canvas background, outer application framing.
- **Elevated Graphite (`#141414`):** Primary structural surface for control panels, editor docks, sidebar sheets.
- **Interactive Surface (`#1F1F1F`):** Unselected pills, inputs, interactive cards, secondary buttons.
- **Active / Hover State (`#282828`):** Hover feedback, pressed buttons, selected segmented pill states.
- **Structural Accent (`#333333`):** Scroller thumbs, active focus markers, subtle dividers without lines.
- **Text Primary (`#F3F3F3`):** Highest contrast off-white for headers, hero titles, active CTA text.
- **Text Secondary (`#A1A1A1`):** Subheadings, parameters, code snippets, metadata.
- **Text Tertiary / Muted (`#737373`):** Placeholders, timestamps, micro-labels.

## 3. Typographic Architecture
- **Primary Body & Display:** `Hanken Grotesk` (Google Fonts).
- **Seed & Code Display:** Monospace (`Geist Mono`, `JetBrains Mono` or system fallback).
- **Scale Hierarchy:**
  - `Display` (56px / 600 weight / tracking -0.03em)
  - `Headline LG` (32px / 500 weight / tracking -0.02em)
  - `Headline SM` (20px / 500 weight / tracking -0.01em)
  - `Body MD` (14px / 400 weight / line-height 22px)
  - `Label SM` (11px / 500 weight / uppercase / tracking +0.03em)

## 4. Component Stylings
- **Buttons:**
  - *Primary:* Monolithic `#F3F3F3` background, `#0A0A0A` text, 0.98 active scale down, zero outer glow.
  - *Secondary:* Matte `#1F1F1F` background, `#F3F3F3` text, `#282828` on hover.
  - *Ghost:* `#A1A1A1` text, `#F3F3F3` on hover with transparent background.
- **Inputs & Textareas:**
  - `#141414` matte background, `#737373` placeholder, `#F3F3F3` active text.
  - Focus state shifts background tone to `#1F1F1F` (0px outline).
- **Segmented Pills:**
  - Track in `#141414` (`rounded-full`), active pill in `#282828` with `#F3F3F3` text.
- **Workspace Split-View:**
  - Grid 1:1 (Lg: 50% / 50%), gap 24px, separated by negative space void `#0A0A0A`.

## 5. The 8 Advanced Techniques Integration
1. **SSoT Seed Engine:** Mathematical string generation (24–32 chars) + Sum-Mod chunking.
2. **Ambitious Prompts:** Cognitive psychology, market sophistication, objection inoculation.
3. **Creator-Critic Loop:** Automated NoveltyBench audit (Distinctiveness & Utility) with $\ge 8.5/10$ admission rule.
4. **Macro Visual Assets:** Studio lighting, macro lenses, 0 stock photos.
5. **Video & Motion:** Cinematic ambient motion guiding user attention.
6. **Subtractive Design:** 30% reduction of decorative elements.
7. **Negative Constraints:** Anti-AI slop vocabulary & layout bans.
8. **Human Redaction:** Friction-reducing micro-copy and high-converting CTAs.
