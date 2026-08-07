# Kairo Engine - CDN Quickstart & Module Usage

This guide shows how to import and use Kairo Engine directly in any HTML project using global CDN links — without needing Node.js or bundlers.

---

## ⚡ Option 1: ES Module Import (`.mjs`)

Best for modern browsers and ES module `<script type="module">` setups:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Kairo CDN Game</title>
  <!-- Import Map for Peer Dependencies -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js",
      "cannon-es": "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js"
    }
  }
  </script>
</head>
<body style="margin: 0; overflow: hidden; background: #0a0c10;">
  <canvas id="game-canvas"></canvas>

  <script type="module">
    import { KairoApp } from 'https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@gh-pages/lib/kairo.mjs';

    // 1. Initialize Engine
    const app = new KairoApp({
      canvas: '#game-canvas',
      background: 0x0a0c10
    });

    // 2. Create 3D Spinning Cube
    const cube = app.world.createEntity('cube');
    cube.addTransform({ position: [0, 1, 0] });
    cube.addMesh({ type: 'box', color: 0x6366f1, size: [1.5, 1.5, 1.5] });

    // 3. Engine Update Loop
    app.onUpdate((dt) => {
      const transform = cube.getTransform();
      transform.rotation.y += dt * 1.5;
    });

    // 4. Start Engine Loop
    app.start();
  </script>
</body>
</html>
```

---

## 🌐 Option 2: Plain `<script>` Tag UMD Import (`.umd.js`)

Best for quick single-file HTML games without module script tags:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Kairo UMD Game</title>
  <!-- Three.js Peer Dependency -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- Kairo UMD Bundle -->
  <script src="https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@gh-pages/lib/kairo.umd.js"></script>
</head>
<body style="margin: 0; overflow: hidden;">
  <canvas id="game-canvas"></canvas>

  <script>
    const { KairoApp } = window.Kairo;
    const app = new KairoApp({ canvas: '#game-canvas' });
    app.start();
  </script>
</body>
</html>
```

---

## 🔗 Available CDN Endpoints

| Provider | Target Format | Live CDN URL |
| :--- | :--- | :--- |
| **jsDelivr (ESM)** | ES Module (`.mjs`) | `https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@gh-pages/lib/kairo.mjs` |
| **jsDelivr (UMD)** | Browser Script (`.umd.js`) | `https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@gh-pages/lib/kairo.umd.js` |
| **GitHub Pages** | Direct CDN | `https://Baba01hacker666.github.io/Kairo/lib/kairo.umd.js` |
