# Kairo Engine 🦊

**Kairo Engine** is a modern, modular, high-performance TypeScript 2D/3D game engine with WebGL/WebGPU rendering, spatial audio, physics, and a built-in QA test CLI.

🌍 **Live Hub & Games:** [Play Kairo Engine Here!](https://Baba01hacker666.github.io/Kairo/)

---

## 🎮 Featured Game

- 🦊 **Fox Odyssey: The Ancient Grove**: Open-world 3D atmospheric exploration game featuring mobile multi-touch joystick controls, ancient shrine chimes, duckling companions, bouncy mushrooms, spirit wisps, and local save progression.
- 🌲 **Pure TS Fox Game**: 50 solvable puzzle platformer levels with 3D lasers and crate push/pull mechanics. *(The only thing I like!)*

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Baba01hacker666/Kairo.git
cd Kairo
npm install

# Start local dev server
npm run dev

# Run automated tests (91/91 test suites passing)
npm test

# Run Kairo CLI automated QA bug scanner
npx kairo audit examples/fox-odyssey
```

---

## 📦 Modular Packages

- **`@kairo/core`**: Game loop (`KairoApp`), math utilities, and save system.
- **`@kairo/renderer`**: WebGL/WebGPU rendering, shaders, and particle systems.
- **`@kairo/physics`**: 3D rigid bodies, raycasting, and collision detection.
- **`@kairo/audio`**: Positional 3D spatial audio and procedural sound effects.
- **`@kairo/input`**: Touch joystick, pointer, keyboard, and gamepad controls.
- **`@kairo/ecs`**: Fast Entity-Component-System pipeline.
- **`@kairo/animation`**: State machines, blend trees, and keyframed skeletal animation.
- **`@kairo/tools`**: Kairo CLI, `CodeBugAuditor`, and automated QA bug detector.

---

*Built with TypeScript, WebGL, and Three.js.*
