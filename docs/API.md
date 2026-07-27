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
- `stop()`: Terminate loop and clean up animation frames.

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
