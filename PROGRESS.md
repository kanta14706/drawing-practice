# Progress handoff

Read CLAUDE.md first (project rules, including which folders the owner writes themselves).

## Current status

- **Phase 0 (Setup): done except the Cloudflare Pages deploy.** Repo is pushed; `main` is in sync with `origin/main`.
- Last completed: CI workflow and folder placeholders. Working tree is clean.
- Next phase: **Phase 1 (Canvas)**, which the owner writes themselves.

## Done so far

- Vite + React + TypeScript (strict): `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`.
- `APP_NAME` constant in `src/config.ts`; used by `App.tsx` and injected into the `<title>` via a small Vite plugin in `vite.config.ts` (`%APP_NAME%` in `index.html`). Name is not final.
- Tailwind v4 via `@tailwindcss/vite`; `src/index.css` is just `@import "tailwindcss"`.
- ESLint 9 flat config (`eslint.config.js`) + Prettier (`.prettierrc.json`, `.prettierignore`).
- Vitest + jsdom + Testing Library: `vitest.config.ts`, `tests/setup.ts`, smoke test `tests/unit/App.test.tsx` (tests live in `tests/unit/`).
- Folder placeholders (README only): `src/{canvas,session,gallery,storage,components,store}`, `worker/`, `pipeline/`, `tests/e2e/`.
- CI: `.github/workflows/ci.yml` runs lint, typecheck, test, build on every push and PR.
- `.nvmrc` pins Node 24.

## Decisions made (not in CLAUDE.md)

- **npm** as package manager.
- **TypeScript pinned to ~6.0**: TS 7 installed by default but typescript-eslint's peer range excludes it. Unpin once typescript-eslint supports TS 7.
- **Tailwind v4** (no config file or PostCSS); needs Safari 16.4+, fine for tablet targets.
- **Prettier ignores** CLAUDE.md, README.md, LICENSE (owner-authored docs). Style: no semicolons, single quotes, width 100.
- **CI runs `build` too**, since Cloudflare Pages runs it; deploys use Cloudflare's Git integration, not Actions, so no secrets are needed yet.
- `tsconfig.app.json` includes `noUncheckedIndexedAccess`.
- **No Claude co-author trailers or "Generated with Claude Code" lines** on commits or PRs (owner's instruction). History was rewritten once to strip one from the CLAUDE.md commit.
- Per CLAUDE.md, do not write `src/canvas/` or `pipeline/` code unprompted.

## In progress / unfinished

- Cloudflare Pages not connected yet (owner action, see below).
- GitHub Actions result not yet confirmed green on the pushed commits.
- Nothing uncommitted besides this handoff.

## Known issues

- npm prints an `install-scripts` warning on install; harmless so far.
- Local Node is 26 while CI/Pages use 24; no problems seen.
- Placeholder `App` is not a real UI; replace it when Phase 1 starts.

## Next steps

1. Owner: confirm CI is green; connect Cloudflare Pages (below); then tick Phase 0 in CLAUDE.md.
2. Optional: branch protection on `main` requiring the CI check.
3. Phase 1 (owner writes `src/canvas/`; Claude explains and reviews): basic pointer drawing with `touch-action: none` -> DPR scaling -> stroke data model `{x, y, pressure, t}[]` with pressure fallback (mouse 0.5, touch 0) -> `getCoalescedEvents()` -> `perfect-freehand` rendering -> undo/clear -> palm rejection -> test on a real device.
4. Claude may write the canvas host page, toolbar (undo/clear) and unit tests for pure helpers once the stroke types exist.
5. Record a baseline input-to-ink latency measurement before any optimization.
6. Then Phase 2 (session loop), per the CLAUDE.md roadmap.

## How to run

```
npm ci              # install
npm run dev         # dev server
npm run lint        # ESLint
npm run typecheck   # tsc -b
npm test            # Vitest (single run); npm run test:watch for watch mode
npm run build       # typecheck + production build to dist/
npm run format      # Prettier write (format:check to verify)
```

**Deploy (Cloudflare Pages, via Git integration):** Workers & Pages -> Create -> Pages -> Connect to Git -> select this repo. Build command `npm run build`, output directory `dist`, production branch `main`. Add `NODE_VERSION=24` if `.nvmrc` isn't picked up. PRs get preview deploys automatically.
