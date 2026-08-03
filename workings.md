# Kairo Engine — workings.md

A map of how this repo *works*, what runs things, and how to build on it — so you don't have to read twenty files to answer "how does a change flow through here?". Think of this as the practical companion to `agents.md` (which holds hard-won rules/lessons) and `docs/API.md` / `docs/ARCHITECTURE.md` (which hold API/architecture detail).

---

## 1. What this is

Kairo is a **TypeScript-first, monorepo game engine** with:
- 14+ decoupled `@kairo/*` source packages (ECS, physics, renderer, audio, AI, UI, etc.).
- A high-level facade class, **`KairoApp`**, that wires the whole runtime together in one object.
- 21 standalone **examples** under `examples/` (games, cinematic, physics, Go WASM demos).
- A **Web Studio Editor** under `editor/`.
- Optional **Go + WebAssembly** physics/rendering backends (`packages/c-raylib`, `packages/go-raylib`).

Everything runs in the browser. There is no server code. Deployment is static → GitHub Pages.

---

## 2. Repo layout (what lives where)

| Path | Purpose |
|------|---------|
| `packages/*` | Engine source. Each is a **plain `src/` folder** — no per-package `package.json`. See "How packages resolve" below. |
| `examples/*` | Standalone demos. Each is a self-contained `index.html` + `main.ts`. |
| `editor/` | The Web Studio editor app (`app.js`, `style.css`, `index.html`). |
| `index.html` | The **hub page**: cards linking every demo + some category filter JS. |
| `tests/*.test.js` | Node-based unit/integration tests (run via `tsx`). |
| `scripts/` | Local helper scripts (screenshots, video generation). |
| `.github/workflows/` | CI, deploy, and QA video/screenshot automation. |
| `public/wasm/` | Pre-compiled WASM for Go demos (`wasm_exec.js` runtime must live here). |
| `docs/` | `API.md`, `ARCHITECTURE.md`, `EDITOR_GUIDE.md`, `PLUGIN_GUIDE.md`. |
| `dist/` | Build output — **gitignored**, generated fresh by `npm run build` each time, then published to `gh-pages` by CI (`deploy.yml`). |
| `go.mod` | Go module root for the Go WASM backends. |

### How do the `@kairo/*` packages resolve? (read this carefully)
There is **no npm workspace** and **no per-package `package.json`**. The `@kairo/*` names are virtual module aliases that point at `packages/*/src/index.ts`:
- `tsconfig.json` → `compilerOptions.paths` (for `tsc`, IDE)
- `vite.config.ts` → `resolve.alias` (for the runtime bundler)

So `import { KairoApp } from '@kairo/core'` is really `packages/core/src/index.ts`. **If you add a feature to a package, export it from that package's `src/index.ts`** — that's the public surface everything imports.

---

## 3. How the engine ticks (runtime flow)

1. An example `main.ts` does `new KairoApp({ canvas, ... })` (or a `mode: '2d'`/`'3d'` app).
2. **`KairoApp`'s constructor** wires everything and subscribes to the engine's event bus:
   - Creates `Engine` (owns the game loop) and a `THREE.Scene`, camera, renderer.
   - Boots `PhysicsWorld`, `CameraController`, the input/audio/UI managers, `CutsceneManager`, `SceneManager`, `SaveSystem`, `ScreenRecorder`, post-processing pipeline.
   - Registers the two core loop callbacks.
3. `app.start()` starts the loop. Per frame the `Engine` emits:
   - **`update`** → physics `step`, camera controller sync, `input.endFrame()`, any `app.onUpdate(...)` callbacks you registered.
   - **`render`** → render pipeline draws the scene (+ Babylon layer if enabled), then profiler metrics update.
4. The example's code runs on `update` (`app.onUpdate(dt => ...)`), via the `CutsceneManager`, or in event listeners.

**Engine event bus:** `Engine` is an `EventEmitter`-style bus (also exposed as `app.engine.events`). Subscribe with `events.on('update', cb)` — it returns an unsubscribe function. The `update`/`render` events are the heartbeat you hook into for custom logic.

---

## 4. Build / dev / test commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Vite dev server (live reload). |
| `npm run build` | `tsc --noEmit` → `vite build` → **copies `public/wasm/*` into `dist/wasm/`** and a few go-example `.wasm`/`.js` into `dist/examples/...`. |
| `npm run lint` | `tsc --noEmit` (type-check only). |
| `npm test` | Runs `tests/*.test.js` through `tsx` with Node's test runner (many tests exercise ECS/physics/animation/math). |

### Vite is a **multi-page** build
`vite.config.ts` has a hard-coded `rollupOptions.input` with one entry per HTML page. **If you create a new example page and it's not added there, it will not be emitted into `dist/`** (it still works in dev, but breaks the production deploy). Add it as `name: 'examples/<name>/index.html'`.

---

## 5. Adding a new example (the standard flow)

