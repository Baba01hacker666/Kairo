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
- `app.quests`: `QuestSystem` — declarative quest & objective tracking.
- `app.dialogue`: `DialogueSystem` — branching dialogue with typewriter & choices.
- `app.combat`: `CombatSystem` — entity health registry & damage events.
- `app.tweens`: `TweenManager` — eased tweens for numeric properties (auto-ticked every frame).
- `app.cameraFX`: `CameraFX` — tween-based camera shake, fov zoom, moveTo, and smooth lookAt.

### `QuestSystem`
- `new QuestSystem()`: Quest & objective tracker. Emits `quest_started`, `quest_completed`, `quest_failed`, `objective_progress`, `objective_completed`, `quest_unlocked`.
- `register({ id, title, description?, objectives, prerequisites?, hidden? })`: Define a quest (`objectives: [{ id, text, target? }]`).
- `registerAll(defs)`: Register multiple quests at once.
- `start(id)`: Start a quest (respects prerequisites). Returns `QuestState | null`.
- `advance(id, objectiveId, amount?)` / `setProgress(id, objectiveId, value)`: Update objective progress; objectives & quests auto-complete.
- `complete(id)` / `fail(id)`: Force-complete or fail a quest.
- `get(id)` / `getActive()` / `isActive(id)` / `isCompleted(id)` / `hasUnlocked(id)`: Inspect quest state.
- `getFormattedText(id, objectiveId)` / `getFormattedObjectives(id)`: Objective text with `{current}` / `{total}` placeholders filled with live progress.
- `serialize()` / `deserialize(snapshots)`: Save/load quest state (definitions must be registered first).

### `DialogueSystem`
- `new DialogueSystem()`: Sequential & branching dialogue. Emits `dialogue_started`, `dialogue_line`, `dialogue_ended`, `dialogue_choice_selected`, `dialogue_skipped`.
- `register(id, lines)` / `registerAll(map)`: Register named scripts (`lines: [{ id?, speaker?, avatar?, text, typewriterCps?, choices?, onStart?, onEnd? }]`).
- `play(idOrLines)`: Start a named dialogue or play raw lines.
- `advance()`: Next line (finishes the typewriter effect first if still typing).
- `selectChoice(index)`: Choose an option; jumps to the targeted line (`next` = line id or index, omit/empty to end).
- `skipTyping()` / `stop()`: Reveal text instantly / end the dialogue.
- `update(dt)`: Drive the typewriter effect (auto-ticked via `app.dialogue`).
- `typewriterCps`: Default typing speed in chars/second (`0` disables typing).
- Getters: `isPlaying`, `currentLine`, `currentDialogueId`, `isTyping`, `typedCharacters`, `choices`.

### `HealthComponent` & `CombatSystem`
- `new HealthComponent(max, id?)`: Health pool with events `damaged`, `healed`, `died`, `revived`, `invulnerable_end`.
- `damage(amount, { source?, invulnerabilityDuration?, ignoreInvulnerability? })`: Apply damage (blocked while invulnerable); returns damage dealt.
- `heal(amount)` / `revive(health?)` / `reset()` / `setMax(max, keepRatio?)` / `update(dt)`: Manage the pool.
- `new CombatSystem()`: Named-entity registry. `add(id, max)`, `damage(id, amount)`, `heal(id, amount)`, `revive(id)`, `get(id)`, `unregister(id)`.
- `combat.events`: Forwards `entity_damaged`, `entity_healed`, `entity_died`, `entity_revived` (payloads include `id`).
- `combat.update(dt)`: Ticks invulnerability timers (auto-ticked via `app.combat`).

### `Tween` & `TweenManager`
- `Easing`: Named easings (`linear`, `inQuad`…`inOutBounce`, `outElastic`, `outBack`, …). `getEasing(nameOrFn)` resolves them.
- `new TweenManager()`: Drives tweens; call `update(dt)` each frame (auto-ticked via `app.tweens`).
- `tweens.to(target, { prop: value }, options?)`: Tween from current values.
- `tweens.from(target, { prop: value }, options?)` / `tweens.fromTo(target, from, to, options?)`: Explicit endpoints.
- `TweenOptions`: `{ duration?, delay?, easing?, repeat?, yoyo?, onUpdate?, onComplete? }`.
- Supports scalars, arrays, and nested objects (e.g. `THREE.Vector3` / engine `Vector3`).
- `tween.then(next)`: Chain tweens. `tween.kill()` / `tweens.killAll()`: Cancel.

