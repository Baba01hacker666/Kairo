# Kairo Engine — workings.md

A map of how this repo *works*, what runs things, and how to build on it — so you don't have to read twenty files to answer "how does a change flow through here?". Think of this as the practical companion to `agents.md` (which holds hard-won rules/lessons) and `docs/API.md` / `docs/ARCHITECTURE.md` (which hold API/architecture detail).

---

## 1. What this is

Kairo is a **TypeScript-first, monorepo game engine** with:
- 16 decoupled `@kairo/*` source packages (ECS, physics, renderer, audio, AI, UI, geometry, assets, tools, etc.).
- **HTML5 Video Editing Engine**: Multi-track video editor timeline engine (`VideoTimeline`) supporting keyframed camera shots, image overlays with CSS masking, title cards, video transitions, color grading, and WebM video export.
- **`EasyScript` Master Scripting API**: Unified, beginner-friendly single-line entry point to every engine package & subsystem.
- A high-level facade class, **`KairoApp`**, that wires the whole runtime together in one object.
- 23 standalone **examples** under `examples/` (games, easy-script quest, cutscenes, physics, Go WASM demos).
- A **Web Studio & Video Editor** under `editor/`.
- Optional **Go + WebAssembly** physics/rendering backends (`packages/c-raylib`, `packages/go-raylib`).

Everything runs in the browser. There is no server code. Deployment is static → GitHub Pages.

---

## 2. Repo layout (what lives where)

| Path | Purpose |
|------|---------|
| `packages/*` | Engine source. Each is a **plain `src/` folder** — no per-package `package.json`. |
| `examples/*` | Standalone demos. Each is a self-contained `index.html` + `main.ts`. |
| `editor/` | The Web Studio & Video Editor app (`app.js`, `style.css`, `index.html`). |
| `index.html` | The **hub page**: cards linking every demo + category filter JS. |
| `tests/*.test.js` | Node-based unit/integration tests (52 tests run via `tsx`). |
| `scripts/` | Local helper scripts (screenshots, video generation). |
| `.github/workflows/` | CI, deploy, and QA video/screenshot automation. |
| `public/wasm/` | Pre-compiled WASM for Go demos (`wasm_exec.js` runtime must live here). |
| `docs/` | `EASY_SCRIPT.md`, `API.md`, `ARCHITECTURE.md`, `EDITOR_GUIDE.md`, `PLUGIN_GUIDE.md`. |
| `dist/` | Build output — **gitignored**, generated fresh by `npm run build` each time, then published to `gh-pages` by CI (`deploy.yml`). |

---

## 3. Feature Inventory

- **HTML5 Video Editing Engine** (`@kairo/tools` -> `VideoTimeline`): Multi-track video editing timeline engine supporting keyframed camera shots (`orbit`, `pan`, `dollyZoom`, `crane`), image overlays with CSS masking (`circle`, `rounded`, `hexagon`, `vignette`), lower-thirds, video transition cuts (`wipeLeft`, `circleWipe`, `glitch`), color grading presets (`cinematicWarm`, `cyberpunkNeon`, `noir`, `vintage`), and 60 FPS WebM video rendering.
- **EasyScript Master API** (`@kairo/core` -> `ScriptBehavior` & `EasyScript`): Unified single-line helpers for motion (`spin`, `bob`, `patrol`, `jump`), video editing (`createVideoTimeline`, `addCameraShot`, `addVideoOverlay`, `addVideoText`, `addVideoTransition`, `addVideoColorGrading`, `playVideoTimeline`, `exportVideoFile`), AI (`chase`, `navigateTo`), sound (`playSound`), particles (`sparkle`, `explode`), assets (`streamSketchfab`, `loadBlenderModel`), camera (`shakeCamera`), UI (`say`, `showModal`), and network state sync (`syncState`, `sendRPC`).
- **Blender `.blend` Loader** (`@kairo/assets` -> `BlendLoader`): Native binary parser for Blender 3D files.
- **Sketchfab Asset Streamer** (`@kairo/assets`): Stream high quality 3D GLTF models directly from Sketchfab.
- **AOT Engine Compiler** (`@kairo/tools` -> `EngineCompiler`): Bakes spatial collision hashes, minifies EasyScript ASTs, quantizes geometry, and exports 1-click standalone HTML5 games.

---

*Generated/maintained by agents.*