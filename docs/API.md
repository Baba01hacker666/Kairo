# Kairo Engine - API Reference Guide

This document provides a comprehensive reference for all core packages in the Kairo Game Engine monorepo.

---

## 1. `@kairo/core`

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
- `new KairoApp(config?: KairoAppConfig)`: Create the high-level engine wrapper (background, gravity, shadows, fog, `mode: '2d' | '3d'`, `pixelArt`, `rendererBackend`).
- `app.scene`, `app.camera`, `app.renderer`: Exposed Three.js scene, camera and renderer.
- `app.physics`: Shared `PhysicsWorld` instance.
- `app.ui`: `UIManager` overlay system (see `@kairo/ui`).
- `app.cutscene`: `CutsceneManager` (see below).
- `app.audio`, `app.input`, `app.debug`: Global audio / input / debug managers.
- `createBox(opts)`: Spawn a box mesh (optionally a physics rigid body).
- `attachPhysics(mesh, opts?): { mesh, rb, collider, dispose }` — Make **any** THREE mesh solid: derives a collider from its geometry (`deriveCollider`), registers a rigid body, and syncs the physics body back to the mesh every frame. Physics is on by default; pass-through is the explicit opt-out (skip this call and the mesh just renders). Options: `type: 'static' | 'dynamic'` (default `dynamic`), `mass` (default `1`, `0` for static), `colliderType: 'box' | 'sphere' | 'capsule'`, `size: [w, h, d]` (manual collider size), `addToScene` (add the mesh to the scene + enable shadows), `castShadow`. `dispose()` unregisters the body and removes the mesh.
- `createBlock2D(opts)`: Spawn a 2D textured sprite or billboard plane.
- `createText3D(opts)`: Render text into the 3D scene via a canvas texture; returns `{ mesh, setText(newText), dispose }` for dynamic updates.
- `setLighting(opts)`: Configure sun / ambient lighting.
- `setBackgroundImage(url, pixelArt?)`: Set a 2D backdrop image.
- `onUpdate(cb)`: Register a per-frame update callback receiving `dt`.
- `start()`, `stop()`: Launch / halt the render + update loop.
- `captureScreenshot()`, `startRecording(fps?)`, `stopRecording(filename?)`: Output tools.
- `app.pipeline.postProcessing`: Toggle bloom, film grain, pixelation and selection outlines.

### `CutsceneManager`
- `play(script)`: Run an async cinematic script, aborting any running cutscene first. Each `await` in the script can be cancelled instantly on skip.
- `skip()` / `stop()`: Abort the active cutscene, firing `CutsceneAbortError`.
- `isPlaying: boolean`: Whether a cutscene is currently running.

### `CutsceneContext`
- `wait(seconds)`: Pause for a duration (abort-safe).
- `moveCamera(targetPos, duration?)`: Smooth camera movement to a target position.
- `lookAt(targetPos, duration?)`: Interpolate camera rotation toward a point.
- `showDialogue(text, duration?)`: Show then auto-hide a subtitle.
- `shakeCamera(intensity, duration, decay?)`: Camera shake impulse.
- `flashScreen(color?, durationMs?)`: Instant full-screen color flash.
- `fadeScreen(targetOpacity, color?, durationMs?)`: Fade the screen overlay to a target opacity.

---

## 2. `@kairo/ecs`

### `World`
- `createEntity(name?: string): EntityId`: Instantiate entity ID.
- `addComponent<T>(entity: EntityId, component: T): T`: Attach component.
- `getComponent<T>(entity: EntityId, cType: ComponentType<T>): T`: Retrieve component.
- `query(desc: Query): EntityId[]`: Query entities matching component list.
- `addSystem(system: System): this`: Register update system.

---

## 3. `@kairo/physics`

### `PhysicsWorld`
- `registerBody(body: RigidBody, collider: Collider, position: Vector3)`: Register rigid body.
- `step(dt: number)`: Advance physics step (Impulse & Gravity).
- `raycast(ray: Ray, maxDistance?: number): RaycastHit | null`: Perform ray collision test.

---

## 4. `@kairo/audio`

### `AudioManager`
- `playSynthesizedSound(type: 'jump' | 'laser' | 'explosion' | 'coin')`: Synthesize retro SFX on Web Audio context.
- `setMasterVolume(vol: number)`: Tweak master gain.

---

## 5. `@kairo/ai`

### `PathfindingGrid`
- `findPath(startPos: Vector3, endPos: Vector3): Vector3[]`: Compute A* path waypoints around obstacles.

### `Behavior Tree`
- `SelectorNode`: Execute children until one succeeds.
- `SequenceNode`: Execute children until one fails.
- `ActionNode`: Custom action callback node.

---

## 6. `@kairo/ui`

Animated, themeable HUD overlays, menus, modals, toasts and screen effects. Access it through `app.ui` anywhere, or import `UIManager` / `GlobalUI` directly.

### `UITheme`
Theming for every UI element:
- `primaryColor`, `accentColor`: Brand colors.
- `backgroundColor`, `cardBackground`: Surface colors.
- `textColor`, `mutedTextColor`: Text colors.
- `fontFamily`, `borderRadius`: Typography and corner radii.

`DefaultTheme` provides the built-in fallback theme.

