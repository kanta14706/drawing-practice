# Gesture Drawing Practice App

A web app for timed gesture/croquis drawing practice (30s, 1m, 2m, 5m poses). A reference image is shown beside an in-browser drawing canvas with pen pressure support. Built mainly for tablets (iPad + Apple Pencil, Samsung + S Pen) and computers with drawing tablets (Wacom etc.).

This is a hobby + portfolio project by a 3rd-year CS student. It should be well-engineered and easy to explain in interviews.

## How to work with me

- **I write the core engine myself.** For the canvas/stroke engine (`src/canvas/`) and the ML ingest pipeline (`pipeline/`), do NOT write large chunks unprompted. Explain concepts, review my code, suggest improvements, and answer questions. Only write code there when I explicitly ask.
- Boilerplate, config, CI, UI components, styling, and tests: go ahead and write these.
- Keep PRs/changes small and focused. Use clear conventional commit messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- When making a technical decision, briefly explain the trade-off so I can talk about it later.
- When something is measurable (latency, bundle size, filter precision), suggest how to measure it.

## Tech stack

**Frontend**
- TypeScript (strict) + React + Vite
- Canvas 2D API for drawing; `perfect-freehand` for pressure strokes
- Later: OffscreenCanvas in a Web Worker, possibly WebGL
- Zustand for state
- Tailwind CSS
- Dexie (IndexedDB) for in-session saving
- JSZip for export
- vite-plugin-pwa for install/offline

**Backend (thin)**
- Cloudflare Workers (TypeScript): image API proxy + caching, serves curated set
- Cloudflare R2: curated image storage
- Cloudflare D1 (SQLite): image metadata
- Later: Supabase Auth + Storage for accounts/cloud galleries
- Stretch: Durable Objects / PartyKit for live group sessions

**ML**
- MediaPipe Pose or TF.js MoveNet: full-body detection, pose "dynamism" scoring, gesture overlay
- NSFW.js: content classification
- Runs in the offline ingest pipeline (Python or Node), not on users' devices, except the gesture overlay

**Tooling**
- Vitest (unit), Playwright (e2e, including simulated pen pointer events with pressure)
- ESLint + Prettier
- GitHub Actions CI: lint, typecheck, test, deploy
- Cloudflare Pages hosting with PR preview deploys

## Key design decisions

1. **Strokes are stored as vector data**, not just pixels: `{ x, y, pressure, t }[]` per stroke. This enables undo, replay/timelapse, SVG export, and small storage. Raster snapshots (`canvas.toBlob`) are generated for gallery/export.
2. **Pointer Events only** (no mouse/touch events):
   - Use `getCoalescedEvents()` for full pen sample rate; consider `getPredictedEvents()` for lower perceived latency.
   - `pressure` fallback: mouse reports 0.5 when pressed and some touch reports 0, so handle both.
   - Palm rejection: ignore `pointerType === 'touch'` while a pen is active.
   - Canvas needs `touch-action: none`; scale by `devicePixelRatio`.
3. **Saving never interrupts the session.** On each pose's timer end, async-save strokes + snapshot + reference metadata to IndexedDB. Next reference is preloaded (keep 2–3 ahead) so transitions are instant. An end-of-session gallery shows drawing beside reference, with ZIP and contact-sheet export.
4. **Every reference image carries license metadata**: author, source URL, license. Attribution is shown under each reference. No images from sites that don't permit reuse (e.g. Line of Action, Quickposes, Pose Library) unless permission is obtained.
5. **Nudity handling**
   - User toggle, OFF by default, with an 18+ confirmation when enabled. Persisted per device.
   - Each image tagged `nudity: 'none' | 'partial' | 'full'`.
   - Toggle off: exclude anything not confidently safe. Toggle on: still reject sexual/explicit content. Artistic nudity only.
   - Nude references only from curated sources with clear adult-model consent (reference packs, museum sculpture), never open APIs.
   - Report button on every reference.

## Reference image sources

- **Curated core set** (self-hosted in R2), with license per image: e.g. SenshiStock, CharacterDesigns (CC), museum open-access collections (Cleveland Museum of Art, Met, Rijksmuseum: sculpture and master drawings).
- **Explore pool from APIs**: Pexels (200 req/hr, 20k/month, credit required), Unsplash (50 req/hr in demo mode), Wikimedia Commons, Flickr (CC-license filter). Always proxied and cached through the Worker; API keys never reach the client.
- **User uploads**: processed locally, never uploaded.
- **Stretch**: 3D-generated poses (Three.js + rigged model + Mixamo animations, random frame/camera/lighting).
- Note: JookPubStock forbids AI use; don't run ML on or train with those images without checking with the creator.

## Ingest pipeline (`pipeline/`)

fetch candidates → content check (NSFW.js) → full-body check (pose model) → dynamism score → admin review for borderline cases → write to R2 + D1.

## Proposed structure

```
src/
  canvas/       # stroke engine (I write this)
  session/      # timer, pose queue, preloading
  gallery/      # end-of-session review + export
  storage/      # Dexie schema + helpers
  components/   # UI
  store/        # Zustand stores
worker/         # Cloudflare Worker API
pipeline/       # ML ingest scripts (I write this)
tests/
  unit/
  e2e/
```

## Roadmap

- [ ] **Phase 0 – Setup:** repo, Vite + React + TS, Tailwind, ESLint/Prettier, CI, deploy hello world to Cloudflare Pages.
- [ ] **Phase 1 – Canvas:** pointer events, pressure, coalesced events, DPR scaling, undo/clear, palm rejection, vector stroke storage. Test on real devices. Don't move on until it feels good.
- [ ] **Phase 2 – Session loop:** timer, pose queue, preloading, pause/skip, session config screen (durations, pose count, nudity toggle). Hardcoded test images. Unit tests for timer/state.
- [ ] **Phase 3 – Saving & gallery:** IndexedDB per-pose saves, end-of-session gallery, ZIP + contact-sheet export. → **MVP: share for feedback.**
- [ ] **Phase 4 – Real references:** Worker proxy, R2 + D1 schema, curated set with licenses, attribution UI, nudity tags.
- [ ] **Phase 5 – ML pipeline:** ingest script, pose + content filtering, dynamism scoring, admin review page, client-side gesture overlay.
- [ ] **Phase 6 – Polish/stretch:** PWA/offline, stroke replay, performance work (measure input-to-ink latency, OffscreenCanvas), Playwright e2e, then group sessions or 3D poses.

## Portfolio goals

- README with GIF demo, architecture diagram, and a "technical challenges" section.
- Record concrete metrics: input-to-ink latency before/after optimizations, filter precision/rejection rate, Lighthouse scores.
- Possible dev blog post on coalesced pointer events or the ML pipeline.
