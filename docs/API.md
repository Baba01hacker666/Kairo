# Kairo Engine - API Reference Guide

This document provides a comprehensive reference for all core packages in the Kairo Game Engine monorepo.

---

## 🌐 Quickstart: Loading Kairo Engine directly via CDN

You can load and use Kairo Engine directly in any HTML file without Node.js or bundlers:

### Option A: ES Module Import (`.mjs`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Kairo CDN Game</title>
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

    // 2. Create 3D Object
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

### Option B: Plain `<script>` Tag UMD Import (`.umd.js`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Kairo UMD Game</title>
  <!-- Peer Dependencies -->
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

## 1. `@kairo/core`

### `EasyScript` Master API & `ScriptBehavior`
Unified, beginner-friendly single-line API unifying all Kairo Engine packages & subsystems into 1 interface:
- `EasyScript.createBehavior({ onStart?, onUpdate?, onInteract?, onCollision? })`: Create custom behavior.
- **Video Editing**: `createVideoTimeline(duration)`, `addCameraShot(time, duration, type, config)`, `addVideoOverlay(time, duration, url, maskConfig)`, `addVideoText(time, duration, text)`, `addVideoTransition(time, duration, type)`, `addVideoColorGrading(time, duration, preset)`, `playVideoTimeline()`, `exportVideoFile(filename)`.
- **Cinematic Shots**: `cutToShot(pos, lookAtTarget)`, `panCamera(fromPos, toPos, lookAtTarget, duration)`, `orbitCamera(centerTarget, radius, speed, duration)`, `dollyZoom(targetFov, duration)`, `craneShot(startPos, endPos, duration)`, `trackObject(targetObj)`.
- **Overlay & Masking**: `showOverlayImage(url, options)`, `removeOverlayImage(id)`, `letterbox(enabled, barHeightPercent)`, `transitionCut(type, durationMs)`, `setColorGrading(preset)`.
- **Motions**: `spin(speed?)`, `bob(amount?, speed?)`, `patrol(dist?, speed?)`, `pulse(min?, max?, speed?)`, `jump(force?)`, `stop()`.
- **Steering & Movement**: `move(dx, dy, dz)`, `moveForward(dist)`, `moveBackward(dist)`, `moveLeft(dist)`, `moveRight(dist)`, `turnLeft(deg)`, `turnRight(deg)`, `chase(targetPos, speed, dt)`, `navigateTo(targetPos, speed, dt)`.
- **SFX & Particles**: `playSound(type)`, `sparkle(count?)`, `explode(count?)`, `dustBurst(count?)`, `teleportEffect()`.
- **Animations & IK**: `playAnimation(stateName, fadeDuration?)`, `setIKHeight(height)`.
- **Assets**: `streamSketchfab(urlOrUid)`, `loadBlenderModel(blendUrl)`.
- **Multiplayer**: `syncState(stateData)`, `sendRPC(rpcName, payload)`.

### `KairoApp`
- `new KairoApp(config?: KairoAppConfig)`: Create high-level engine wrapper.
- `app.videoTimeline`: `VideoTimeline` multitrack video editor engine instance.
- `createVideoTimeline(duration)`: Instantiate new video editing timeline.
- `addCameraShot(time, duration, shotType, config)`: Add keyframed camera shot clip.
- `addVideoOverlay(time, duration, url, maskConfig)`: Add image/video overlay clip with masking.
- `addVideoText(time, duration, text)`: Add title card / subtitle clip.
- `addVideoTransition(time, duration, transitionType)`: Add transition cut clip.
- `addVideoColorGrading(time, duration, preset)`: Add color grading preset filter clip.
- `playVideo()` / `pauseVideo()` / `seekVideo(time)` / `exportVideo(filename)`: Control video timeline playback and export.

---

## 2. `@kairo/tools`

### `VideoTimeline`
- `new VideoTimeline(app?, totalDuration?)`: Multi-track HTML5 video editing timeline engine.
- `addTrack(name, type)`: Add video track (`'camera'`, `'overlay'`, `'text'`, `'transition'`, `'audio'`, `'colorGrade'`).
- `addClip(trackId, clipData)`: Add clip to track with keyframes and parameters.
- `seek(time)`: Scrub playhead to timestamp.
- `play()` / `pause()`: Play or pause timeline.
- `evaluateAt(time)`: Evaluate active clips, camera shots, image overlays, transitions & color grading.
- `exportVideo(filename)`: Record and export full WebM video file.
- `toJSON()` / `fromJSON(data)`: Serialize / deserialize video timeline project.

---

## 3. `@kairo/ui`

