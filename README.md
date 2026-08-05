# Kairo Engine 🚀

**Kairo Engine** is a modern, modular, high-performance 2D/3D TypeScript & WebAssembly Game Engine monorepo equipped with an integrated **Web Studio Editor**, **HTML5 Video Editing Engine**, 16 modular `@kairo/*` engine packages, 23 playable interactive demos, WebGL/WebGPU render pipelines, and decoupled Golang WebAssembly physics backends.

🌍 **Live Hub & Studio Editor:** [Play Kairo Engine Demos & Studio Here!](https://Baba01hacker666.github.io/Kairo/)

---

## ✨ Major Features
- **HTML5 Video Editing & Multitrack Sequencer Engine**: Built-in 6-track video timeline engine (`VideoTimeline`) with keyframed camera shots (`orbit`, `pan`, `dollyZoom`, `crane`), image/video overlays with CSS masking (`circle`, `rounded`, `hexagon`, `vignette`), lower-thirds, video transition cuts (`wipeLeft`, `wipeRight`, `circleWipe`, `glitch`), color grading presets (`cinematicWarm`, `cyberpunkNeon`, `noir`, `vintage`), audio track mixing, and 60 FPS WebM video rendering.
- **Unified EasyScript Master API**: Single, beginner-friendly entry point unifying all 16 engine packages (Physics, Audio, Particles, AI Pathfinding, Animations, IK, Asset Streaming, Blender `.blend` parsing, Cinematic Camera Shots, Video Editing, UI Modals, Multiplayer Network Sync).
- **Native Blender `.blend` File Loader**: Binary parser for Blender `.blend` models directly in WebGL and Kairo Studio.
- **Sketchfab 3D Asset Streamer**: Stream high-quality 3D models live into engine scenes directly via Sketchfab URL or UID.
- **Ahead-of-Time (AOT) Engine Compiler**: Pre-bakes O(1) spatial collision hashes, minifies EasyScript ASTs, quantizes geometry buffers, and compiles 1-click standalone HTML5 playable games.
- **Dual-Engine Architecture**: Native simultaneous WebGL/WebGPU support via Three.js and Babylon.js running on unified layered canvases.
- **Cross-Engine Physics Bridge**: Decoupled Cannon.js & Havok WASM physics world bridging collisions seamlessly.
- **Cinematic Cutscene Sequencer**: Async/Await powered linear cutscene engine with camera shakes, UI dialogues, flash/fade screen effects, and safe task aborts.
- **Procedural Geometry (`@kairo/geometry`)**: One-line heightmap terrain with surface sampling, instanced grass fields, low-poly scenery (trees/rocks/clouds), and PBR primitives — deterministic per seed.
- **AAA Post-Processing Pipeline**: Native integrated `EffectComposer` pipeline supporting high-fidelity Unreal Bloom, Film Grain, CRT scanlines, and glow outlines.
- **ECS (Entity Component System)**: Includes deep `SaveSystem` world-state serialization and recursive cloning.

---

## 🏗️ Monorepo Architecture (`@kairo/*` Packages)

Kairo is built from 16 decoupled, modular packages:

1. **`@kairo/core`**: Engine loop (`Engine`), High-level app wrapper (`KairoApp`), EventSystem, Vector/Quaternion math, ObjectPool, SaveSystem, Serializer, and `EasyScript` master scripting suite.
2. **`@kairo/ecs`**: Fast Component-Entity-System pipeline with Query indexing, World state management, and archetypes.
3. **`@kairo/renderer`**: WebGL 2.0 & WebGPU render pipeline, PBR materials, dynamic frustum culling, soft shadows, and particle emitters.
4. **`@kairo/physics`**: 3D & 2D physics simulation world with RigidBodies, Colliders, Raycasting, and Cannon.js / Havok integrations.
5. **`@kairo/animation`**: Keyframe animation clips, 1D/2D BlendTrees, skeletal joint hierarchies, and Inverse Kinematics (IK).
6. **`@kairo/audio`**: Web Audio API spatial synth, HRTF 3D positional sound, background music track manager, and SFX generator.
7. **`@kairo/input`**: Unified input manager for Keyboard, Mouse, Touch, Virtual Joystick, and Gamepad API.
8. **`@kairo/ai`**: A* NavMesh pathfinding grid solver, behavior tree nodes (Sequence, Selector, Action), and state machines.
9. **`@kairo/network`**: Client prediction, WebSocket transport client, state interpolator, RPC routing, and snapshot reconciliation.
10. **`@kairo/assets`**: Preloader and caching manager for `.blend`, `.glb`/`.gltf`, Sketchfab models, textures, audio buffers, and binary files.
11. **`@kairo/plugins`**: Plugin architecture with lifecycle hooks (`onLoad`, `onUpdate`, `onRender`, `onUnload`) and dependency tracking.
12. **`@kairo/ui`**: High-performance HTML5 overlay UI framework, `CinematicOverlayManager`, toast notifications, modals, achievements, and game HUD menus.
13. **`@kairo/tools`**: `VideoTimeline` Multi-Track Video Editor, Real-time CPU/GPU Profiler map, AOT Engine Compiler, MeshCompressor, and 60 FPS WebGL ScreenRecorder.
14. **`@kairo/geometry`**: One-line procedural meshes — heightmap terrain with surface sampling, instanced grass, low-poly scenery (trees/rocks/clouds), and PBR primitives.
15. **`packages/go-raylib`**: Native Golang WebAssembly Raylib API bindings and math library.
16. **`packages/c-raylib`**: Native C/C++ Raylib bindings.

---

## 🎛️ Kairo Studio & Web Editor (`/editor/`)

Kairo features a complete in-browser game studio & video editor:
- **🎬 HTML5 Video Timeline Editor**: Multi-track video editor with playhead scrubbing, camera shot keyframing, image overlay masking, title cards, color grading presets, and WebM video export.
- **Scene Hierarchy**: Dynamic 3D entity & object tree inspection and creation.
- **⚡ EasyScript Builder Panel**: Visual script generator with built-in presets (Spinners, Collectibles, WASD Player, AI Patrol, Particle Bursts, Video Timeline) and 1-click script execution.
- **Blender & Sketchfab Importer**: Import native `.blend` files or stream 3D models live from Sketchfab.
- **Inspector Panel**: Real-time property editing for transforms, components, and materials.
- **AOT Standalone Exporter**: Compile 1-click standalone HTML5 playable games directly from the studio.

---

## 🎮 Playable Examples (`examples/`)

Access all 23 interactive demos from the main hub page (`index.html`):

- ⚡ **Gem Hunter 3D Quest (EasyScript)**: 3D quest game built entirely using Kairo's unified `EasyScript` API with live in-game code view.
- 🎛️ **Kairo Studio & Web Editor**: Dual 2D/3D visual level editor, video editor studio, and game studio.
- 🦊 **Go + Three.js Fox Adventure**: Hybrid WASM physics backend with Three.js rendering & GLTF animations.
- 🔥 **Go + Raylib System Tester**: WebAssembly test suite & drawing engine powered by Go & Raylib.
- 🤸 **Modern Stickman 3D**: 2.5D physics platformer with custom character rigs and touch controls.
- 🏃 **3D Infinite Runner**: CPU software-rendered infinite runner written in pure Go WebAssembly.
- 🐹 **Golang WASM 3D Renderer**: Custom CPU rasterizer and 3D software rendering engine in Go.
- 🔮 **Babylon.js + Havok**: High-fidelity physics simulation with Babylon.js and Havok WASM.
- 🔫 **Mobile Shooter FPS**: Mobile dual-joystick FPS with physics projectile ballistics.
- 🧠 **AI Pathfinding & BT Studio**: Interactive A* NavMesh grid painter and live Behavior Tree monitor.
- 🚀 **Sci-Fi 3D Explorer**: Cyberpunk space station explorer with volumetric light pillars and drone physics.
- 🌸 **Cinematic Cherry Blossoms**: Particle emission and keyframe animation demo.
- ✨ **High-Quality PBR Render**: Physically Based Rendering with soft shadows and skeletal GLTF animation.
- 📊 **GDP Engine Architecture Explainer**: Interactive engine cycle and ECS visualizer with voiceover.
- 🌲 **Pure TS Fox Game**: 50 solvable partitioned level puzzle platformer with 3D laser beams and crate grab push/pull mechanics.
- 🎬 **The Arrival — Cinematic Short**: A fully choreographed sci-fi film — bloom post-processing, orbiting starfield, 3D canvas text, camera choreography, and dialogue subtitles.
- 🏰 **Procedural Dungeon Generator**: Demonstrates Cellular Automata cave generation and PRNG terrain logic.
- 🏔️ **Procedural Geometry Library**: One-line terrain, instanced grass, trees, rocks, clouds and primitives from `@kairo/geometry`.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/Baba01hacker666/Kairo.git
cd Kairo

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit & benchmark test suite (52 tests passing)
npm test

# Build production bundle
npm run build
```

---

*Built with TypeScript, Golang, WebAssembly, WebGL & Three.js.*
