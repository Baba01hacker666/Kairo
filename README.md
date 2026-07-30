# Kairo Engine 🚀

**Kairo** is an experimental, high-performance, modular 2D/3D Game Engine built for the modern web. Over the course of its development, Kairo evolved from a standard TypeScript Entity-Component-System (ECS) into a **Hybrid Web Game Engine** that combines the raw performance of WebAssembly with the cinematic graphics of WebGL.

🌍 **Live Demo & Hub:** [Play Kairo Engine Examples Here!](https://Baba01hacker666.github.io/Kairo/)

---

## 🏗️ Architecture

Kairo currently features multiple rendering and logic paradigms to demonstrate different ways to build web games:

1. **The Pure TypeScript ECS (`@kairo/core`)**
   A textbook Entity-Component-System architecture written entirely in TypeScript. It supports basic 3D primitives, WebGPU/WebGL rendering, physics integrations (Cannon-es), and component-based logic.

2. **The Go WASM Software Renderer (`examples/go-wasm`)**
   A full 3D software rendering engine written entirely in Golang. It compiles to WebAssembly, does all vertex transformations and rasterization manually on the CPU, and paints directly to an HTML5 Canvas 2D context.

3. **The High-Fidelity WebGL Pipeline (`examples/high-quality-render`)**
   A stunning rendering pipeline utilizing Three.js. It features Physically Based Rendering (PBR), soft shadows, environment mapping, and native support for complex skeletal animations via `.glb` (GLTF) files.

4. **The Hybrid Engine (`examples/go-fox`)**
   The crown jewel of Kairo. It completely decouples Game Logic from Graphics by running a **Golang WebAssembly Backend** for physics, collisions, and state management, while a **Three.js TypeScript Frontend** handles the cinematic rendering and animations.

---

## 🎮 Playable Examples

You can access all examples from the main hub page, but here are the highlights:

- 🦊 **Go + Three.js Fox:** A playable third-person platformer where you control an animated Fox to collect floating Avocados in a forest. The physics are powered by Go (WASM), while the graphics are powered by Three.js. Includes mobile touch controls (Virtual Joystick)!
- 🌸 **Cherry Blossoms:** A beautiful, cinematic scene utilizing Kairo's custom animation API to simulate falling cherry blossom petals.
- 🏃 **Go Runner:** An infinite runner game rendered entirely in software (CPU) via Golang WebAssembly. 
- 🕹️ **Stickman Game:** A simple test of the pure TypeScript Kairo Engine ECS and physics wrappers.

---

## 🚀 Running Locally

Kairo uses `vite` for fast bundling and hot-module replacement.

### Prerequisites
- Node.js (v18+)
- Golang (v1.21+) - *Only required if you plan on recompiling the WASM files.*

### Setup
```bash
# Clone the repository
git clone https://github.com/Baba01hacker666/Kairo.git
cd Kairo

# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open `http://localhost:5173` in your browser to see the hub!

### Compiling WebAssembly (Optional)
If you edit `examples/go-fox/main.go` or `examples/go-runner/main.go`, you must recompile them into WebAssembly:
```bash
cd examples/go-fox
GOOS=js GOARCH=wasm go build -o ../../public/wasm/go-fox.wasm main.go
```

## 🛠️ Building for Production

To build the static assets for deployment (e.g., GitHub Pages):
```bash
npm run build
```
This will compile all TypeScript, bundle the assets, and place the final distributable files in the `dist/` directory.

---

*Built with ❤️ and a lot of caffeine.*
