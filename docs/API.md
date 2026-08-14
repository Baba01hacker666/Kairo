# Kairo Engine - API Reference Guide

This document provides a comprehensive reference for all core packages in the Kairo Game Engine monorepo.

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
### `GameBugDetector` & `GlobalGameBugDetector`
- `app.audit()` / `bugDetector.audit(app)`: Instant full-scan QA audit returning health score (0-100), critical bugs, warnings, and metrics summary.
- `app.runFuzzTest(durationSeconds?)`: Automated AI stress tester simulating rapid player actions and edge bounds.
- `app.toggleBugInspector()` / `bugDetector.toggleOverlay()`: Visual in-game diagnostic panel displaying live alerts, health score, and export button.
- `bugDetector.enableLiveWatchdog(app, options)`: Lightweight background assertion monitor running frame checks.
- `bugDetector.exportReportMarkdown()` / `downloadReportMarkdown()`: Exports diagnostic bug report for CI/CD and debugging.

### `Kairo CLI` (`kairo` / `CodeBugAuditor`)
- `kairo test [path]` / `kairo audit [path]`: Scans game source files for GC churn in 60fps loops, NaN division by zero risks, asset 404s, shader uniform type mismatches, and dual camera controller fighting.
- `kairo doctor`: Diagnoses runtime platform, Node.js version, and Kairo packages environment.
- `kairo report [--md]`: Exports structured Markdown QA reports for CI/CD pipelines.

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
- `world.add(name?)` / `world.entity(name?)`: Primary entry point returning an `EntityHandle` for English-like 1-line creation (`app.world.add('Player').sphere('blue').at(0, 2, 0).physics().spin()`).
- `world.load(assetUrl, name?)`: High-level asset & level loader (`await world.load('assets/dungeon.blend')`).
- `world.createEntity(name?)`: Instantiate a new entity ID.
- `world.buildEntity(name?)`: Returns an `EntityBuilder` instance for fluent, minimal-code entity composition.
- `world.spawnBatch(count, initializer)`: High-performance batch spawner for creating $N$ entities in contiguous memory with 0 dynamic allocations.
- `world.createSharedContext(id, properties)`: Register a flyweight `SharedEntityContext` record holding shared invariant properties (`radius`, `color`, `meshTemplate`, `restitution`).
- `world.createEntityWithSharedContext(contextId, name?)`: Instantiate an entity attached to a shared context archetype.
- `world.destroyEntity(entity)`: Destroy entity and clean up component storages & shared context attachments.
- `world.query(query)`: Query matching active entities (returns a defensive copy to prevent cache mutation).
- `world.sharedContexts`: Instance of `SharedEntityContextManager`.

### `EntityHandle` & `EntityBuilder`
Fluent, chainable builder for concise, single-line entity creation with two-tier default & function value overrides:
- `.sphere(colorOrConfig)` / `.box(colorOrConfig)` / `.cylinder(colorOrConfig)` / `.capsule(colorOrConfig)` / `.plane(colorOrConfig)`: Primitive mesh helpers supporting color strings (`.sphere('blue')`).
- `.model(url)`: One-line 3D model loader (`.model('models/Fox.glb')`).
- `.sketchfab(urlOrUid)`: One-line Sketchfab model streamer.
- `.at(x, y, z)`: Position shorthand setting 3D coordinates.
- `.scale(x, y?, z?)`: Scale shorthand (`.scale(20, 1, 20)`).
- `.rotate(rx, ry, rz)`: Rotation shorthand (`.rotate(0, 45, 0)`).
- `.physics(configOrFn?)`: Zero-config physics (`.physics()`) or custom options override.
- `.move(speed?)`: Character WASD / Arrow Keys steering trait.
- `.jump(force?)`: Character jump trait.
- `.destroy()`: Destroys entity from world.
- `.color(colorHex)`: Set mesh material color (`'#ff0000'` or `0x00ff00`).
- `.behavior(nameOrFn, options)`: Attach behavior trait.
- `.spin(speed?)` / `.bob(amount?, speed?)` / `.pulse(min?, max?, speed?)` / `.patrol(dist?, speed?)`: Built-in 1-line motion behavior helpers.
- `.with(component)`: Attach custom component.
- `.tag(tagName)`: Add search tag.
- `.parent(parentId)`: Attach entity to parent entity hierarchy.
- `.sharedContext(contextId)`: Attach entity to shared flyweight context archetype.
- `.build()`: Returns final `EntityId`.

### `SharedEntityContext` & `SharedEntityContextManager`
- `new SharedEntityContext(id, properties)`: Immutable shared archetype record.
- `sharedContexts.registerContext(id, properties)`: Register or retrieve shared context record.
- `sharedContexts.attachEntityToContext(entity, contextId)`: Associate entity with shared context.
- `sharedContexts.forEachInContext(contextId, callback)`: High-speed batch iteration over all entities sharing context (5.56x faster execution, 18.1% heap memory savings).
- `sharedContexts.getStats()`: Compute memory savings bytes and shared entity counts.


