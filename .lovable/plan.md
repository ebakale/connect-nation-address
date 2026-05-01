
# ConEG Promotional Video

A 25-second motion graphics video (1920x1080, 30fps) presenting ConEG's platform to potential government clients. Rendered to MP4 via Remotion.

## Creative Direction

- **Style**: Cinematic Government Tech — clean, authoritative, trustworthy
- **Palette**: Navy blue (#0A2D6B), gold accent (#D4A853), white text, dark gradient backgrounds
- **Typography**: Inter (body) + Poppins (headings) via `@remotion/google-fonts`
- **Motion**: Smooth spring reveals, slide-up entrances, fade transitions between scenes
- **Motifs**: Map pin icons, shield/security elements, geometric grid patterns

## 5 Scenes (750 frames total at 30fps = 25 seconds)

### Scene 1 — Opening Hook (0-150 frames, 5s)
"Every address. Every emergency. Every delivery." typed out with the ConEG logo reveal. Navy background with subtle animated grid. Establishes authority.

### Scene 2 — The Problem (150-300 frames, 5s)
Stats panel: "No standardized postal system", "Emergency delays +15-30 min", "Citizens without formal addresses". Red accent for urgency, items stagger in.

### Scene 3 — Three Pillars (300-480 frames, 6s)
Three cards slide in showing the modules:
- National Address Registry (NAR/CAR)
- Emergency Management (112 Dispatch)
- Postal & Logistics Service
Each with an icon and 1-line description.

### Scene 4 — Key Features (480-630 frames, 5s)
Animated feature list: UAC codes, GPS verification, multilingual (ES/FR), offline capability, government-grade security. Items fly in with spring physics.

### Scene 5 — Closing (630-750 frames, 4s)
Logo + tagline: "ConEG — Connecting Equatorial Guinea". Gold accent line expands. Contact/branding fade in.

## Technical Plan

| File | Purpose |
|------|---------|
| `remotion/tsconfig.json` | TypeScript config |
| `remotion/src/index.ts` | Entry point with registerRoot |
| `remotion/src/Root.tsx` | Composition registration (750 frames, 30fps, 1920x1080) |
| `remotion/src/MainVideo.tsx` | TransitionSeries wiring 5 scenes with fade transitions |
| `remotion/src/scenes/Scene1Opening.tsx` | Logo + tagline reveal |
| `remotion/src/scenes/Scene2Problem.tsx` | Problem stats panel |
| `remotion/src/scenes/Scene3Pillars.tsx` | Three module cards |
| `remotion/src/scenes/Scene4Features.tsx` | Feature list animation |
| `remotion/src/scenes/Scene5Closing.tsx` | Final branding |
| `remotion/scripts/render-remotion.mjs` | Programmatic render script |

Output: `/mnt/documents/coneg-promo.mp4`
