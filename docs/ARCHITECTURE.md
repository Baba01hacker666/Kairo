# Kairo Engine - Architecture & Design Specifications

Kairo is a modern, modular, high-performance 2D/3D game engine written primarily in TypeScript. It is designed browser-first with desktop support via Electron/Tauri, featuring a unified **EasyScript Master Layer**, an extensible Entity Component System (ECS), WebGL2/WebGPU rendering pipeline, 2D/3D impulse physics engine, spatial Web Audio synthesizer, AI behavior trees & NavMesh pathfinding, and a Web-based Editor UI inspired by Unity, Unreal Engine, and Godot.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    User["Web Browser / Desktop (Electron/Tauri)"] --> EditorUI["Web-Based Editor Studio (HTML5/CSS3)"]
    EditorUI --> EasyScript["EasyScript Master Layer (Unified API)"]
    EasyScript --> EngineCore["@kairo/core Engine Main Loop"]
    
    subgraph Monorepo Subsystems
        EngineCore --> ECS["@kairo/ecs (Sparse Set & Queries)"]
        EngineCore --> Renderer["@kairo/renderer (WebGL2 / WebGPU / Three.js)"]
        EngineCore --> Physics["@kairo/physics (RigidBodies, Colliders & Joints)"]
        EngineCore --> Audio["@kairo/audio (Spatial Web Audio)"]
        EngineCore --> Input["@kairo/input (Keyboard, Mouse, Gamepad, Touch)"]
        EngineCore --> AI["@kairo/ai (Behavior Trees & NavMesh)"]
        EngineCore --> Network["@kairo/network (RPC & Entity Replication)"]
        EngineCore --> Assets["@kairo/assets (BlendLoader, GLTF, Sketchfab Streamer)"]
        EngineCore --> Tools["@kairo/tools (EngineCompiler, Profiler, Recorder)"]
        EngineCore --> Plugins["@kairo/plugins (Extensible Plugin Registry)"]
    end
```

---

## ⚡ Core Principles & Design Patterns

1. **Unified EasyScript Master Layer**:
   Exposes every subsystem capability (Physics, Audio, Particles, AI Pathfinding, Skeletal Animations, IK, Sketchfab streaming, Blender `.blend` parsing, Camera Controls, Screenshots/Video Recording, UI Modals, Multiplayer Network Sync) through intuitive single-line commands.

2. **Native Blender `.blend` & Asset Pipeline**:
   Includes `BlendLoader` for binary `.blend` file parsing and live Sketchfab API model streaming.

3. **Ahead-of-Time (AOT) Engine Compiler**:
   Pre-bakes O(1) spatial collision grid hashes, minifies EasyScript ASTs, quantizes geometry buffers, and compiles 1-click standalone HTML5 games.

4. **Strict Monorepo & Zero Circular Dependencies**:
   Each subsystem resides in its own package under `packages/` with strict TypeScript typings and clean public interfaces.

5. **Entity Component System (ECS)**:
   Entities are lightweight numeric identifiers. Components are plain data classes. Systems process entities via bitmask queries (`World.query(new Query([Position, Velocity]))`).

6. **Zero-Garbage Collection Allocation**:
   Object pooling (`ObjectPool<T>`) is utilized for high-frequency Math vectors, particles, physics contact pairs, and event emissions.

---

## 📂 Monorepo Directory Layout

```
Kairo/
├── packages/
│   ├── core/         # Main Loop, Math, EventSystem, SaveSystem, EasyScript Master API
│   ├── ecs/          # BitECS / Fast Sparse-Set ECS, Queries, Systems, World
│   ├── renderer/     # PBR Materials, Lighting, Skybox, Particles, Post-Processing
│   ├── physics/      # Rigidbodies, Colliders, Raycasting, PhysicsWorld
│   ├── animation/    # Skeletal Animation, Blend Trees, Two-Bone IK Solver
│   ├── audio/        # Spatial Web Audio Engine & Sound Synthesizer
│   ├── input/        # Action Map Input Manager & Control Rebinding
│   ├── ai/           # NavMesh Grid Pathfinding & Behavior Trees
│   ├── network/      # RPC, Client Prediction & State Replication
│   ├── assets/       # BlendLoader, Async Asset Loader & Sketchfab Streamer
│   ├── tools/        # AOT EngineCompiler, Profiler Map, ScreenRecorder
│   └── plugins/      # Plugin System Registry & Lifecycle Hooks
├── editor/           # Web-Based Game Editor Studio UI (HTML/CSS/JS)
├── examples/         # Standalone Playable Showcase Demos
├── tests/            # Automated Unit & Performance Benchmarks (48 Passing)
├── docs/             # Architecture, EASY_SCRIPT.md, API Reference, & Guides
└── .github/workflows/ # GitHub Actions CI/CD Pipeline
```