1. Create `examples/<name>/index.html` + `examples/<name>/main.ts`.
   - Canvas id can be anything; pass it to `new KairoApp({ canvas: 'my-canvas', background, shadows, mode })`.
   - Reference `wasm_exec.js` **relatively** (e.g. `../../wasm/wasm_exec.js`) if you use Go WASM, so it works on GitHub Pages.
   - For assets from `public/`, prefix with `(import.meta as any).env.BASE_URL` (guarantees correct path under the `/Kairo/` subfolder on Pages).
2. Register it in `vite.config.ts` inputs (see above).
3. Add a `.card` entry in the root `index.html` hub (with `data-cat` tags for the filter tabs).
4. Type-check (`npm run lint`), build (`npm run build`), and wire in any new tests.

**Go/WASM examples**: keep logic in Go (`main.go`), compile to `public/wasm/<name>.wasm` with `GOOS=js GOARCH=wasm go build -o ...`, and reference `wasm_exec.js` from `public/wasm`. Rebuild the `.wasm` **every time** you change the `.go` file.

---

## 6. Testing

- Tests live flat in `tests/**.test.js` (plain JS, not TS) and are run with `node --import tsx --test`.
- Open the native Node test APIs (`node:test`, `node:assert`). Some tests (ECS stress, SOA bench, physics, fox-movement, particles) push real performance/physics.
- **To add a test**: drop a `tests/<thing>.test.js` and — if you want it in the default run — it must already be listed in the `test` script in `package.json` (the script enumerates files explicitly, it does **not** glob). Add your file to that list.

---

## 7. CI/CD & deployment (how changes ship)

Pushing to `main` (direct commits are the norm here — see `agents.md`) triggers GitHub Actions:

- **`deploy.yml`** — builds and publishes `dist/` to the `gh-pages` branch → the live site at `https://Baba01hacker666.github.io/Kairo/`. This is how every feature reaches the world; **if you change the build, push to `main` and the deploy workflow makes it live.**
- **`ci.yml`** — type-checks + runs QA and builds artifacts (videos/screenshots).
- **`screenshots.yml`, `generate-video.yml`, `record-qa-video.yml`** — heavy headless-browser automation (Playwright/pixel work).

**Important project rule:** heavy/browser automation (video generation, pixel screenshots) should run in **GitHub Workflows, not local scripts**. When a task needs a headless browser or heavy env, write a GitHub Action instead of running it locally. Local verification is `npm run lint` + `npm test` + `npm run build`.

---

## 8. Feature inventory (key, already-implemented capabilities)

- **ECS** (`@kairo/ecs`) — entities/components/systems, queries.
- **Physics** (`@kairo/physics`) — Cannon-based rigid bodies + colliders, raycasts; optional Go WASM backends.
- **Renderer** (`@kairo/renderer`) — Three.js scene graph, PBR lighting (`app.setLighting`), **post-processing**: bloom, film grain, pixelation, selection outlines (`app.pipeline.postProcessing.*`). Tone mapping exposure.
- **`KairoApp` helpers** — `createBox`, `createBlock2D`, `createText3D` (canvas-texture text in 3D), screen capture + **video recording** (`captureScreenshot`, `startRecording`), `onUpdate`.
- **Cutscene** (`@kairo/core`) — `app.cutscene.play(async ctx => ...)` with `moveCamera`, `lookAt`, `showDialogue`, `shakeCamera`, `flashScreen`, `fadeScreen`, and **abort-safe awaits** (ESC skip).
- **UI** (`@kairo/ui`) — `UIManager`: toast, subtitle, achievement, modals, game menu, `flash`/`fade` screen effects. Themeable via `UITheme`. (Values are pushed through the CSS DOM, never concatenated into CSS strings — don't regress that.)
- **Audio** (`@kairo/audio`) — synthesized retro SFX via Web Audio.
- **AI** (`@kairo/ai`) — A* pathfinding + behavior trees.
- **Procedural** (in `@kairo/core`) — seeded PRNG, SimplexNoise, Cellular Automata cave gen.
- **Tools** (`@kairo/tools`) — debug inspector, screen recorder, debug renderer.
- **Babylon.js dual-engine** — optional second render layer.

---

## 9. Working conventions & golden rules

1. **Read `agents.md`** — it has specific, hard-won rules (third-person camera + OrbitControls, PBR lighting needs real lights, `BASE_URL` for assets, wasm rebuild discipline, conventional commits, push to main for deploys).
2. **Type-check before you done**: `npm run lint` then `npm run build`. Make `npm test` green if your change touches tested subsystems.
3. Commit message style (conventional): `feat:`, `fix:`, `docs:`, followed by a short summary. Push directly to `main` unless told otherwise — this is what triggers the live deploy workflow.
4. Don't run heavy headless-browser jobs locally — move them to a GitHub Action.
5. Keep examples self-contained and registered in `vite.config.ts` + the hub `index.html`.
6. When you change a Go backend, rebuild its `.wasm` into `public/wasm/`.

---

*Generated/maintained by agents — if you add a subsystem, example-flow, or change the build, update this document so the next reader doesn't re-live the discovery.*