### `CinematicOverlayManager`
- `showImageOverlay(url, options)`: Floating image graphic overlays with CSS masks (`circle`, `rounded`, `hexagon`, `vignette`).
- `setLetterbox(enabled, barHeightPercent)`: 21:9 Widescreen letterbox black bars.
- `transitionCut(type, durationMs)`: Video transition cuts (`wipeLeft`, `wipeRight`, `circleWipe`, `glitch`).
- `setColorGrading(preset)`: Color grading filter presets (`cinematicWarm`, `cyberpunkNeon`, `noir`, `vintage`).

---

## 4. `@kairo/renderer`

### `CustomShaderMaterial`
- `new CustomShaderMaterial(name, options)`: Custom GLSL shader material wrapper supporting vertex/fragment code, transparent pass, side rendering, and custom uniforms.
- `setUniform(name, value, type?)`: Set or update shader uniform (`float`, `vec2`, `vec3`, `vec4`, `color`, `texture`).
- `getUniform(name)`: Get active value of uniform.
- `update(dt, elapsedTime)`: Update time-based uniforms (`u_time`).
- `toThreeMaterial()`: Convert or update underlying `THREE.ShaderMaterial` for WebGL rendering.
- `clone()`: Create deep clone of custom shader material.
- `toJSON()` / `CustomShaderMaterial.fromJSON(json)`: Serialize and deserialize custom shader materials.

### `ShaderPresets`
- `ShaderPresets.createWaterShader()`: Procedural wave vertex displacement and shallow/deep depth gradient shader.
- `ShaderPresets.createDissolveShader()`: Perlin noise alpha discard threshold shader with glowing fiery edges.
- `ShaderPresets.createHologramShader()`: Additive futuristic hologram shader with scanlines, fresnel rim, and vertex glitch jitter.
- `ShaderPresets.createToonShader()`: Quantized stepped cel-shading light calculation with outline rim lighting.
- `ShaderPresets.createFresnelGlowShader()`: Dynamic pulsing fresnel edge aura glow shader.
- `ShaderPresets.getPreset(name)`: Instantiate preset by name (`'water'`, `'dissolve'`, `'hologram'`, `'toon'`, `'fresnel'`).

### `ShaderGraphCompiler`
- `ShaderGraphCompiler.compile(graph)`: Compiles visual node graph into vertex and fragment GLSL code strings and uniform map.
- `ShaderGraphCompiler.createDefaultGraph()`: Returns starter visual graph data.

### `Material`
- `material.setShaderPreset(presetName)`: Apply built-in shader preset to material.
- `material.setCustomShader(shaderMaterial)`: Assign custom `CustomShaderMaterial` instance to material.

### `CameraController`
- `setTargetPosition(pos)`: Set camera tracking target with vertical height offset.
- `cutTo(pos, lookAtTarget)`: Hard cut camera position and orientation immediately.
- `panTo(fromPos, toPos, lookAtTarget, duration)`: Smooth 3D pan between keyframed camera positions.
- `orbitShot(centerTarget, radius, speed, duration)`: 360° orbital camera rotation around target.
- `dollyZoom(targetFov, duration)`: Vertigo dolly zoom effect adjusting FOV smoothly.
- **Lockstep Tracking**: Uses `currentTarget` lerping and exponential decay `1.0 - Math.exp(-lerpSpeed * dt)` to eliminate character movement jitter.

---

## 5. `@kairo/ecs`

### `World`
- `world.createEntity(name?)`: Instantiate a new entity ID.
- `world.createSharedContext(id, properties)`: Register a flyweight `SharedEntityContext` record holding shared invariant properties (`radius`, `color`, `meshTemplate`, `restitution`).
- `world.createEntityWithSharedContext(contextId, name?)`: Instantiate an entity attached to a shared context archetype.
- `world.destroyEntity(entity)`: Destroy entity and clean up component storages & shared context attachments.
- `world.query(query)`: Query matching active entities (returns a defensive copy to prevent cache mutation).
- `world.sharedContexts`: Instance of `SharedEntityContextManager`.

### `SharedEntityContext` & `SharedEntityContextManager`
- `new SharedEntityContext(id, properties)`: Immutable shared archetype record.
- `sharedContexts.registerContext(id, properties)`: Register or retrieve shared context record.
- `sharedContexts.attachEntityToContext(entity, contextId)`: Associate entity with shared context.
- `sharedContexts.forEachInContext(contextId, callback)`: High-speed batch iteration over all entities sharing context (5.56x faster execution, 18.1% heap memory savings).
- `sharedContexts.getStats()`: Compute memory savings bytes and shared entity counts.

