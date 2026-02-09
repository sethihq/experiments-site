# Experiments Site - Project Context

## Overview
A personal portfolio site for WebGL and Three.js experiments, inspired by [gxuri.in/gallery](https://gxuri.in/gallery) and [skiper-ui.com](https://skiper-ui.com).

## Tech Stack
- **Framework:** Next.js 15.2 with Turbopack
- **React:** 19.0
- **Styling:** Tailwind CSS 3.4
- **Animations:** Framer Motion 11.15
- **Fonts:** Geist Sans/Mono + Instrument Serif (Google Fonts)
- **Icons:** Lucide React

## Design System

### Colors (from gxuri.in)
```css
--background: #080808;
--foreground: #ededed;
--muted: #121212;
--muted2: #161616;
--muted3: #232323;
--accent: #0ea5e9; /* sky-500 */
```

### Typography
- **Sans:** Geist Sans (body text)
- **Mono:** Geist Mono (numbers, code)
- **Serif:** Instrument Serif (GALLERY title, italic)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts, KeyboardNav
│   ├── page.tsx            # Gallery home page
│   ├── globals.css         # Theme colors, animations
│   ├── exp/[id]/
│   │   ├── page.tsx        # Experiment viewer with sidebar
│   │   └── layout.tsx      # Dynamic metadata
│   └── resources/
│       ├── page.tsx        # Learning resources
│       └── layout.tsx      # Metadata
├── components/
│   ├── gallery-card.tsx    # Experiment preview card
│   ├── keyboard-nav.tsx    # Global keyboard shortcuts
│   └── page-transition.tsx # Framer motion wrapper
└── lib/
    ├── experiments.ts      # Experiment data array
    └── utils.ts            # cn() helper
```

## Features Implemented

### Gallery Page (`/`)
- 3-column grid of experiment cards
- Pill-style navigation (Gallery / Resources)
- "GALLERY — 9" header with animated line
- Staggered fade-up animations
- Hover effects: scale, gradient overlay

### Experiment Page (`/exp/[id]`)
- **Desktop:** Fixed left sidebar (320px) with skiper-ui style navigation
- **Mobile:** Slide-out drawer with hamburger menu
- Line indicators that expand on hover
- Sky-500 accent for active state
- Top action bar (fullscreen, external link, code, grid)
- Footer with prev/next navigation
- Arrow key navigation (← →)

### Resources Page (`/resources`)
- List of curated learning resources
- Links to: Book of Shaders, Maxime Heckel's Blog, Three.js Journey, Shadertoy, WebGL Fundamentals

### Keyboard Shortcuts
- `G` → Gallery (/)
- `R` → Resources (/resources)
- `1-9` → Jump to experiment
- `←/→` → Prev/next experiment
- `Escape` → Back to gallery

### Other Features
- Page transitions with framer-motion
- Mobile responsive design
- Dynamic OG metadata per page
- suppressHydrationWarning (for browser extensions)

## Reference Codebases
Downloaded static exports are in the project folder for design reference:
- `gxuri.in/` - Color scheme, typography, card styles
- `skiper_ui.com/` - Sidebar navigation pattern

## Current Experiments Data
Located in `src/lib/experiments.ts`:
- 9 placeholder experiments
- Fields: id, number, title, description, tags, href, year, isNew, previewColor

## Next Steps (Planned)
User wants to create **Experiment #1: Interactive Shader**
- Upload logo functionality
- Real-time shader parameter controls (sliders)
- WebGL/Three.js rendering
- Shader effects: distortion, glow, noise, color shifts
- Preset effects to choose from

## Commands
```bash
npm run dev    # Start dev server (uses Turbopack)
npm run build  # Production build
npm run start  # Start production server
```

## Notes
- Dev server runs on port 3000 (or 3001 if 3000 is busy)
- The experiment pages currently show placeholder content (big numbers)
- Each experiment will eventually have its own WebGL/shader implementation
