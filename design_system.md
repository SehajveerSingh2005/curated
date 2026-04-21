# Curated Design System

This document defines the visual language and UI components for the Curated platform.

## 🎨 Color Palette
The platform uses a high-contrast, monochrome aesthetic with subtle depth through OKLCH colors.

- **Background**: `oklch(0.99 0.001 80)` (Nearly white)
- **Background Alt**: `oklch(0.97 0.002 85)` (Subtle gray for alternates)
- **Foreground**: `oklch(0.08 0 0)` (Soft black)
- **Border**: `oklch(0.08 0 0 / 8%)` (Very subtle hairline)
- **Muted**: `oklch(0.5 0.005 85)` (Gray for secondary text)

## ✍️ Typography
Use these font families defined in [index.css](file:///c:/Users/sehaj/Documents/curated/client/src/index.css):

- **Headings (Sans)**: `'Space Grotesk'`
    - Weights: `font-black` (for titles), `font-bold` (for subheaders).
    - Style: Uppercase, `tracking-tighter`.
- **Editorial (Serif)**: `'Instrument Serif'`
    - Weights: `italic`.
    - Use: Large, artistic statements or emphasis.
- **Metadata (Mono)**: `'JetBrains Mono'`
    - Weights: `font-medium`.
    - Style: `uppercasse`, `tracking-[0.5em]`.
    - Use: Item tags, status labels, dates.

## 🏗️ UI Components

### 1. The Grid (Posters)
- Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Items should have `border border-foreground/5`.
- Images: `grayscale hover:grayscale-0 transition-all duration-700`.

### 2. Buttons
- **Primary**: `text-[11px] uppercase tracking-[0.5em] font-black text-foreground border-b border-foreground/15 pb-4 hover:border-foreground transition-all duration-500`.
- **Outlined**: `border border-foreground/20 px-10 py-4 uppercase tracking-widest font-black text-[10px] hover:bg-foreground hover:text-background`.

### 3. Cards (Wardrobe/Market)
- Hairline borders.
- No shadows (keep it flat and architectural).
- 0px border-radius (perfect corners).

## ✨ Animations
- Use `reveal-up` class for entrance animations.
- Use `blend-diff` on white text overlapping dark images/videos.
- Selection color: `selection:bg-foreground selection:text-background`.

> [!TIP]
> When in doubt, look at [Home.tsx](file:///c:/Users/sehaj/Documents/curated/client/src/pages/Home.tsx). If it feels too "busy", simplify. The goal is an editorial look, not a generic e-commerce app.
