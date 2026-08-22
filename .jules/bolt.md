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

## 2024-12-07 - [Eliminate GC Allocations in Evaluation and Update Loops]
**Learning:** During video timeline evaluations and behavior updates (like pathfinding in ScriptBehavior), allocating new `THREE.Vector3` or implicitly allocating them using methods like `.clone().sub().normalize()` creates unnecessary garbage collection pauses that impact frame rate.
**Action:** Use pre-allocated `THREE.Vector3` instances in class fields or module-scoped variables. Update their values using in-place operations (`.set()`, `.copy()`, `.fromArray()`) or static mathematical logic instead of allocating new objects repeatedly on each tick.

## 2026-08-12 - [Robust Vector/Array Property Normalization Without Allocation]
**Learning:** When hot-path evaluation loops receive position or direction props that may be passed either as `THREE.Vector3` objects or arrays (`[x,y,z]`), index-based access (`prop[0]`) returns `undefined` on `Vector3` instances (propagating `NaN`), while `new THREE.Vector3(...prop)` creates GC pressure.
**Action:** Use zero-allocation normalization helper methods (`_setVector3`) that check `'x' in prop` vs `Array.isArray(prop)` and copy coordinates directly into pre-allocated `Vector3` buffers.

## 2026-08-12 - [Engine-Wide FPS Optimization & GC Elimination]
**Learning:** High-frequency per-frame systems often introduce subtle bottlenecks that cause FPS drops:
1. Particle systems setting `needsUpdate = true` every frame when idle force unnecessary WebGL buffer sub-data uploads to the GPU.
2. Spatial grid collision passes allocating array literal offsets `[0, -1, ...]` inside frame loops generate constant GC pressure for large entity counts.
3. Physics contact pair tracking allocating string key templates (`${a}:${b}`) on every frame tick causes string heap churn.
4. Unbounded fixed update accumulators cause "spiral of death" frame drop cascades during temporary frame hitches.
**Action:**
- Only flag `needsUpdate = true` on `InstancedMesh` attributes when active count > 0 or when clearing active instances.
- Extract loop neighbor offset arrays to module-level `Int8Array` static constants.
- Replace string template keys in high-frequency physics lookup maps with numeric bit-hashed integer keys.
- Clamp `fixedUpdateAccumulator` to a maximum budget (e.g. 5 steps max per frame) to maintain smooth frame rates during spikes.



## 2024-12-08 - [Avoid Object Allocations and Reference Leaks in Hot Paths]
**Learning:** During optimization of physics raycasting methods, allowing a target result to be passed to methods (like `Ray.intersectBox` and `Ray.intersectSphere`) eliminates the garbage collection penalty of returning newly-instantiated `Vector3` and result objects for every hit. However, using `Object.assign` to revert `targetResult` states on 'miss' unintentionally creates shallow reference copies of nested variables in the static miss result. This leaks shared state causing mutations of the static miss result during subsequent hits.
**Action:** When updating target objects without allocating, explicitly reset primitive fields and conditionally apply `Vector3.set` assignments instead of relying on generic shallow-copy utilities like `Object.assign`.

## 2024-12-09 - [Eliminate GC Allocations in Physics Collision Tracking]
**Learning:** During physics simulation, the `collectCollisionEvents` function runs every frame and tracks active collisions. Previously, it instantiated a new `Map` for tracking next active pairs (`new Map()`), allocated an empty array (`this.collisionEvents = []`), and pushed newly allocated arrays of objects per collision into it. This resulted in constant GC churn (Maps and Arrays) every single tick, even though the `collisionEvents` array was never read or used outside of the internal step.
**Action:** Use a pre-allocated class property for tracking next active pairs (e.g. `_nextPairs`), clear it instead of instantiating it, swap map references (`this._nextPairs = this.activePairs`), and avoid building/pushing intermediate arrays for broadcasting events directly to listeners.

## 2024-12-10 - [Eliminate GC Allocations in Spatial Query Methods]
**Learning:** High-frequency spatial query functions like `overlapSphere` and `overlapBox` were instantiating and returning new arrays (`[]`) on every call, leading to continuous garbage collection churn in physics and AI systems during runtime.
**Action:** Add optional `target` array parameters to spatial queries and helper methods to allow callers to pass and reuse pre-allocated array buffers instead of allocating new arrays implicitly on each call.

## 2024-12-11 - [Eliminate Array Allocations in High-Frequency Event Registrations]
**Learning:** During event registration and unregistration, particularly in hot paths like ECS component additions or physics contact tracking, using `Array.prototype.filter()` to remove event listeners creates unnecessary garbage collection churn by implicitly allocating new arrays on every call.
**Action:** Replace `array = array.filter(item => item !== target)` with in-place array modification using `array.splice(array.indexOf(target), 1)` inside event unbind mechanisms (like `EventBus.off()` and `EventBus.emit()` cleanup) to avoid unnecessary allocations.
