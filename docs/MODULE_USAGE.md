# Kairo Engine - Download & Package Module Usage Guide

Kairo Engine is packaged as a high-performance JavaScript & TypeScript module supporting **ES Modules (ESM)**, **CommonJS (CJS)**, **UMD (Browser Script)**, and **TypeScript `.d.ts` declaration types**.

---

## 1. Quick Download & Build Instructions

To build the downloadable package binaries and TypeScript types locally from the repository:

```bash
# Build production module bundles and TypeScript types
npm run build:package
```

This creates the following distribution files in `dist/`:

| File | Format | Use Case |
| :--- | :--- | :--- |
| `dist/lib/kairo.mjs` | **ESM (`.mjs`)** | Modern web apps (Vite, Next.js, Webpack, Svelte, Vue, React) |
| `dist/lib/kairo.cjs` | **CommonJS (`.cjs`)** | Node.js backend servers & desktop Electron apps |
| `dist/lib/kairo.umd.js` | **UMD (`.umd.js`)** | HTML `<script>` tag browser usage without bundlers |
| `dist/types/` | **TypeScript (`.d.ts`)** | Full Code Auto-Complete & Type Checking in IDEs |

---

## 2. Using Kairo Engine in External Games

### Option A: Standard NPM Package Installation

If published to NPM (`npm publish`) or linked locally (`npm link` / `file:` dependency):

```bash
npm install kairo-engine
```

#### In TypeScript / JavaScript (Vite, React, Vue, Next.js):
```ts
import { KairoApp, World, SharedEntityContext, Vector3 } from 'kairo-engine';

// Initialize Game Engine
const app = new KairoApp({
  canvas: '#game-canvas',
  background: 0x0a0c10
});

// Create World & Shared Entity Context (Flyweight archetype)
const ballContext = app.world.createSharedContext('bouncing_ball', {
  radius: 0.5,
  restitution: 0.9,
  friction: 0.1,
  color: 0xff0000
});

// Create 1,000 entities sharing context
for (let i = 0; i < 1000; i++) {
  app.world.createEntityWithSharedContext('bouncing_ball');
}

// Start Game Engine Loop
app.start();
```

---

### Option B: HTML `<script>` Tag (CDN / No-Build Browser Mode)

For web developers building games directly in plain HTML/JS without Node.js or bundlers:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Kairo 3D Game</title>
  <!-- Three.js & Cannon.js Peer Dependencies -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js"></script>
  
  <!-- Kairo Engine UMD Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/kairo-engine/dist/lib/kairo.umd.js"></script>
</head>
<body style="margin: 0; overflow: hidden; background: #000;">
  <canvas id="game-canvas"></canvas>

  <script>
    // Access global Kairo namespace
    const { KairoApp } = window.Kairo;

    const app = new KairoApp({ canvas: '#game-canvas' });
    app.start();
  </script>
</body>
</html>
```

---

### Option C: Local Relative Module Import (Zero Installation)

You can also copy `dist/lib/kairo.mjs` directly into any web folder and import it as a standard ES Module:

```html
<script type="module">
  import { KairoApp } from './kairo.mjs';

  const app = new KairoApp();
  app.start();
</script>
```

---

## 3. Publishing to NPM Registry

To publish Kairo Engine to the public NPM registry so anyone can run `npm install kairo-engine`:

```bash
# 1. Login to NPM account
npm login

# 2. Build production library & types
npm run build:package

# 3. Publish package to NPM
npm publish --access public
```
