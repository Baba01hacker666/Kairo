## 2024-05-24 - [Avoid Object Allocations on Hot Path Misses]
**Learning:** During physics raycasting, bounding box intersections occur at a very high frequency. The `Ray.intersectBox` previously instantiated multiple `Vector3` and intermediate objects even when a ray missed its target, resulting in major Garbage Collection spikes. Avoid allocating objects when resolving 'miss' or 'default' states in high-frequency queries.
**Action:** Use pre-allocated static constants (like `Ray._missResult`) for returning state from failed high-frequency functions. Replace chained arithmetic methods (`clone().add().scale()`) that implicitly allocate new objects with single `new Object(...)` direct evaluations.

## 2024-08-08 - [Math.hypot vs Explicit Arithmetic in V8]
**Learning:** In JavaScript engines like V8, `Math.hypot` handles internal overflow and underflow scenarios. While accurate, this adds a measurable performance overhead in tight, high-frequency loops (like game distance calculation or frame-by-frame updates) compared to explicit arithmetic (e.g., `Math.sqrt(dx*dx + dy*dy)`).
**Action:** Avoid `Math.hypot` in high-frequency hot paths such as physics calculations, entity distances, and raycasts. Use explicit distance calculations via arithmetic instead.