### `UIManager`
- `new UIManager(theme?: UITheme)`: Create a manager, optionally mounting a `#kairo-ui-overlay` container and applying global styles.
- `container: HTMLElement | null`: The overlay root element (created on first usage in the browser).
- `theme: UITheme`: The active theme.

Overlays & feedback:
- `showToast(message, durationMs?, type?)`: Bottom pop-in toast, then auto-dismiss.
- `showSubtitle(text, durationMs?)` / `hideSubtitle()`: Bottom subtitle line for dialogue / cutscenes.
- `showAchievement(title, description, icon?)`: Top-right achievement toast.
- `showDialogue` is a cutscene convenience that wraps `showSubtitle` (see `@kairo/core`).

Modals & menus:
- `createModal(title, contentHtml, buttons): HTMLElement | null`: Centered modal card; each button `{ text, primary?, onClick() }` auto-disables all buttons on click and closes.
- `createGameMenu(title, options): HTMLElement | null`: Full-screen menu; each option `{ text, onClick(), color? }`.

Screen effects:
- `flash(color?, durationMs?)`: Instant full-screen color flash (e.g. lightning, damage).
- `fade(targetOpacity, color?, durationMs?): Promise<void>`: Smooth full-screen fade to a target opacity.
- `clear()`: Remove all created overlays.

`GlobalUI` is a singleton `UIManager` with the default theme.

Security note: theme and option color values are assigned through the DOM CSSOM (never concatenated into raw CSS strings), so untrusted color inputs cannot break out of style rules.

---

## 7. `@kairo/geometry`

Reusable procedural geometry builders — one-line meshes so examples stop hand-writing `BufferGeometry` math. Every helper returns a ready-to-use `THREE.Object3D` with shadows and a standard PBR material configured; add it to `app.scene` yourself.

### Primitives
All primitives accept the shared `PrimitiveOptions`: `position`, `rotation`, `scale`, `color`, `roughness`, `metalness`, `emissive`, `emissiveIntensity`, `transparent`, `opacity`, `side`, `castShadow`, `receiveShadow`, or a prebuilt `material`.

- `createBlock([w, h, d], opts?): THREE.Mesh` — Box.
- `createSphere(radius, opts?): THREE.Mesh` — UV sphere.
- `createPlane(width, height, opts?): THREE.Mesh` — Flat ground plane (XZ by default).
- `createCylinder(radiusTop, radiusBottom, height, opts?): THREE.Mesh` — Pillar.
- `createCone(radius, height, opts?): THREE.Mesh` — Spike.
- `createTorus(radius, tube, opts?): THREE.Mesh` — Ring.
- `createCapsule(radius, length, opts?): THREE.Mesh` — Pill.
- `createIcosahedron(radius, detail?, opts?): THREE.Mesh` — Low-poly gem/orb.
- `createDodecahedron(radius, detail?, opts?): THREE.Mesh` — Low-poly rock/crystal.

### Terrain
- `createTerrain(opts): { mesh, geometry, heightAt(x, z), heights }` — Seeded `SimplexNoise` heightmap laid on the XZ plane with per-vertex height gradient colors and computed normals. Options: `size`, `segments`, `seed`, `amplitude`, `frequency`, `octaves`, `persistence`, `position`, `color` / `highColor` (low→high gradient), `roughness`, `metalness`, `wireframe`.
  - `heightAt(x, z): number` — Sample the surface height at world coordinates (position offset applied) so you can scatter trees/rocks/players exactly on the ground.

### Grass
- `createGrassField(opts): THREE.InstancedMesh` — Thousands of tapered blades in a **single draw call**. Options: `count`, `area`, `height: [min, max]`, `width`, `seed`, `color` / `tipColor` (base→tip gradient), `position`, `castShadow`.
  - `heightAt(x, z): number` — Pass the `heightAt` sampler from `createTerrain` and every blade base is pinned 0.03 below the surface height, so grass grows out of rolling terrain instead of hovering over or burying into it (no more "fuzz").

### Physics
- `deriveCollider(mesh: THREE.Object3D): Collider` — Maps a primitive's geometry to a Kairo `Collider` so objects are solid by default: `BoxGeometry` → box, `SphereGeometry` / `Icosahedron` / `Dodecahedron` → sphere, `Capsule` / `Cylinder` / `Cone` → capsule, `Torus` → box, anything else → box fitted to its world bounding box. Sizes respect the mesh's world scale. Pure and engine-free — registering the body in a `PhysicsWorld` is the caller's job (usually done via `KairoApp.attachPhysics`).

### Scenery
- `createTree(opts): THREE.Group` — Low-poly trunk + dodecahedron canopy (+ secondary blob). Options: `position`, `scale`, `seed`, `trunkColor`, `canopyColor`, `trunkHeight`, `trunkRadius`, `canopyRadius`.
- `createRock(opts): THREE.Mesh` — Perturbed dodecahedron. Options: `position`, `scale`, `seed`, `color`, `radius`.
- `createCloud(opts): THREE.Group` — Overlapping flattened spheres. Options: `position`, `scale`, `color`.

> All geometry is generated in code (no asset URLs needed) — same seed → identical geometry, so levels can be generated deterministically.
