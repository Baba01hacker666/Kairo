# Kairo Engine - API Reference Guide

This document provides a comprehensive reference for all core packages in the Kairo Game Engine monorepo.

---

## 1. `@kairo/core`

### `EasyScript` Master API & `ScriptBehavior`
Unified, beginner-friendly single-line API unifying all Kairo Engine packages & subsystems into 1 interface:
- `EasyScript.createBehavior({ onStart?, onUpdate?, onInteract?, onCollision? })`: Create custom behavior.
- **Motions**: `spin(speed?)`, `bob(amount?, speed?)`, `patrol(dist?, speed?)`, `pulse(min?, max?, speed?)`, `jump(force?)`, `stop()`.
- **Steering & Movement**: `move(dx, dy, dz)`, `moveForward(dist)`, `moveBackward(dist)`, `moveLeft(dist)`, `moveRight(dist)`, `turnLeft(deg)`, `turnRight(deg)`, `chase(targetPos, speed, dt)`, `navigateTo(targetPos, speed, dt)`.
- **Camera & UI**: `shakeCamera(intensity?, duration?)`, `setCameraDistance(dist)`, `say(message, duration?, type?)`, `showModal(title, content, buttons?)`, `takeScreenshot()`, `recordVideo(seconds)`.
- **SFX & Particles**: `playSound('coin' | 'jump' | 'explosion' | 'hit' | 'teleport' | 'key' | 'fanfare' | 'push' | 'hint' | 'switch')`, `sparkle(count?)`, `explode(count?)`, `dustBurst(count?)`, `teleportEffect()`.
- **Animations & IK**: `playAnimation(stateName, fadeDuration?)`, `setIKHeight(height)`.
- **Assets**: `streamSketchfab(urlOrUid)`, `loadBlenderModel(blendUrl)`.
- **Multiplayer**: `syncState(stateData)`, `sendRPC(rpcName, payload)`.

### `Vector3`
- `new Vector3(x?, y?, z?)`: Create 3D vector.
- `add(v: Vector3): this`: Component-wise addition.
- `sub(v: Vector3): this`: Component-wise subtraction.
- `scale(s: number): this`: Scalar multiplication.
- `length(): number`: Compute length.
- `normalize(): this`: Normalize vector.
- `dot(v: Vector3): number`: Dot product.
- `cross(v: Vector3): Vector3`: Cross product.

### `Engine`
- `start()`: Start main game loop.
- `pause()`: Pause update and render updates.
- `resume()`: Resume execution.
- `stop()`: Terminate the game loop and clean up animation frames.

### `KairoApp`
- `new KairoApp(config?: KairoAppConfig)`: Create high-level engine wrapper.
- `app.scene`, `app.camera`, `app.renderer`: Exposed Three.js scene, camera and renderer.
- `app.physics`: Shared `PhysicsWorld` instance.
- `app.ui`: `UIManager` overlay system.
- `createBox(opts)`: Spawn a box mesh (optionally a physics rigid body).
- `attachPhysics(mesh, opts?)`: Make any THREE mesh solid.
- `onUpdate(cb)`: Register per-frame update callback receiving `dt`.
- `captureScreenshot()`, `startRecording(fps?)`, `stopRecording(filename?)`: Output tools.

---

## 2. `@kairo/assets`

### `AssetManager`
- `loadModel(url, autoCompress?, targetHeight?)`: Load GLTF, GLB, OBJ, FBX, STL, PLY, DAE, VOX, or `.blend` models.
- `streamSketchfabModel(urlOrUid, onProgress?, targetHeight?)`: Stream 3D models directly from Sketchfab API.
- `autoFitModel(model, targetHeight)`: Auto-scale and align bottom pivot.
- `generateAutoCollider(model)`: Auto-calculate capsule/box colliders for 3D meshes.

### `BlendLoader`
- `new BlendLoader()`: Native binary Blender `.blend` file parser.
- `parse(arrayBuffer: ArrayBuffer): THREE.Group`: Parse binary `.blend` file headers and BHead blocks into WebGL Three.js object graph.

---

## 3. `@kairo/tools`

### `EngineCompiler`
- `compileGame(levels, options)`: Ahead-of-Time compiler; pre-bakes O(1) spatial collision hashes & binary payload checksums.
- `compileEasyScript(scriptCode)`: AST minification and static helper analysis.
- `compileStandaloneGameHtml(title, levels, options)`: Compiles 1-click standalone HTML5 playable game bundles.
- `quantizeGeometryBuffers(positions)`: Quantizes 32-bit Float vertex positions into 16-bit `Uint16Array` buffers.

---

## 4. `@kairo/ecs`

### `World`
- `createEntity(name?: string): EntityId`: Instantiate entity ID.
- `addComponent<T>(entity: EntityId, component: T): T`: Attach component.
- `getComponent<T>(entity: EntityId, cType: ComponentType<T>): T`: Retrieve component.
- `query(desc: Query): EntityId[]`: Query entities matching component list.
- `addSystem(system: System): this`: Register update system.

---

## 5. `@kairo/physics`

### `PhysicsWorld`
- `registerBody(body: RigidBody, collider: Collider, position: Vector3)`: Register rigid body.
- `step(dt: number)`: Advance physics step (Impulse & Gravity).
- `raycast(ray: Ray, maxDistance?: number): RaycastHit | null`: Perform ray collision test.

---

## 6. `@kairo/audio`

### `AudioManager`
- `playSynthesizedSound(type)`: Synthesize retro SFX on Web Audio context (`'coin'`, `'jump'`, `'explosion'`, `'hit'`, `'teleport'`, `'key'`, `'fanfare'`, `'push'`, `'hint'`, `'switch'`).
- `setMasterVolume(vol: number)`: Tweak master gain.

---

## 7. `@kairo/ui`

### `UIManager`
- `showToast(message, durationMs?, type?)`: Bottom pop-in toast.
- `showSubtitle(text, durationMs?)`: Subtitle dialogue lines.
- `createModal(title, contentHtml, buttons)`: Centered modal card.
- `createGameMenu(title, options)`: Full-screen menu overlay.
- `flash(color?, durationMs?)` / `fade(opacity, color?, durationMs?)`: Screen transition effects.
