## 2024-05-24 - [Avoid Object Allocations on Hot Path Misses]
**Learning:** During physics raycasting, bounding box intersections occur at a very high frequency. The `Ray.intersectBox` previously instantiated multiple `Vector3` and intermediate objects even when a ray missed its target, resulting in major Garbage Collection spikes. Avoid allocating objects when resolving 'miss' or 'default' states in high-frequency queries.
**Action:** Use pre-allocated static constants (like `Ray._missResult`) for returning state from failed high-frequency functions. Replace chained arithmetic methods (`clone().add().scale()`) that implicitly allocate new objects with single `new Object(...)` direct evaluations.

## 2024-08-08 - [Math.hypot vs Explicit Arithmetic in V8]
**Learning:** In JavaScript engines like V8, `Math.hypot` handles internal overflow and underflow scenarios. While accurate, this adds a measurable performance overhead in tight, high-frequency loops (like game distance calculation or frame-by-frame updates) compared to explicit arithmetic (e.g., `Math.sqrt(dx*dx + dy*dy)`).
**Action:** Avoid `Math.hypot` in high-frequency hot paths such as physics calculations, entity distances, and raycasts. Use explicit distance calculations via arithmetic instead.

## 2024-11-20 - [Eliminate GC Allocations in Animation Blending]
**Learning:** High-frequency skeletal animation blend trees evaluating clips every frame caused substantial GC spikes by implicitly invoking `.clone()` and allocating intermediate `Vector3` and `Quaternion` instances during interpolation (`lerp`/`slerp`).
**Action:** Pass optional `target` objects to mathematical query and sampling functions on hot paths (e.g., `AnimationClip.samplePosition(time, target)`). Pre-allocate these intermediate targets on classes that orchestrate evaluation (like `BlendTree1D`) to reuse memory buffers continuously rather than churning new objects.

## 2026-08-11 - [Eliminate GC Allocations in Rendering Loops]
**Learning:** High-frequency functions like camera update loops that run every frame can cause significant garbage collection pauses if they allocate new objects (like `new THREE.Vector3()` or `new THREE.Raycaster()`) or use methods that implicitly allocate objects (like `.clone()`).
**Action:** Avoid instantiating new objects in hot paths like the rendering loop. Pre-allocate objects as private instance variables on the class (e.g., `_desiredPos: THREE.Vector3 = new THREE.Vector3()`) and reuse them every frame (e.g., `this._desiredPos.set(...)` and `this._desiredPos.copy(...)`).
