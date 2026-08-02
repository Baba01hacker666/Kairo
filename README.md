# Kairo Engine 🚀

**Kairo Engine** is a modern, modular, high-performance 2D/3D TypeScript & WebAssembly Game Engine monorepo equipped with an integrated **Web Studio Editor**, 15 modular `@kairo/*` engine packages, 14 playable interactive demos, WebGL/WebGPU render pipelines, and decoupled Golang WebAssembly physics backends.

🌍 **Live Hub & Studio Editor:** [Play Kairo Engine Demos & Studio Here!](https://Baba01hacker666.github.io/Kairo/)

---

## ✨ Major Features
- **Dual-Engine Architecture**: Native simultaneous WebGL/WebGPU support via Three.js and Babylon.js running on unified layered canvases.
- **Cross-Engine Physics Bridge**: A decoupled Cannon.js physics world that seamlessly bridges collisions between Three.js meshes and Babylon.js meshes.
- **Cinematic Cutscene Sequencer**: Async/Await powered linear cutscene engine with camera shakes, UI dialogues, flash/fade screen effects, and safe task aborts.
- **Scene Manager**: Secure memory-leak proof level loader that automatically dismantles Physics, GUI, and recursive WebGL/WebGPU scene graphs.
- **Procedural Generation**: Includes native SimplexNoise, PRNG, and Cellular Automata mapping.
- **Advanced Debug Renderer**: Real-time rendering of AABB bounding boxes, XZ coordinate grids, wireframe hybrids, and pivot indicators.
- **AAA Post-Processing Pipeline**: Native integrated `EffectComposer` pipeline supporting high-fidelity Unreal Bloom, Film Grain, CRT scanlines, and glow outlines.
- **Dynamic 3D Text**: Native Canvas2D to 3D Plane texture mapping with full CSS font/emoji support.
- **ECS (Entity Component System)**: Includes deep `SaveSystem` world-state serialization and recursive cloning.

---

## 🏗️ Monorepo Architecture (`@kairo/*` Packages)

Kairo is built from 15 decoupled, modular packages:

1. **`@kairo/core`**: Engine loop (`Engine`), High-level app wrapper (`KairoApp`), EventSystem, Vector/Quaternion math, ObjectPool, SaveSystem, and Serializer.
2. **`@kairo/ecs`**: Fast Component-Entity-System pipeline with Query indexing, World state management, and archetypes.
3. **`@kairo/renderer`**: WebGL 2.0 & WebGPU render pipeline, PBR materials, dynamic frustum culling, soft shadows, and particle emitters.
4. **`@kairo/physics`**: 3D & 2D physics simulation world with RigidBodies, Colliders, Raycasting, and Cannon.js / Havok integrations.
5. **`@kairo/animation`**: Keyframe animation clips, 1D/2D BlendTrees, skeletal joint hierarchies, and state machines.
6. **`@kairo/audio`**: Web Audio API spatial synth, HRTF 3D positional sound, background music track manager, and SFX generator.
7. **`@kairo/input`**: Unified input manager for Keyboard, Mouse, Touch, Virtual Joystick, and Gamepad API.
8. **`@kairo/ai`**: A* NavMesh pathfinding grid solver, behavior tree nodes (Sequence, Selector, Action), and state machines.
9. **`@kairo/network`**: Client prediction, WebSocket transport client, state interpolator, RPC routing, and snapshot reconciliation.
10. **`@kairo/assets`**: Preloader and caching manager for `.glb`/`.gltf` models, textures, audio buffers, and binary files.
11. **`@kairo/plugins`**: Plugin architecture with lifecycle hooks (`onLoad`, `onUpdate`, `onRender`, `onUnload`) and dependency tracking.
12. **`@kairo/ui`**: High-performance HTML5 overlay UI framework, toast notifications, modals, achievements, and game HUD menus.
13. **`@kairo/tools`**: Real-time CPU/GPU Profiler map, AOT Engine Compiler, MeshCompressor, and 60 FPS WebGL ScreenRecorder.
14. **`packages/go-raylib`**: Native Golang WebAssembly Raylib API bindings and math library.
15. **`packages/c-raylib`**: Native C/C++ Raylib bindings.

---

## 🎛️ Kairo Studio & Web Editor (`/editor/`)

Kairo features a complete in-browser game studio editor:
- **Scene Hierarchy**: Dynamic 3D entity & object tree inspection and creation.
- **Inspector Panel**: Real-time property editing for transforms, components, and materials.
- **Dual Viewport**: Toggle between 3D WebGL Web Studio and 2D Canvas Engine viewports.
- **Animation & Physics Tools**: Motion speed controls, IK elevation, particle sliders, and joint state monitors.
- **Playable Demos**: Play embedded platformer games with touch/keyboard controls directly inside the studio.

---

## 🎮 Playable Examples (`examples/`)

Access all 14 interactive demos from the main hub page (`index.html`):

- 🎛️ **Kairo Studio & Web Editor**: Dual 2D/3D visual level editor and game studio.
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
- 📦 **Super Easy Starter API Demo**: Beginner-friendly physics scene using `KairoApp`.
- 🌲 **Pure TS Fox Game**: Third-person platformer game engine implementation in pure TypeScript.

- 🎬 **Cinematic Cutscene Demo**: Showcases the new async cutscene sequencer, screen effects, and UI dialogue system.
- 🏰 **Procedural Dungeon Generator**: Demonstrates Cellular Automata cave generation and PRNG terrain logic.

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

# Run unit test suite (26 tests)
npm test

# Build production bundle
npm run build
```

---

*Built with TypeScript, Golang, WebAssembly, WebGL & Three.js.*