### `CameraFX`
- `new CameraFX(camera, tweens, config?)`: Tween-based camera effects. `config: { minFov?, maxFov? }`. Works with any camera-like object (position + optional `fov`, `lookAt`, `updateProjectionMatrix`, `getWorldDirection`).
- `shake(intensity, duration, { decay?, axisScale? })`: Decaying random shake. Offsets are applied as per-frame deltas, so it composes with game-driven camera movement and settles back exactly.
- `punchZoom(amount, duration?, easing?)` / `zoomTo(fov, duration?, easing?)`: FOV effects that refresh `updateProjectionMatrix`.
- `moveTo({x, y, z}, duration?, easing?)`: Eased position tween via `app.tweens`.
- `lookAt({x, y, z}, duration?, easing?)`: Smoothly rotates to face a target using the camera's own `lookAt`.
- `stopShake()` / `stopLookAt()` / `update(dt)`: Control and tick (auto-ticked via `app.cameraFX`).

### `InventorySystem` & `InventoryBag`
- `app.inventory`: Global `InventorySystem` managing item definitions, multi-bag containers, and player inventory.
- `defineItem(def)` / `defineItems(defs)`: Register item definitions (`{ id, name, type, maxStack?, slotType?, stats?, onUse?, metadata? }`).
- `createBag(id, options)`: Create or retrieve an `InventoryBag` (`options: { capacity?, maxWeight? }`). Default player bag accessible via `app.inventory.player`.
- `bag.addItem(itemId, count?, customData?)`: Add items with automatic stack merging and empty slot allocation.
- `bag.removeItem(itemId, count?)` / `bag.removeItemAt(slotIndex, count?)`: Remove items from bag or specific slot.
- `bag.swapSlots(fromSlot, toSlot)`: Swap slots or merge identical stackable items.
- `bag.splitStack(fromSlot, toSlot, count)`: Split item stacks across slots.
- `bag.equip(slotIndex, targetSlotType?)` / `bag.unequip(slotType, targetSlotIndex?)`: Equip/unequip items into designated equipment slots (`'weapon'`, `'head'`, `'chest'`, etc.).
- `bag.getTotalStats()`: Sum of all numeric stat bonuses provided by currently equipped gear.
- `bag.useItem(slotIndex, entityId?)`: Execute item `onUse` handler and consume if not cancelled.
- `transferItem(fromBagId, toBagId, fromSlot, count?)`: Transfer items between containers (e.g. looting chests or bank deposits).
- `serialize()` / `deserialize(snapshot)`: Save/load full inventory and equipment state.

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

### `FloatingTextManager` & 3D HUD
- `app.ui.showFloatingNumber({ text, position, color?, isCrit?, fontSize?, durationMs?, camera? })`: Spawn animated 3D-to-screen projected damage/healing numbers with critical strike scaling and upward fade animation.
- `app.ui.createFloatingHealthBar(target3D, options)`: Create an interactive floating health bar billboarded over a 3D target (`options: { max?, current?, width?, height?, color?, offsetY?, camera? }`).
- `handle.setHealth(current, max?)` / `handle.updatePosition(pos)` / `handle.remove()`: Control live floating health bar instances.

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

---

## 6. `@kairo/input`

### `InputManager` & `ComboDetector`
- `app.input`: Unified keyboard, mouse, pointer, touch joystick, and combo system.
- `isKeyDown(code)` / `isActionPressed(action)` / `isActionJustPressed(action)`: Inspect key and action states.
- `app.input.registerCombo(name, sequence, onTrigger?, maxDelayMs?)`: Register fighting game sequences, double-taps, dash triggers, and cheat codes (`sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'KeyB', 'KeyA']`).
- `combos.feed(inputKey, timestamp?)`: Feed input into pattern matcher.
- `combos.events`: Emits `combo_triggered` with matched combo name and sequence.
- `touchJoystickVector`: Real-time normalized 2D movement vector from mobile touch joystick overlay.

---

## 7. `@kairo/ai`

### `StateMachine` (Finite State Machine)
- `new StateMachine(context, options?)`: High-performance Finite State Machine for character controllers, AI behaviors, boss phases, and game loops.
- `fsm.state(name, { onEnter?, onUpdate?, onExit? })`: Register state with lifecycle hooks.
- `fsm.transition(from, to, conditionOrTrigger?, onTransition?)`: Define automatic continuous condition transitions or named event triggers.
- `fsm.setState(name, force?)`: Directly transition between states with validation.
- `fsm.trigger(eventName)`: Fire named event trigger to transition to matching state.
- `fsm.revertToPreviousState()`: Rollback to previous state in history.
- `fsm.update(dt)`: Automatic condition evaluation and active state tick.
- `fsm.timeInState` / `fsm.previousState` / `fsm.history`: State duration and history inspection.

### `PathfindingGrid` & NavMesh
- `new PathfindingGrid(width, height, nodeSize)`: 2D/3D grid pathfinding with obstacle avoidance.
- `findPath(startPos, endPos, options?)`: Supports `'astar'`, `'weighted_astar'`, `'dijkstra'`, `'bidirectional_astar'`, and `'bidirectional_dijkstra'` algorithms with optional diagonal movement.
- `setObstacle(x, z, walkable)`: Toggle grid cell traversability.


