# Kairo Engine — workings.md

A map of how this repo *works*, what runs things, and how to build on it — so you don't have to read twenty files to answer "how does a change flow through here?". Think of this as the practical companion to `agents.md` (which holds hard-won rules/lessons) and `docs/API.md` / `docs/ARCHITECTURE.md` (which hold API/architecture detail).

---

## 1. What this is

Kairo is a **TypeScript-first, monorepo game engine** with:
- 16 decoupled `@kairo/*` source packages (ECS, physics, renderer, audio, AI, UI, geometry, assets, tools, etc.).
- **`EasyScript` Master Scripting API**: Unified, beginner-friendly single-line entry point to every engine package & subsystem.
- A high-level facade class, **`KairoApp`**, that wires the whole runtime together in one object.
- 23 standalone **examples** under `examples/` (games, easy-script quest, cutscenes, physics, Go WASM demos).
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
| `index.html` | The **hub page**: cards linking every demo + category filter JS. |
| `tests/*.test.js` | Node-based unit/integration tests (run via `tsx`). |
| `scripts/` | Local helper scripts (screenshots, video generation). |
| `.github/workflows/` | CI, deploy, and QA video/screenshot automation. |
| `public/wasm/` | Pre-compiled WASM for Go demos (`wasm_exec.js` runtime must live here). |
| `docs/` | `EASY_SCRIPT.md`, `API.md`, `ARCHITECTURE.md`, `EDITOR_GUIDE.md`, `PLUGIN_GUIDE.md`. |
| `dist/` | Build output — **gitignored**, generated fresh by `npm run build` each time, then published to `gh-pages` by CI (`deploy.yml`). |
| `go.mod` | Go module root for the Go WASM backends. |

### How do the `@kairo/*` packages resolve?
The `@kairo/*` names are virtual module aliases that point at `packages/*/src/index.ts`:
- `tsconfig.json` → `compilerOptions.paths` (for `tsc`, IDE)
- `vite.config.ts` → `resolve.alias` (for the runtime bundler)

---

## 3. How the engine ticks (runtime flow)

1. An example `main.ts` does `new KairoApp({ canvas, ... })` (or uses `EasyScript`).
2. **`KairoApp`'s constructor** wires everything and subscribes to the engine's event bus:
   - Creates `Engine` (owns the game loop) and a `THREE.Scene`, camera, renderer.
   - Boots `PhysicsWorld`, `CameraController`, input/audio/UI managers, `CutsceneManager`, `SceneManager`, `SaveSystem`, `ScreenRecorder`, post-processing pipeline.
   - Registers core loop callbacks.
3. `app.start()` starts the loop. Per frame the `Engine` emits:
   - **`update`** → physics `step`, camera controller sync, `input.endFrame()`, `EasyScript` ticks, `app.onUpdate(...)` callbacks.
   - **`render`** → render pipeline draws the scene, then profiler metrics update.

---

## 4. Build / dev / test commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Vite dev server (live reload). |
| `npm run build` | `tsc --noEmit` → `vite build` → copies `public/wasm/*` into `dist/wasm/`. |
| `npm run lint` | `tsc --noEmit` (type-check only). |
| `npm test` | Runs all 48 test suites in `tests/*.test.js` through `tsx`. |

---

## 5. Feature Inventory

- **EasyScript Master API** (`@kairo/core` -> `ScriptBehavior` & `EasyScript`): Unified single-line helpers for motion (`spin`, `bob`, `patrol`, `jump`), AI (`chase`, `navigateTo`), sound (`playSound`), particles (`sparkle`, `explode`), assets (`streamSketchfab`, `loadBlenderModel`), camera (`shakeCamera`), UI (`say`, `showModal`), and network state sync (`syncState`, `sendRPC`).
- **Blender `.blend` Loader** (`@kairo/assets` -> `BlendLoader`): Native binary parser for Blender 3D files.
- **Sketchfab Asset Streamer** (`@kairo/assets`): Stream high quality 3D GLTF models directly from Sketchfab.
- **AOT Engine Compiler** (`@kairo/tools` -> `EngineCompiler`): Bakes spatial collision hashes, minifies EasyScript ASTs, quantizes geometry, and exports 1-click standalone HTML5 games.
- **ECS** (`@kairo/ecs`) — entities/components/systems, queries.
- **Physics** (`@kairo/physics`) — Cannon-based rigid bodies + colliders, raycasts; optional Go WASM backends.
- **Renderer** (`@kairo/renderer`) — Three.js scene graph, PBR lighting, post-processing (bloom, film grain, pixelation, selection outlines).
- **Geometry** (`@kairo/geometry`) — procedural heightmap terrain, instanced grass fields, low-poly scenery (trees/rocks/clouds), and PBR primitives.

---

*Generated/maintained by agents.*